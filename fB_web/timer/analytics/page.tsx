'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TimerStorageManager } from '@/lib/timer-storage'
import { TimerSession } from '@/lib/timer-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Zap, Calendar, Target } from 'lucide-react'

interface Stats {
  totalSessions: number
  focusHours: number
  currentStreak: number
  breakCompliance: number
  perfectSessions: number
  totalBreaks: number
  avgSessionLength: number
  thisWeek: number[]
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    focusHours: 0,
    currentStreak: 0,
    breakCompliance: 0,
    perfectSessions: 0,
    totalBreaks: 0,
    avgSessionLength: 0,
    thisWeek: [0, 0, 0, 0, 0, 0, 0],
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    calculateStats()
  }, [])

  const calculateStats = () => {
    const allSessions = TimerStorageManager.getSessions()
    const workSessions = allSessions.filter((s) => s.mode === 'work')

    const totalSessions = workSessions.length
    const focusMinutes = workSessions.reduce((sum, s) => sum + s.duration, 0)
    const focusHours = Math.round((focusMinutes / 60) * 10) / 10

    // Calculate current streak
    let currentStreak = 0
    let currentDate = new Date()
    const sessionDates = new Set(workSessions.map((s) => new Date(s.startTime).toDateString()))

    while (sessionDates.has(currentDate.toDateString())) {
      currentStreak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // Calculate break compliance
    const perfectSessions = workSessions.filter((s) => s.quality === 'perfect').length
    const breakCompliance = totalSessions > 0 ? Math.round((perfectSessions / totalSessions) * 100) : 0

    // Calculate break count
    const breakSessions = allSessions.filter((s) => s.mode !== 'work')
    const totalBreaks = breakSessions.length

    const avgSessionLength = totalSessions > 0 ? Math.round(focusMinutes / totalSessions) : 0

    // Calculate this week's data
    const thisWeek = [0, 0, 0, 0, 0, 0, 0]
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toDateString()
      thisWeek[6 - i] = workSessions.filter((s) => new Date(s.startTime).toDateString() === dayStr).length
    }

    setStats({
      totalSessions,
      focusHours,
      currentStreak,
      breakCompliance,
      perfectSessions,
      totalBreaks,
      avgSessionLength,
      thisWeek,
    })
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/timer">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Primary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Sessions"
            value={stats.totalSessions}
            icon={<Target className="w-5 h-5 text-primary" />}
          />
          <StatCard
            label="Focus Hours"
            value={`${stats.focusHours}h`}
            icon={<Zap className="w-5 h-5 text-secondary" />}
          />
          <StatCard
            label="Current Streak"
            value={`${stats.currentStreak}d`}
            icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
            highlight={stats.currentStreak > 0}
          />
          <StatCard
            label="Compliance"
            value={`${stats.breakCompliance}%`}
            icon={<Calendar className="w-5 h-5 text-green-600" />}
            highlight={stats.breakCompliance >= 80}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Perfect Sessions" value={stats.perfectSessions} />
          <StatCard label="Breaks Taken" value={stats.totalBreaks} />
          <StatCard label="Avg Session" value={`${stats.avgSessionLength}m`} />
        </div>

        {/* Week Overview */}
        <Card className="p-6 bg-card border border-border rounded-lg">
          <h2 className="text-lg font-bold text-foreground mb-6">This Week</h2>
          <div className="flex items-end gap-2 h-48 justify-between">
            {stats.thisWeek.map((count, index) => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              const maxValue = Math.max(...stats.thisWeek, 1)
              return (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-secondary to-primary rounded-t transition-all"
                    style={{
                      height: `${(count / maxValue) * 160}px` || '8px',
                      minHeight: '8px',
                    }}
                  />
                  <p className="text-xs text-muted-foreground font-semibold">{days[index]}</p>
                  <p className="text-xs font-mono font-bold text-foreground">{count}</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Insights */}
        <Card className="p-6 bg-card border border-border rounded-lg space-y-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Insights</h2>
          <div className="space-y-3">
            {stats.breakCompliance >= 80 ? (
              <p className="text-sm text-green-600 flex items-start gap-2">
                <span className="font-bold">Excellent!</span> Your break compliance is outstanding at {stats.breakCompliance}%
              </p>
            ) : stats.breakCompliance >= 60 ? (
              <p className="text-sm text-amber-600 flex items-start gap-2">
                <span className="font-bold">Good progress!</span> Keep taking breaks regularly to reach 80%+ compliance
              </p>
            ) : (
              <p className="text-sm text-amber-600 flex items-start gap-2">
                <span className="font-bold">Focus on breaks!</span> Taking breaks will improve your session quality
              </p>
            )}

            {stats.currentStreak > 0 && (
              <p className="text-sm text-primary flex items-start gap-2">
                <span className="font-bold">Keep it up!</span> You have a {stats.currentStreak}-day streak going!
              </p>
            )}

            {stats.totalSessions > 0 && (
              <p className="text-sm text-foreground flex items-start gap-2">
                <span className="font-bold">Total effort:</span> You've completed {stats.totalSessions} sessions and accumulated{' '}
                {stats.focusHours} hours of focused work
              </p>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  highlight?: boolean
}) {
  return (
    <Card
      className={`p-4 border rounded-lg transition-colors ${
        highlight ? 'bg-primary/10 border-primary/30 hover:bg-primary/20' : 'bg-card border-border hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">{label}</p>
          <p className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
        </div>
        {icon && <div className="flex-shrink-0">{icon}</div>}
      </div>
    </Card>
  )
}
