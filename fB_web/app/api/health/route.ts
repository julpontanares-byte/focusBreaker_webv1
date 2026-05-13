import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'focusBreaker',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      storage: process.env.AZURE_SQL_CONNECTION_STRING || process.env.SQL_CONNECTION_STRING || process.env.DATABASE_URL ? 'azure-sql' : 'file-snapshot',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}