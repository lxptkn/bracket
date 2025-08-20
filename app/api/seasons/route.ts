import { NextResponse } from 'next/server'
import { seasons } from '@/lib/db-operations'

export async function GET() {
  try {
    const seasonsList = await seasons.getAll()
    return NextResponse.json(seasonsList)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 })
  }
}



