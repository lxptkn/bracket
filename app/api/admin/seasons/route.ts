import { NextResponse } from 'next/server'
import { seasons } from '@/lib/db-operations'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { season } = await req.json()
    if (!season || typeof season !== 'string') {
      return NextResponse.json({ error: 'season required' }, { status: 400 })
    }
    await seasons.create(season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error creating season:', error)
    return NextResponse.json({ error: 'Failed to create season' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { season } = await req.json()
    if (!season || typeof season !== 'string') {
      return NextResponse.json({ error: 'season required' }, { status: 400 })
    }
    await seasons.delete(season)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting season:', error)
    return NextResponse.json({ error: 'Failed to delete season' }, { status: 500 })
  }
}


