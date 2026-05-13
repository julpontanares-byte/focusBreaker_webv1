// localStorage management for focusBreaker timer app

import { TimerSettings, TimerSession, DailyStats, DEFAULT_SETTINGS } from './timer-types'

const STORAGE_KEYS = {
  SETTINGS: 'fb_timer_settings',
  SESSIONS: 'fb_timer_sessions',
  DAILY_STATS: 'fb_timer_daily_stats',
}

export class TimerStorageManager {
  // Settings
  static getSettings(): TimerSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  }

  static saveSettings(settings: TimerSettings): void {
    try {
      settings.lastModified = new Date().toISOString()
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('[v0] Failed to save settings:', error)
    }
  }

  static resetSettings(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS)
  }

  // Sessions
  static getSessions(limit?: number): TimerSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS)
      const sessions: TimerSession[] = stored ? JSON.parse(stored) : []
      return limit ? sessions.slice(-limit) : sessions
    } catch {
      return []
    }
  }

  static addSession(session: TimerSession): void {
    try {
      const sessions = this.getSessions()
      sessions.push(session)
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    } catch (error) {
      console.error('[v0] Failed to save session:', error)
    }
  }

  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions().filter((s) => s.id !== sessionId)
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    } catch (error) {
      console.error('[v0] Failed to delete session:', error)
    }
  }

  static clearAllSessions(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
  }

  // Daily Stats
  static getDailyStats(date: string): DailyStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_STATS)
      const allStats: Record<string, DailyStats> = stored ? JSON.parse(stored) : {}
      return (
        allStats[date] || {
          date,
          sessionsCompleted: 0,
          sessionSkipped: 0,
          totalFocusMinutes: 0,
          breaksTaken: 0,
          compliancePercent: 0,
          perfectSessions: 0,
        }
      )
    } catch {
      return {
        date,
        sessionsCompleted: 0,
        sessionSkipped: 0,
        totalFocusMinutes: 0,
        breaksTaken: 0,
        compliancePercent: 0,
        perfectSessions: 0,
      }
    }
  }

  static saveDailyStats(stats: DailyStats): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_STATS)
      const allStats: Record<string, DailyStats> = stored ? JSON.parse(stored) : {}
      allStats[stats.date] = stats
      localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(allStats))
    } catch (error) {
      console.error('[v0] Failed to save daily stats:', error)
    }
  }

  static getAllStats(): Record<string, DailyStats> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_STATS)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  // Utilities
  static getSessionsByDate(date: string): TimerSession[] {
    const sessions = this.getSessions()
    return sessions.filter((s) => new Date(s.startTime).toDateString() === new Date(date).toDateString())
  }

  static getTodaySessions(): TimerSession[] {
    const today = new Date().toDateString()
    return this.getSessionsByDate(today)
  }

  static exportData(): string {
    const data = {
      settings: this.getSettings(),
      sessions: this.getSessions(),
      stats: this.getAllStats(),
      exportDate: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings))
      if (data.sessions) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions))
      if (data.stats) localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(data.stats))
      return true
    } catch (error) {
      console.error('[v0] Failed to import data:', error)
      return false
    }
  }

  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS)
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
    localStorage.removeItem(STORAGE_KEYS.DAILY_STATS)
  }
}
