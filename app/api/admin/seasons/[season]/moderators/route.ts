import { NextResponse } from 'next/server'
import { moderators } from '@/lib/db-operations'

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
    await moderators.add(name)
    await moderators.addToSeason(name, season)
    return NextResponse.json({ ok: true })
  } catch (error) {
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





