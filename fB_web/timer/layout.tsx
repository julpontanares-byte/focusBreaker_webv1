'use client'

import { TimerProvider } from '@/lib/timer-context'
import { ReactNode } from 'react'

export default function TimerLayout({ children }: { children: ReactNode }) {
  return <TimerProvider>{children}</TimerProvider>
}
