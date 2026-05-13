// Timer and session types for focusBreaker standalone app

export type SessionMode = 'work' | 'short-break' | 'long-break'
export type SessionQuality = 'perfect' | 'good' | 'skipped'

export interface TimerSettings {
  workDuration: number // minutes
  shortBreak: number // minutes
  longBreak: number // minutes
  sessionsBeforeLongBreak: number // cycles
  soundEnabled: boolean
  notificationEnabled: boolean
  theme: 'light' | 'dark'
  autoStartNextSession: boolean
  lastModified: string
}

export interface TimerSession {
  id: string
  mode: SessionMode
  duration: number // minutes
  startTime: string // ISO string
  endTime?: string // ISO string
  skipped: boolean
  quality: SessionQuality
  completed: boolean
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  sessionsCompleted: number
  sessionSkipped: number
  totalFocusMinutes: number
  breaksTaken: number
  compliancePercent: number
  perfectSessions: number
}

export interface TimerState {
  currentMode: SessionMode
  isRunning: boolean
  timeRemaining: number // seconds
  totalTime: number // seconds
  sessionCount: number // sessions completed in current cycle
  currentSession?: TimerSession
  settings: TimerSettings
}

export const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  notificationEnabled: true,
  theme: 'light',
  autoStartNextSession: false,
  lastModified: new Date().toISOString(),
}
