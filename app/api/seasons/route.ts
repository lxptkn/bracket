import { NextResponse } from 'next/server'
import { getSeasons } from '@/lib/data'

export async function GET() {
  const seasons = await getSeasons()
  return NextResponse.json(seasons)
}



