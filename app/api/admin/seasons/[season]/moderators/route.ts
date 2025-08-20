import { NextResponse } from 'next/server'
import { moderators } from '@/lib/db-operations'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const list = await moderators.getForSeason(season)
    return NextResponse.json(Array.isArray(list) ? list : [])
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    
    // Check if moderator already exists globally, if not create them
    try {
      await moderators.add(name)
    } catch (error) {
      // If moderator already exists, that's fine - continue
      console.log('Moderator may already exist globally:', error)
    }
    
    // Add moderator to season
    await moderators.addToSeason(name, season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error adding moderator to season:', error)
    return NextResponse.json({ error: 'Failed to add moderator' }, { status: 500 })
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    await moderators.removeFromSeason(name, season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove moderator' }, { status: 500 })
  }
}





