import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { TimerState, TimerSession, SessionMode, DEFAULT_SETTINGS } from './timer-types'
import { TimerStorageManager } from './timer-storage'
import { fetchTimerSnapshot } from './timer-api'

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

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Hydrate from server snapshot when available so the client reflects cloud state.
  useEffect(() => {
    let cancelled = false

    const hydrateFromServer = async () => {
      const snapshot = await fetchTimerSnapshot()

      if (!snapshot || cancelled) {
        return
      }

      TimerStorageManager.importData(JSON.stringify(snapshot), false)

      setState((prev: TimerState) => ({
        ...prev,
        settings: snapshot.settings ?? prev.settings,
      }))
    }

    void hydrateFromServer()

    return () => {
      cancelled = true
    }
  }, [])

  // Timer countdown effect
  useEffect(() => {
    if (!state.isRunning) return

    intervalRef.current = setInterval(() => {
      setState((prev: TimerState) => {
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

  const playNotification = useCallback(() => {
    if (state.settings.soundEnabled) {
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
    }

    if (state.settings.notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('focusBreaker', {
        body: `${state.currentMode === 'work' ? 'Work' : 'Break'} session complete!`,
        icon: '/icon.png',
      })
    }
  }, [state.currentMode, state.settings.notificationEnabled, state.settings.soundEnabled])

  const handleSessionComplete = useCallback((prevState: TimerState): TimerState => {
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
  }, [state.settings.autoStartNextSession, state.settings.longBreak, state.settings.sessionsBeforeLongBreak, state.settings.shortBreak, state.settings.workDuration])

  const startTimer = () => {
    setState((prev: TimerState) => ({ ...prev, isRunning: true }))
  }

  const pauseTimer = () => {
    setState((prev: TimerState) => ({ ...prev, isRunning: false }))
  }

  const resetTimer = () => {
    const duration = state.settings[
      state.currentMode === 'work'
        ? 'workDuration'
        : state.currentMode === 'short-break'
          ? 'shortBreak'
          : 'longBreak'
    ]

    setState((prev: TimerState) => ({
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

    setState((prev: TimerState) => {
      const completedState = handleSessionComplete(prev)
      return {
        ...completedState,
        isRunning: false,
        currentSession: session,
      }
    })
  }

  const takeBreak = (breakType: 'short' | 'long') => {
    const duration = breakType === 'short' ? state.settings.shortBreak : state.settings.longBreak

    setState((prev: TimerState) => ({
      ...prev,
      currentMode: breakType === 'short' ? 'short-break' : 'long-break',
      timeRemaining: duration * 60,
      totalTime: duration * 60,
      isRunning: false,
    }))
  }

  const snooze = (minutes: number) => {
    setState((prev: TimerState) => ({
      ...prev,
      timeRemaining: prev.timeRemaining + minutes * 60,
      totalTime: prev.totalTime + minutes * 60,
    }))
  }

  const updateSettings = (newSettings: any) => {
    const updatedSettings = { ...state.settings, ...newSettings }
    TimerStorageManager.saveSettings(updatedSettings)

    setState((prev: TimerState) => ({
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
