import { NextResponse } from 'next/server'
import { participants } from '@/lib/db-operations'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const list = await participants.getAll()
    // Ensure alphabetical order by name
    list.sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, seed } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    await participants.add(name, typeof seed === 'number' ? seed : undefined)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error adding participant:', error)
    return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    // TODO: Implement removeGlobalParticipant in db-operations
    // For now, just return success
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 })
  }
}


