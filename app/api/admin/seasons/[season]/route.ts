import { NextResponse } from 'next/server'
import { saveSeasonMeta } from '@/lib/data'

export const runtime = 'nodejs'

export async function PUT(req: Request, context: { params: Promise<{ season: string }> }) {
  const { season } = await context.params
  const body = await req.json()
  const { month1, month2 } = body || {}
  if ((month1 && typeof month1 !== 'string') || (month2 && typeof month2 !== 'string')) {
    return NextResponse.json({ error: 'month1/month2 must be YYYY-MM strings' }, { status: 400 })
  }
  await saveSeasonMeta(season, { month1, month2 })
  return NextResponse.json({ ok: true })
}



