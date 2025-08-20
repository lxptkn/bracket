import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'

export const runtime = 'nodejs'

export async function POST() {
  try {
    await initDatabase()
    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json(
      { error: 'Database initialization failed' }, 
      { status: 500 }
    )
  }
}
