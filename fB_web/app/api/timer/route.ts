import { NextResponse } from 'next/server'
import { clearTimerSnapshot, readTimerSnapshot, writeTimerSnapshot } from '@/lib/server/timer-store'
import type { TimerSnapshot } from '@/lib/timer-data'

export const runtime = 'nodejs'

export async function GET() {
  const snapshot = await readTimerSnapshot()
  return NextResponse.json(snapshot, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Partial<TimerSnapshot>
  const snapshot = await writeTimerSnapshot(payload)
  return NextResponse.json(snapshot, { headers: { 'Cache-Control': 'no-store' } })
}

export async function DELETE() {
  const snapshot = await clearTimerSnapshot()
  return NextResponse.json(snapshot, { headers: { 'Cache-Control': 'no-store' } })
}