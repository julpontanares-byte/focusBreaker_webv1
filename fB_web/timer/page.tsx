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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/timer" className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">focusBreaker</h1>
          </Link>

          <div className="flex gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/timer/history">
                <Clock className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/timer/analytics">
                <BarChart3 className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Link href="/timer/settings">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Display (Main) */}
          <div className="lg:col-span-2">
            <TimerDisplay />
          </div>

          {/* Quick Actions (Sidebar) */}
          <div className="lg:col-span-1">
            <TimerActions />
          </div>
        </div>
      </div>
    </main>
  )
}
