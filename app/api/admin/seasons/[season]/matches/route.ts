import { NextResponse } from 'next/server'
import { brackets } from '@/lib/db-operations'

export const runtime = 'nodejs'

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


