import { NextResponse } from 'next/server'
import { participants, brackets } from '@/lib/db-operations'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const list = await participants.getForSeason(season)
    return NextResponse.json(Array.isArray(list) ? list : [])
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const { name, seed } = await req.json()
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
    // ensure exists in global table
    if (typeof seed === 'number') {
      await participants.add(name, seed)
    } else {
      await participants.add(name)
    }
    await participants.addToSeason(name, season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 })
  }
}

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

export async function PUT(_: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    await brackets.generateForSeason(season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to regenerate bracket' }, { status: 500 })
  }
}


