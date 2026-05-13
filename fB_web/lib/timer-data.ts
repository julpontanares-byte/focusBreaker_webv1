import type { DailyStats, TimerSession, TimerSettings } from './timer-types'

export interface TimerSnapshot {
  settings: TimerSettings
  sessions: TimerSession[]
  stats: Record<string, DailyStats>
  exportDate?: string
  updatedAt?: string
}

export function createEmptyTimerSnapshot(): TimerSnapshot {
  return {
    settings: {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      sessionsBeforeLongBreak: 4,
      soundEnabled: true,
      notificationEnabled: true,
      theme: 'light',
      autoStartNextSession: false,
      lastModified: new Date().toISOString(),
    },
    sessions: [],
    stats: {},
    exportDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}