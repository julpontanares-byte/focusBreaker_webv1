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
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Mode Label */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-semibold mb-2">
          {modeLabel}
        </p>
        <p className="text-sm text-muted-foreground">
          Session {Math.floor(state.sessionCount / 2) + 1}
        </p>
      </div>

      {/* Large Timer Display */}
      <div className="relative flex aspect-square w-full max-w-[22rem] items-center justify-center">
        {/* Animated Background Gradient */}
        <div
          className={`absolute inset-6 rounded-full bg-gradient-to-br ${modeColor} opacity-15 blur-3xl animate-pulse`}
        />

        {/* Progress Ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 300 300">
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
          <p className="font-mono text-6xl font-black tracking-tight text-foreground leading-none mb-2 sm:text-7xl">
            {formatTime(state.timeRemaining)}
          </p>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Remaining</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={state.isRunning ? pauseTimer : startTimer}
          size="lg"
          className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 hover:bg-primary/90"
          title={state.isRunning ? 'Pause' : 'Start'}
        >
          {state.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>

        <Button
          onClick={resetTimer}
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-border/80 bg-background/70 shadow-sm transition-transform hover:scale-105 hover:bg-accent/20"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Status Text */}
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        {state.isRunning ? 'Timer is running' : 'Click play to start'}
      </p>
    </div>
  )
}
