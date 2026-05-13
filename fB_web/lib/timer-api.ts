import type { TimerSnapshot } from './timer-data'

const TIMER_API_BASE = '/api/timer'

async function requestTimerSnapshot(
  method: 'GET' | 'PUT' | 'DELETE',
  body?: TimerSnapshot,
): Promise<Response | null> {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return await fetch(TIMER_API_BASE, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    })
  } catch {
    return null
  }
}

export async function fetchTimerSnapshot(): Promise<TimerSnapshot | null> {
  const response = await requestTimerSnapshot('GET')

  if (!response || !response.ok) {
    return null
  }

  try {
    return (await response.json()) as TimerSnapshot
  } catch {
    return null
  }
}

export async function persistTimerSnapshot(snapshot: TimerSnapshot): Promise<boolean> {
  const response = await requestTimerSnapshot('PUT', snapshot)
  return Boolean(response?.ok)
}

export async function clearTimerSnapshot(): Promise<boolean> {
  const response = await requestTimerSnapshot('DELETE')
  return Boolean(response?.ok)
}