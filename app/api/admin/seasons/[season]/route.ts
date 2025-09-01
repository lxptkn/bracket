import { NextResponse } from 'next/server'
import { seasons } from '@/lib/db-operations'

export const runtime = 'nodejs'

/**
 * PUT /api/admin/seasons/[season]
 * Updates the months for a specific season.
 */
export async function PUT(req: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const body = await req.json()
    const { month1, month2 } = body || {}
    if ((month1 && typeof month1 !== 'string') || (month2 && typeof month2 !== 'string')) {
      return NextResponse.json({ error: 'month1/month2 must be YYYY-MM strings' }, { status: 400 })
    }
    await seasons.updateMonths(season, month1 ?? '', month2 ?? '')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update season' }, { status: 500 })
  }
}



