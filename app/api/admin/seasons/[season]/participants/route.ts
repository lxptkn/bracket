import { NextResponse } from 'next/server'
import { addParticipant, getParticipants, removeParticipant, regenerateBracketFromParticipantsInOrder } from '@/lib/data'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const participants = await getParticipants(season)
  return NextResponse.json(participants)
}

export async function POST(req: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const { name, seed } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  await addParticipant(season, { name, seed: typeof seed === 'number' ? seed : undefined })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  await removeParticipant(season, name)
  return NextResponse.json({ ok: true })
}

export async function PUT(_: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  await regenerateBracketFromParticipantsInOrder(season)
  return NextResponse.json({ ok: true })
}


