-- focusBreaker Azure SQL schema
-- Single-profile demo design for the Student Focus & Productivity Tracker

CREATE TABLE dbo.TimerProfiles (
  profileId NVARCHAR(64) NOT NULL CONSTRAINT PK_TimerProfiles PRIMARY KEY,
  displayName NVARCHAR(100) NOT NULL,
  createdAt DATETIME2 NOT NULL CONSTRAINT DF_TimerProfiles_createdAt DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 NOT NULL CONSTRAINT DF_TimerProfiles_updatedAt DEFAULT SYSUTCDATETIME()
)

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
-- focusBreaker Azure SQL schema
--
-- Design goals:
-- - Keep the demo app simple with a single default profile
-- - Normalize the core entities so sessions, settings, and daily stats can grow independently
-- - Preserve offline-first behavior by allowing the app to fall back to file storage in development
--
-- Profile strategy:
-- - The current app uses a single logical profile with profileId = 'default'
-- - This can later be replaced with a real authenticated user/tenant identifier

CREATE TABLE dbo.TimerProfiles (
  profileId NVARCHAR(64) NOT NULL PRIMARY KEY,
  displayName NVARCHAR(100) NOT NULL,
  createdAt DATETIME2 NOT NULL CONSTRAINT DF_TimerProfiles_createdAt DEFAULT SYSUTCDATETIME(),
  updatedAt DATETIME2 NOT NULL CONSTRAINT DF_TimerProfiles_updatedAt DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.TimerSettings (
  profileId NVARCHAR(64) NOT NULL PRIMARY KEY,
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
);

CREATE TABLE dbo.TimerSessions (
  id NVARCHAR(64) NOT NULL PRIMARY KEY,
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
);

CREATE INDEX IX_TimerSessions_Profile_StartTime
  ON dbo.TimerSessions (profileId, startTime DESC);

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
);

-- Seed row used by the current demo app
MERGE dbo.TimerProfiles AS target
USING (SELECT 'default' AS profileId, 'Default profile' AS displayName) AS source
ON target.profileId = source.profileId
WHEN MATCHED THEN
  UPDATE SET displayName = source.displayName, updatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (profileId, displayName)
  VALUES (source.profileId, source.displayName);