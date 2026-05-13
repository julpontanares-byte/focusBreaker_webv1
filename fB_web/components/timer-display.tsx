'use client'

import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Pause, Play, RotateCcw } from 'lucide-react'

export function TimerDisplay() {
  const { state, startTimer, pauseTimer, resetTimer } = useTimer()

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = (state.timeRemaining / state.totalTime) * 100
  const modeLabel =
    state.currentMode === 'work'
      ? 'Focus'
      : state.currentMode === 'short-break'
        ? 'Short Break'
        : 'Long Break'

  const modeColor =
    state.currentMode === 'work' ? 'from-primary to-secondary' : 'from-green-600 to-emerald-600'

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      {/* Mode Label */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold mb-2">
          {modeLabel}
        </p>
        <p className="text-muted-foreground text-xs">
          Session {Math.floor(state.sessionCount / 2) + 1}
        </p>
      </div>

      {/* Large Timer Display */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Animated Background Gradient */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${modeColor} opacity-10 blur-2xl animate-pulse`}
        />

        {/* Progress Ring */}
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 300 300">
          {/* Background ring */}
          <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />

          {/* Progress ring */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={state.currentMode === 'work' ? 'text-primary' : 'text-green-600'}
            strokeDasharray={`${2 * Math.PI * 140}`}
            strokeDashoffset={`${2 * Math.PI * 140 * (1 - progressPercent / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Timer Text */}
        <div className="relative z-10 text-center">
          <p className="font-mono text-7xl font-bold text-foreground leading-none mb-2">
            {formatTime(state.timeRemaining)}
          </p>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Remaining</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={state.isRunning ? pauseTimer : startTimer}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-16 h-16 flex items-center justify-center p-0"
          title={state.isRunning ? 'Pause' : 'Start'}
        >
          {state.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>

        <Button
          onClick={resetTimer}
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 flex items-center justify-center p-0"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Status Text */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        {state.isRunning ? 'Timer is running' : 'Click play to start'}
      </p>
    </div>
  )
}
