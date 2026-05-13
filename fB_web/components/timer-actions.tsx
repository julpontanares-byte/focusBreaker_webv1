'use client'

import { useTimer } from '@/lib/timer-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SkipForward, Clock, Coffee } from 'lucide-react'

export function TimerActions() {
  const { state, skipSession, takeBreak, snooze } = useTimer()
  const isBreakMode = state.currentMode !== 'work'

  return (
    <Card className="p-6 bg-card border border-border rounded-lg space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</p>

      <div className="grid grid-cols-1 gap-3">
        {/* Skip Session */}
        <Button
          onClick={skipSession}
          variant="outline"
          className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/30"
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
              className="w-full bg-green-100 text-green-700 hover:bg-green-200 border-green-300"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Take 5 min Break
            </Button>

            <Button
              onClick={() => takeBreak('long')}
              variant="outline"
              className="w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300"
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
          className="w-full"
        >
          <Clock className="w-4 h-4 mr-2" />
          Snooze +5m
        </Button>
      </div>
    </Card>
  )
}
