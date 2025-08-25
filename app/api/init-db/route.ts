import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Check if we're in a build context or don't have database access
    if ((!process.env.POSTGRES_URL && !process.env.DATABASE_URL) || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, cannot initialize database');
      return NextResponse.json({ error: 'Database not available during build' }, { status: 503 });
    }

    await initDatabase()
    return NextResponse.json({ message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 })
  }
}
