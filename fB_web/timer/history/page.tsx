'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TimerStorageManager } from '@/lib/timer-storage'
import { TimerSession } from '@/lib/timer-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function HistoryPage() {
  const [filter, setFilter] = useState<'today' | 'all'>('today')
  const [sessions, setSessions] = useState<TimerSession[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadSessions()
  }, [filter])

  const loadSessions = () => {
    const allSessions = TimerStorageManager.getSessions()
    if (filter === 'today') {
      const today = new Date().toDateString()
      setSessions(allSessions.filter((s) => new Date(s.startTime).toDateString() === today).reverse())
    } else {
      setSessions(allSessions.reverse())
    }
  }

  const handleDelete = (sessionId: string) => {
    TimerStorageManager.deleteSession(sessionId)
    loadSessions()
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/timer">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">History</h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === 'today' ? 'default' : 'outline'}
              onClick={() => setFilter('today')}
              size="sm"
            >
              Today
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All Time
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sessions.length === 0 ? (
          <Card className="p-12 text-center border border-border">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No sessions yet</h3>
            <p className="text-muted-foreground">
              {filter === 'today' ? "You haven't completed any sessions today" : 'Start a session to begin tracking'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map((session, index) => (
              <SessionItem
                key={session.id}
                session={session}
                isLatest={index === 0}
                onDelete={() => handleDelete(session.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function SessionItem({
  session,
  isLatest,
  onDelete,
}: {
  session: TimerSession
  isLatest: boolean
  onDelete: () => void
}) {
  const startTime = new Date(session.startTime)
  const timeStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const modeLabel = session.mode === 'work' ? 'Focus' : session.mode === 'short-break' ? 'Break' : 'Long Break'
  const modeColor = session.mode === 'work' ? 'text-primary' : 'text-green-600'

  const getStatusIcon = () => {
    if (session.skipped) return <AlertCircle className="w-5 h-5 text-amber-600" />
    if (session.quality === 'perfect') return <CheckCircle className="w-5 h-5 text-green-600" />
    return <Clock className="w-5 h-5 text-muted-foreground" />
  }

  return (
    <Card
      className={`p-4 bg-card border transition-all ${
        isLatest
          ? 'border-primary/50 bg-primary/5 hover:border-primary'
          : 'border-border hover:border-secondary/50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className={`font-semibold ${modeColor}`}>{modeLabel}</p>
              {session.quality === 'perfect' && (
                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  Perfect
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{timeStr}</span>
              <span>•</span>
              <span className="font-mono">{session.duration}m</span>
              <span>•</span>
              <span>{dateStr}</span>
              {session.skipped && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 font-semibold">Skipped</span>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={onDelete}
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive flex-shrink-0"
          title="Delete session"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
