import { NextResponse } from 'next/server'
import { seasons } from '@/lib/db-operations'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // Check if we're in a build context or don't have database access
    if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, skipping season creation');
      return NextResponse.json({ error: 'Database not available during build' }, { status: 503 });
    }

    const { season } = await req.json()
    if (!season || typeof season !== 'string') {
      return NextResponse.json({ error: 'season required' }, { status: 400 })
    }
    await seasons.create(season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creating season:', error)
    return NextResponse.json({ error: 'Failed to create season' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    // Check if we're in a build context or don't have database access
    if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, skipping season deletion');
      return NextResponse.json({ error: 'Database not available during build' }, { status: 503 });
    }

    const { season } = await req.json()
    if (!season || typeof season !== 'string') {
      return NextResponse.json({ error: 'season required' }, { status: 400 })
    }
    await seasons.delete(season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting season:', error)
    return NextResponse.json({ error: 'Failed to delete season' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    // Check if we're in a build context or don't have database access
    if (!process.env.DATABASE_URL || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, skipping season update');
      return NextResponse.json({ error: 'Database not available during build' }, { status: 503 });
    }

    const { season, month1, month2 } = await req.json()
    if (!season || typeof season !== 'string') {
      return NextResponse.json({ error: 'season required' }, { status: 400 })
    }
    if (!month1 || typeof month1 !== 'string') {
      return NextResponse.json({ error: 'month1 required' }, { status: 400 })
    }
    if (!month2 || typeof month2 !== 'string') {
      return NextResponse.json({ error: 'month2 required' }, { status: 400 })
    }
    
    await seasons.updateMonths(season, month1, month2)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating season months:', error)
    return NextResponse.json({ error: 'Failed to update season months' }, { status: 500 })
  }
}


