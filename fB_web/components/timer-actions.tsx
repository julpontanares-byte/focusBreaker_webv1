'use client'

import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SkipForward, Clock, Coffee } from 'lucide-react'

export function TimerActions() {
  const { state, skipSession, takeBreak, snooze } = useTimer()

  const actionButtonClass = 'w-full justify-start rounded-2xl border-border/80 bg-background/70 px-4 py-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent/20 hover:shadow-md'

  return (
    <Card className="space-y-4 border-0 bg-transparent p-0 shadow-none">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Quick Actions</p>
        <p className="mt-2 text-sm text-muted-foreground">Use these controls to manage the current session without losing momentum.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Skip Session */}
        <Button
          onClick={skipSession}
          variant="outline"
          className={`${actionButtonClass} text-destructive hover:text-destructive`}
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip {state.currentMode === 'work' ? 'Session' : 'Break'}
        </Button>

        {/* Take Break (if in work mode) */}
        {state.currentMode === 'work' && (
          <>
            <Button
              onClick={() => takeBreak('short')}
              variant="outline"
              className={actionButtonClass}
            >
              <Coffee className="w-4 h-4 mr-2" />
              Take 5 min Break
            </Button>

            <Button
              onClick={() => takeBreak('long')}
              variant="outline"
              className={actionButtonClass}
            >
              <Coffee className="w-4 h-4 mr-2" />
              Take Long Break
            </Button>
          </>
        )}

        {/* Snooze */}
        <Button
          onClick={() => snooze(5)}
          variant="secondary"
          className="w-full justify-start rounded-2xl px-4 py-6 text-left shadow-sm transition-all hover:-translate-y-0.5"
        >
          <Clock className="w-4 h-4 mr-2" />
          Snooze +5m
        </Button>
      </div>
    </Card>
  )
}
