import { NextResponse } from 'next/server'
import { seasons } from '@/lib/db-operations'

export async function GET() {
  try {
    const seasonsList = await seasons.getAll()
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(seasonsList) ? seasonsList : [])
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json([])
  }
}



