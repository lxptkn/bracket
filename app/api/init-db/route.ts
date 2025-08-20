import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Check if we're in a build context or don't have database access
    if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, skipping database initialization');
      return NextResponse.json({ message: 'Database initialization skipped during build' });
    }

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
