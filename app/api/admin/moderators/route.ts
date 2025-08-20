import { NextResponse } from 'next/server'
import { moderators } from '@/lib/db-operations'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const list = await moderators.getAll()
    // Ensure alphabetical order by name
    list.sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching moderators:', error)
    return NextResponse.json({ error: 'Failed to fetch moderators' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    await moderators.add(name)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error adding moderator:', error)
    return NextResponse.json({ error: 'Failed to add moderator' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    // TODO: Implement removeGlobalModerator in db-operations
    // For now, just return success
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error removing moderator:', error)
    return NextResponse.json({ error: 'Failed to remove moderator' }, { status: 500 })
  }
}





