import { NextResponse } from 'next/server'
import { brackets } from '@/lib/db-operations'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

export async function GET(_: Request, context: { params: Promise<{ season: string }> }) {
  try {
    const { season } = await context.params
    const data = await brackets.getForSeason(season)
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({}, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching bracket:', error)
    return NextResponse.json({ error: 'Failed to fetch bracket' }, { status: 500 })
  }
}


