import { NextResponse } from 'next/server'
import { seasons } from '@/lib/db-operations'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if we're in a build context or don't have database access
    if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, returning empty seasons data');
      return NextResponse.json([]);
    }

    const seasonsList = await seasons.getAll()
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(seasonsList) ? seasonsList : [])
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json([])
  }
}



