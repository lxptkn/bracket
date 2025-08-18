import { NextResponse } from 'next/server'
import { addSeason, removeSeason } from '@/lib/data'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { season } = await req.json()
  if (!season || typeof season !== 'string') {
    return NextResponse.json({ error: 'season required' }, { status: 400 })
  }
  await addSeason(season)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { season } = await req.json()
  if (!season || typeof season !== 'string') {
    return NextResponse.json({ error: 'season required' }, { status: 400 })
  }
  await removeSeason(season)
  return NextResponse.json({ ok: true })
}


