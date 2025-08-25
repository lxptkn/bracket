import { NextResponse } from 'next/server'
import { seasons } from '@/lib/db-operations'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  try {
    // Check if we're in a build context or don't have database access
    if ((!process.env.POSTGRES_URL && !process.env.DATABASE_URL) || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, returning empty season metadata');
      return NextResponse.json({ month1: '', month2: '' });
    }

    const { season } = await context.params
    const meta = await seasons.getMetadata(season)
    return NextResponse.json(meta)
  } catch (error) {
    console.error('Error fetching season metadata:', error)
    return NextResponse.json({ month1: '', month2: '' })
  }
}



