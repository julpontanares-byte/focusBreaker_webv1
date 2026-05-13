'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TimerDisplay } from '@/components/timer-display'
import { TimerActions } from '@/components/timer-actions'
import { Button } from '@/components/ui/button'
import { Settings, Clock, BarChart3 } from 'lucide-react'

export default function TimerPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-8rem] h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute right-[-6rem] top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/timer" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground">focusBreaker</h1>
              <p className="text-xs text-muted-foreground">Student focus dashboard</p>
            </div>
          </Link>

          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full border-border/80 bg-background/80">
              <Link href="/timer/history">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full border-border/80 bg-background/80">
              <Link href="/timer/analytics">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full border-border/80 bg-background/80">
              <Link href="/timer/settings">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Today</p>
            <p className="mt-2 text-2xl font-black text-foreground">Build momentum</p>
            <p className="mt-2 text-sm text-muted-foreground">Start a work session, pause when needed, and keep your flow visible.</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Focus</p>
            <p className="mt-2 text-2xl font-black text-foreground">One task at a time</p>
            <p className="mt-2 text-sm text-muted-foreground">Use quick actions for session skips and break controls without losing context.</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Cloud</p>
            <p className="mt-2 text-2xl font-black text-foreground">Synced & tracked</p>
            <p className="mt-2 text-sm text-muted-foreground">Your settings and session data stay ready for local use and deployment demos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <div className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] backdrop-blur-xl md:p-10">
              <TimerDisplay />
            </div>
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <TimerActions />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
