import { NextResponse } from 'next/server'
import { getBracket } from '@/lib/data'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const data = await getBracket(season)
  if (!data) return NextResponse.json({}, { status: 404 })
  return NextResponse.json(data)
}


