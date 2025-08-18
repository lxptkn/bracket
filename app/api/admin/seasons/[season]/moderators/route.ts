import { NextResponse } from 'next/server'
import { addModeratorToSeason, getSeasonModerators, removeModeratorFromSeason } from '@/lib/data'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const list = await getSeasonModerators(season)
  return NextResponse.json(list)
}

export async function POST(req: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  await addModeratorToSeason(season, name)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  await removeModeratorFromSeason(season, name)
  return NextResponse.json({ ok: true })
}





