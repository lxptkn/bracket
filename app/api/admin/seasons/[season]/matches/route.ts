import { NextResponse } from 'next/server'
import { brackets } from '@/lib/db-operations'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

/**
 * PUT /api/admin/seasons/[season]/matches
 * Sets or clears the winner for a given round and match number.
 */
export async function PUT(req: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const { round, matchNumber, winner } = await req.json()
    if (!round || !matchNumber) {
      return NextResponse.json({ error: 'round, matchNumber required' }, { status: 400 })
    }
    await brackets.setWinner(season, Number(round), Number(matchNumber), winner)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set winner' }, { status: 500 })
  }
}


