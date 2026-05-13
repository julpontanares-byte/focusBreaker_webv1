/// <reference types="node" />

import { promises as fs } from 'fs'
import path from 'path'
import { createEmptyTimerSnapshot, type TimerSnapshot } from '../timer-data'
import type { DailyStats, SessionMode, TimerSession } from '../timer-types'

const STORE_PATH = path.join(process.cwd(), '.data', 'timer-store.json')
const PROFILE_ID = 'default'
const SQL_CONNECTION_STRING =
  process.env.AZURE_SQL_CONNECTION_STRING ?? process.env.SQL_CONNECTION_STRING ?? process.env.DATABASE_URL ?? ''

type MssqlModule = typeof import('mssql')

let mssqlModulePromise: Promise<MssqlModule> | null = null

async function getMssqlModule() {
  if (!mssqlModulePromise) {
    mssqlModulePromise = import('mssql')
  }

  return mssqlModulePromise
}

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
}

function toSqlDate(dateString: string | undefined) {
  return dateString ? new Date(dateString) : new Date()
}

function normalizeSnapshot(raw: Partial<TimerSnapshot> | null | undefined): TimerSnapshot {
  const defaults = createEmptyTimerSnapshot()

  return {
    settings: raw?.settings ?? defaults.settings,
    sessions: Array.isArray(raw?.sessions) ? raw.sessions : [],
    stats: raw?.stats && typeof raw.stats === 'object' ? raw.stats : {},
    exportDate: raw?.exportDate ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

type SqlTimerSettingsRow = {
  workDuration: number
  shortBreak: number
  longBreak: number
  sessionsBeforeLongBreak: number
  soundEnabled: boolean
  notificationEnabled: boolean
  theme: 'light' | 'dark'
  autoStartNextSession: boolean
  lastModified: string | Date
}

type SqlTimerSessionRow = {
  id: string
  mode: SessionMode
  duration: number
  startTime: string | Date
  endTime: string | Date | null
  skipped: boolean
  quality: TimerSession['quality']
  completed: boolean
}

type SqlTimerStatsRow = {
  date: string | Date
  sessionsCompleted: number
  sessionSkipped: number
  totalFocusMinutes: number
  breaksTaken: number
  compliancePercent: number
  perfectSessions: number
}

type SqlRequest = {
  input: (name: string, type: unknown, value: unknown) => SqlRequest
  query: (sqlText: string) => Promise<unknown>
}

type SqlConnectionPool = {
  request: () => SqlRequest
  close: () => Promise<void>
}

async function ensureSqlSchema(pool: SqlConnectionPool, sql: MssqlModule) {
  await pool
    .request()
    .query(`
      IF OBJECT_ID(N'dbo.TimerProfiles', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.TimerProfiles (
          profileId NVARCHAR(64) NOT NULL CONSTRAINT PK_TimerProfiles PRIMARY KEY,
          displayName NVARCHAR(100) NOT NULL,
          createdAt DATETIME2 NOT NULL CONSTRAINT DF_TimerProfiles_createdAt DEFAULT SYSUTCDATETIME(),
          updatedAt DATETIME2 NOT NULL CONSTRAINT DF_TimerProfiles_updatedAt DEFAULT SYSUTCDATETIME()
        )
      END

      IF OBJECT_ID(N'dbo.TimerSettings', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.TimerSettings (
          profileId NVARCHAR(64) NOT NULL CONSTRAINT PK_TimerSettings PRIMARY KEY,
          workDuration INT NOT NULL,
          shortBreak INT NOT NULL,
          longBreak INT NOT NULL,
          sessionsBeforeLongBreak INT NOT NULL,
          soundEnabled BIT NOT NULL,
          notificationEnabled BIT NOT NULL,
          theme NVARCHAR(16) NOT NULL,
          autoStartNextSession BIT NOT NULL,
          lastModified DATETIME2 NOT NULL,
          updatedAt DATETIME2 NOT NULL CONSTRAINT DF_TimerSettings_updatedAt DEFAULT SYSUTCDATETIME(),
          CONSTRAINT FK_TimerSettings_Profile FOREIGN KEY (profileId)
            REFERENCES dbo.TimerProfiles(profileId)
            ON DELETE CASCADE
        )
      END

      IF OBJECT_ID(N'dbo.TimerSessions', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.TimerSessions (
          id NVARCHAR(64) NOT NULL CONSTRAINT PK_TimerSessions PRIMARY KEY,
          profileId NVARCHAR(64) NOT NULL,
          mode NVARCHAR(20) NOT NULL,
          duration INT NOT NULL,
          startTime DATETIME2 NOT NULL,
          endTime DATETIME2 NULL,
          skipped BIT NOT NULL,
          quality NVARCHAR(20) NOT NULL,
          completed BIT NOT NULL,
          createdAt DATETIME2 NOT NULL CONSTRAINT DF_TimerSessions_createdAt DEFAULT SYSUTCDATETIME(),
          CONSTRAINT FK_TimerSessions_Profile FOREIGN KEY (profileId)
            REFERENCES dbo.TimerProfiles(profileId)
            ON DELETE CASCADE
        )
      END

      IF OBJECT_ID(N'dbo.TimerDailyStats', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.TimerDailyStats (
          profileId NVARCHAR(64) NOT NULL,
          [date] DATE NOT NULL,
          sessionsCompleted INT NOT NULL,
          sessionSkipped INT NOT NULL,
          totalFocusMinutes INT NOT NULL,
          breaksTaken INT NOT NULL,
          compliancePercent INT NOT NULL,
          perfectSessions INT NOT NULL,
          updatedAt DATETIME2 NOT NULL CONSTRAINT DF_TimerDailyStats_updatedAt DEFAULT SYSUTCDATETIME(),
          CONSTRAINT PK_TimerDailyStats PRIMARY KEY (profileId, [date]),
          CONSTRAINT FK_TimerDailyStats_Profile FOREIGN KEY (profileId)
            REFERENCES dbo.TimerProfiles(profileId)
            ON DELETE CASCADE
        )
      END
    `)
}

async function ensureProfile(pool: SqlConnectionPool, sql: MssqlModule) {
  await pool
    .request()
    .input('profileId', sql.NVarChar(64), PROFILE_ID)
    .input('displayName', sql.NVarChar(100), 'Default profile')
    .query(`
      MERGE dbo.TimerProfiles AS target
      USING (SELECT @profileId AS profileId, @displayName AS displayName) AS source
      ON target.profileId = source.profileId
      WHEN MATCHED THEN
        UPDATE SET displayName = source.displayName, updatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (profileId, displayName)
        VALUES (source.profileId, source.displayName);
    `)
}

async function connectSql() {
  if (!SQL_CONNECTION_STRING) {
    return null
  }

  try {
    const sql = await getMssqlModule()
    return await sql.connect(SQL_CONNECTION_STRING)
  } catch (error) {
    console.warn('[focusBreaker] Azure SQL unavailable, using file snapshot store:', error)
    return null
  }
}

async function readSnapshotFromSql(): Promise<TimerSnapshot | null> {
  const pool = await connectSql()

  if (!pool) {
    return null
  }

  try {
    const sql = await getMssqlModule()
    await ensureSqlSchema(pool, sql)
    await ensureProfile(pool, sql)

    const [settingsResult, sessionsResult, statsResult] = await Promise.all([
      pool
        .request()
        .input('profileId', sql.NVarChar(64), PROFILE_ID)
        .query(`SELECT TOP 1 * FROM dbo.TimerSettings WHERE profileId = @profileId`),
      pool
        .request()
        .input('profileId', sql.NVarChar(64), PROFILE_ID)
        .query(`SELECT * FROM dbo.TimerSessions WHERE profileId = @profileId ORDER BY startTime ASC, createdAt ASC`),
      pool
        .request()
        .input('profileId', sql.NVarChar(64), PROFILE_ID)
        .query(`SELECT * FROM dbo.TimerDailyStats WHERE profileId = @profileId ORDER BY [date] ASC`),
    ])

    const settingsRow = settingsResult.recordset[0] as SqlTimerSettingsRow | undefined

    const settings: TimerSnapshot['settings'] = settingsRow
      ? {
          workDuration: Number(settingsRow.workDuration),
          shortBreak: Number(settingsRow.shortBreak),
          longBreak: Number(settingsRow.longBreak),
          sessionsBeforeLongBreak: Number(settingsRow.sessionsBeforeLongBreak),
          soundEnabled: Boolean(settingsRow.soundEnabled),
          notificationEnabled: Boolean(settingsRow.notificationEnabled),
          theme: settingsRow.theme === 'dark' ? 'dark' : 'light',
          autoStartNextSession: Boolean(settingsRow.autoStartNextSession),
          lastModified: new Date(settingsRow.lastModified).toISOString(),
        }
      : createEmptyTimerSnapshot().settings

    const sessions = sessionsResult.recordset.map((row: SqlTimerSessionRow) => ({
      id: String(row.id),
      mode: row.mode,
      duration: Number(row.duration),
      startTime: new Date(row.startTime).toISOString(),
      endTime: row.endTime ? new Date(row.endTime).toISOString() : undefined,
      skipped: Boolean(row.skipped),
      quality: row.quality,
      completed: Boolean(row.completed),
    }))

    const stats: Record<string, DailyStats> = statsResult.recordset.reduce(
      (acc: Record<string, DailyStats>, row: SqlTimerStatsRow) => {
        const dateKey = new Date(row.date).toISOString().slice(0, 10)

        acc[dateKey] = {
          date: dateKey,
          sessionsCompleted: Number(row.sessionsCompleted),
          sessionSkipped: Number(row.sessionSkipped),
          totalFocusMinutes: Number(row.totalFocusMinutes),
          breaksTaken: Number(row.breaksTaken),
          compliancePercent: Number(row.compliancePercent),
          perfectSessions: Number(row.perfectSessions),
        }

        return acc
      },
      {},
    )

    return normalizeSnapshot({ settings, sessions, stats })
  } catch (error) {
    console.warn('[focusBreaker] Failed to read Azure SQL snapshot, falling back to file store:', error)
    return null
  } finally {
    await pool.close().catch(() => undefined)
  }
}

async function writeSnapshotToSql(snapshot: Partial<TimerSnapshot>): Promise<TimerSnapshot | null> {
  const pool = await connectSql()

  if (!pool) {
    return null
  }

  try {
    const sql = await getMssqlModule()
    const normalized = normalizeSnapshot(snapshot)
    await ensureSqlSchema(pool, sql)

    await ensureProfile(pool, sql)

    await pool
      .request()
      .input('profileId', sql.NVarChar(64), PROFILE_ID)
      .input('workDuration', sql.Int, normalized.settings.workDuration)
      .input('shortBreak', sql.Int, normalized.settings.shortBreak)
      .input('longBreak', sql.Int, normalized.settings.longBreak)
      .input('sessionsBeforeLongBreak', sql.Int, normalized.settings.sessionsBeforeLongBreak)
      .input('soundEnabled', sql.Bit, normalized.settings.soundEnabled)
      .input('notificationEnabled', sql.Bit, normalized.settings.notificationEnabled)
      .input('theme', sql.NVarChar(16), normalized.settings.theme)
      .input('autoStartNextSession', sql.Bit, normalized.settings.autoStartNextSession)
      .input('lastModified', sql.DateTime2, toSqlDate(normalized.settings.lastModified))
      .query(`
        MERGE dbo.TimerSettings AS target
        USING (
          SELECT
            @profileId AS profileId,
            @workDuration AS workDuration,
            @shortBreak AS shortBreak,
            @longBreak AS longBreak,
            @sessionsBeforeLongBreak AS sessionsBeforeLongBreak,
            @soundEnabled AS soundEnabled,
            @notificationEnabled AS notificationEnabled,
            @theme AS theme,
            @autoStartNextSession AS autoStartNextSession,
            @lastModified AS lastModified
        ) AS source
        ON target.profileId = source.profileId
        WHEN MATCHED THEN
          UPDATE SET
            workDuration = source.workDuration,
            shortBreak = source.shortBreak,
            longBreak = source.longBreak,
            sessionsBeforeLongBreak = source.sessionsBeforeLongBreak,
            soundEnabled = source.soundEnabled,
            notificationEnabled = source.notificationEnabled,
            theme = source.theme,
            autoStartNextSession = source.autoStartNextSession,
            lastModified = source.lastModified,
            updatedAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (
            profileId,
            workDuration,
            shortBreak,
            longBreak,
            sessionsBeforeLongBreak,
            soundEnabled,
            notificationEnabled,
            theme,
            autoStartNextSession,
            lastModified
          )
          VALUES (
            source.profileId,
            source.workDuration,
            source.shortBreak,
            source.longBreak,
            source.sessionsBeforeLongBreak,
            source.soundEnabled,
            source.notificationEnabled,
            source.theme,
            source.autoStartNextSession,
            source.lastModified
          );
      `)

    const sessionRequest = pool.request().input('profileId', sql.NVarChar(64), PROFILE_ID)
    await sessionRequest.query(`DELETE FROM dbo.TimerSessions WHERE profileId = @profileId`)

    for (const session of normalized.sessions) {
      await pool
        .request()
        .input('profileId', sql.NVarChar(64), PROFILE_ID)
        .input('id', sql.NVarChar(64), session.id)
        .input('mode', sql.NVarChar(20), session.mode)
        .input('duration', sql.Int, session.duration)
        .input('startTime', sql.DateTime2, toSqlDate(session.startTime))
        .input('endTime', sql.DateTime2, session.endTime ? toSqlDate(session.endTime) : null)
        .input('skipped', sql.Bit, session.skipped)
        .input('quality', sql.NVarChar(20), session.quality)
        .input('completed', sql.Bit, session.completed)
        .query(`
          INSERT INTO dbo.TimerSessions (
            id,
            profileId,
            mode,
            duration,
            startTime,
            endTime,
            skipped,
            quality,
            completed
          ) VALUES (
            @id,
            @profileId,
            @mode,
            @duration,
            @startTime,
            @endTime,
            @skipped,
            @quality,
            @completed
          )
        `)
    }

    const statsRequest = pool.request().input('profileId', sql.NVarChar(64), PROFILE_ID)
    await statsRequest.query(`DELETE FROM dbo.TimerDailyStats WHERE profileId = @profileId`)

    for (const stat of Object.values(normalized.stats)) {
      await pool
        .request()
        .input('profileId', sql.NVarChar(64), PROFILE_ID)
        .input('date', sql.Date, new Date(stat.date))
        .input('sessionsCompleted', sql.Int, stat.sessionsCompleted)
        .input('sessionSkipped', sql.Int, stat.sessionSkipped)
        .input('totalFocusMinutes', sql.Int, stat.totalFocusMinutes)
        .input('breaksTaken', sql.Int, stat.breaksTaken)
        .input('compliancePercent', sql.Int, stat.compliancePercent)
        .input('perfectSessions', sql.Int, stat.perfectSessions)
        .query(`
          INSERT INTO dbo.TimerDailyStats (
            profileId,
            [date],
            sessionsCompleted,
            sessionSkipped,
            totalFocusMinutes,
            breaksTaken,
            compliancePercent,
            perfectSessions
          ) VALUES (
            @profileId,
            @date,
            @sessionsCompleted,
            @sessionSkipped,
            @totalFocusMinutes,
            @breaksTaken,
            @compliancePercent,
            @perfectSessions
          )
        `)
    }

    return normalized
  } catch (error) {
    console.warn('[focusBreaker] Failed to write Azure SQL snapshot, falling back to file store:', error)
    return null
  } finally {
    await pool.close().catch(() => undefined)
  }
}

async function clearSnapshotFromSql(): Promise<TimerSnapshot | null> {
  const pool = await connectSql()

  if (!pool) {
    return null
  }

  try {
    const sql = await getMssqlModule()
    await ensureSqlSchema(pool, sql)
    await ensureProfile(pool, sql)

    await pool
      .request()
      .input('profileId', sql.NVarChar(64), PROFILE_ID)
      .query(`DELETE FROM dbo.TimerSessions WHERE profileId = @profileId`)

    await pool
      .request()
      .input('profileId', sql.NVarChar(64), PROFILE_ID)
      .query(`DELETE FROM dbo.TimerDailyStats WHERE profileId = @profileId`)

    await pool
      .request()
      .input('profileId', sql.NVarChar(64), PROFILE_ID)
      .query(`DELETE FROM dbo.TimerSettings WHERE profileId = @profileId`)

    await pool
      .request()
      .input('profileId', sql.NVarChar(64), PROFILE_ID)
      .query(`DELETE FROM dbo.TimerProfiles WHERE profileId = @profileId`)

    return createEmptyTimerSnapshot()
  } catch (error) {
    console.warn('[focusBreaker] Failed to clear Azure SQL snapshot, falling back to file store:', error)
    return null
  } finally {
    await pool.close().catch(() => undefined)
  }
}

async function readSnapshotFromFile(): Promise<TimerSnapshot> {
  try {
    const file = await fs.readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(file) as Partial<TimerSnapshot>
    return normalizeSnapshot(parsed)
  } catch {
    return createEmptyTimerSnapshot()
  }
}

async function writeSnapshotToFile(snapshot: Partial<TimerSnapshot>): Promise<TimerSnapshot> {
  const normalized = normalizeSnapshot(snapshot)
  await ensureStoreDir()
  await fs.writeFile(STORE_PATH, JSON.stringify(normalized, null, 2), 'utf8')
  return normalized
}

async function clearSnapshotFromFile(): Promise<TimerSnapshot> {
  const snapshot = createEmptyTimerSnapshot()

  try {
    await fs.rm(STORE_PATH, { force: true })
  } catch {
    // Ignore cleanup issues; we still return a clean in-memory snapshot.
  }

  return snapshot
}

export async function readTimerSnapshot(): Promise<TimerSnapshot> {
  const sqlSnapshot = await readSnapshotFromSql()
  if (sqlSnapshot) {
    return sqlSnapshot
  }

  return readSnapshotFromFile()
}

export async function writeTimerSnapshot(snapshot: Partial<TimerSnapshot>): Promise<TimerSnapshot> {
  const sqlSnapshot = await writeSnapshotToSql(snapshot)
  if (sqlSnapshot) {
    return sqlSnapshot
  }

  return writeSnapshotToFile(snapshot)
}

export async function clearTimerSnapshot(): Promise<TimerSnapshot> {
  const sqlSnapshot = await clearSnapshotFromSql()
  if (sqlSnapshot) {
    return sqlSnapshot
  }

  return clearSnapshotFromFile()
}