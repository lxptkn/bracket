import { NextResponse } from 'next/server'
import { participants, brackets } from '@/lib/db-operations'

export const runtime = 'nodejs'

/**
 * GET /api/admin/seasons/[season]/participants
 * Lists participants assigned to the season.
 */
export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const list = await participants.getForSeason(season)
    return NextResponse.json(Array.isArray(list) ? list : [])
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

/**
 * POST /api/admin/seasons/[season]/participants
 * Adds a participant to the season, creating globally if needed.
 */
export async function POST(req: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const { name, seed } = await req.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    
    // Check if participant already exists globally, if not create them
    try {
      await participants.add(name, seed)
    } catch (error) {
      // If participant already exists, that's fine - continue
      console.log('Participant may already exist globally:', error)
    }
    
    // Add participant to season
    await participants.addToSeason(name, season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error adding participant to season:', error)
    return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/seasons/[season]/participants
 * Removes a participant from the season by name.
 */
export async function DELETE(req: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    await participants.removeFromSeason(name, season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/seasons/[season]/participants
 * Regenerates the bracket for the season from current participants.
 */
export async function PUT(_: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    await brackets.generateForSeason(season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to regenerate bracket' }, { status: 500 })
  }
}


