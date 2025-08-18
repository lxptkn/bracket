import { NextResponse } from 'next/server'
import { getSeasonMeta } from '@/lib/data'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const meta = await getSeasonMeta(season)
  return NextResponse.json(meta)
}



