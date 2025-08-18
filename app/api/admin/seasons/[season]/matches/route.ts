import { NextResponse } from 'next/server'
import { setWinner } from '@/lib/data'

export const runtime = 'nodejs'

export async function PUT(req: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const { round, matchNumber, winner } = await req.json()
  if (!round || !matchNumber) {
    return NextResponse.json({ error: 'round, matchNumber required' }, { status: 400 })
  }
  await setWinner(season, round, Number(matchNumber), winner)
  return NextResponse.json({ ok: true })
}


