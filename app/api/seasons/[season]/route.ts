import { NextResponse } from 'next/server'
import { seasons } from '@/lib/db-operations'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const meta = await seasons.getMetadata(season)
    return NextResponse.json(meta)
  } catch (error) {
    console.error('Error fetching season metadata:', error)
    return NextResponse.json({ error: 'Failed to fetch season metadata' }, { status: 500 })
  }
}



