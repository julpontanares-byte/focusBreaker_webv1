import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { TimerState, TimerSession, SessionMode, DEFAULT_SETTINGS } from './timer-types'
import { TimerStorageManager } from './timer-storage'

interface TimerContextType {
  state: TimerState
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipSession: () => void
  takeBreak: (breakType: 'short' | 'long') => void
  snooze: (minutes: number) => void
  updateSettings: (settings: any) => void
  playNotification: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>(() => ({
    currentMode: 'work',
    isRunning: false,
    timeRemaining: 25 * 60,
    totalTime: 25 * 60,
    sessionCount: 0,
    settings: TimerStorageManager.getSettings(),
  }))

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationRef = useRef<HTMLAudioElement | null>(null)

  // Load audio element for notifications
  useEffect(() => {
    notificationRef.current = new Audio('/notification.mp3')
  }, [])

  // Timer countdown effect
  useEffect(() => {
    if (!state.isRunning) return

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const newRemaining = prev.timeRemaining - 1

        if (newRemaining <= 0) {
          // Session complete
          playNotification()
          return handleSessionComplete(prev)
        }

        return { ...prev, timeRemaining: newRemaining }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isRunning])

  const playNotification = () => {
    if (state.settings.soundEnabled && notificationRef.current) {
      notificationRef.current.play().catch(() => {
        // Fallback: use Web Audio API for notification
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      })
    }

    if (state.settings.notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('focusBreaker', {
        body: `${state.currentMode === 'work' ? 'Work' : 'Break'} session complete!`,
        icon: '/icon.png',
      })
    }
  }

  const handleSessionComplete = (prevState: TimerState): TimerState => {
    const session: TimerSession = {
      id: `${Date.now()}`,
      mode: prevState.currentMode,
      duration: prevState.settings[
        prevState.currentMode === 'work'
          ? 'workDuration'
          : prevState.currentMode === 'short-break'
            ? 'shortBreak'
            : 'longBreak'
      ],
      startTime: new Date(Date.now() - prevState.totalTime * 1000).toISOString(),
      endTime: new Date().toISOString(),
      skipped: false,
      quality: 'perfect',
      completed: true,
    }

    TimerStorageManager.addSession(session)

    // Determine next mode
    let nextMode: SessionMode = 'work'
    let nextSessionCount = prevState.sessionCount

    if (prevState.currentMode === 'work') {
      nextSessionCount += 1
      if (nextSessionCount % prevState.settings.sessionsBeforeLongBreak === 0) {
        nextMode = 'long-break'
      } else {
        nextMode = 'short-break'
      }
    } else {
      nextMode = 'work'
    }

    const nextDuration =
      nextMode === 'work'
        ? prevState.settings.workDuration
        : nextMode === 'short-break'
          ? prevState.settings.shortBreak
          : prevState.settings.longBreak

    return {
      ...prevState,
      currentMode: nextMode,
      timeRemaining: nextDuration * 60,
      totalTime: nextDuration * 60,
      sessionCount: nextSessionCount,
      isRunning: prevState.settings.autoStartNextSession,
      currentSession: session,
    }
  }

  const startTimer = () => {
    setState((prev) => ({ ...prev, isRunning: true }))
  }

  const pauseTimer = () => {
    setState((prev) => ({ ...prev, isRunning: false }))
  }

  const resetTimer = () => {
    const duration = state.settings[
      state.currentMode === 'work'
        ? 'workDuration'
        : state.currentMode === 'short-break'
          ? 'shortBreak'
          : 'longBreak'
    ]

    setState((prev) => ({
      ...prev,
      isRunning: false,
      timeRemaining: duration * 60,
      totalTime: duration * 60,
    }))
  }

  const skipSession = () => {
    const session: TimerSession = {
      id: `${Date.now()}`,
      mode: state.currentMode,
      duration: state.settings[
        state.currentMode === 'work'
          ? 'workDuration'
          : state.currentMode === 'short-break'
            ? 'shortBreak'
            : 'longBreak'
      ],
      startTime: new Date(Date.now() - state.totalTime * 1000).toISOString(),
      endTime: new Date().toISOString(),
      skipped: true,
      quality: 'skipped',
      completed: false,
    }

    TimerStorageManager.addSession(session)
    handleSessionComplete(state)
  }

  const takeBreak = (breakType: 'short' | 'long') => {
    const duration = breakType === 'short' ? state.settings.shortBreak : state.settings.longBreak

    setState((prev) => ({
      ...prev,
      currentMode: breakType === 'short' ? 'short-break' : 'long-break',
      timeRemaining: duration * 60,
      totalTime: duration * 60,
      isRunning: false,
    }))
  }

  const snooze = (minutes: number) => {
    setState((prev) => ({
      ...prev,
      timeRemaining: prev.timeRemaining + minutes * 60,
      totalTime: prev.totalTime + minutes * 60,
    }))
  }

  const updateSettings = (newSettings: any) => {
    const updatedSettings = { ...state.settings, ...newSettings }
    TimerStorageManager.saveSettings(updatedSettings)

    setState((prev) => ({
      ...prev,
      settings: updatedSettings,
    }))
  }

  const value: TimerContextType = {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    takeBreak,
    snooze,
    updateSettings,
    playNotification,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider')
  }
  return context
}
