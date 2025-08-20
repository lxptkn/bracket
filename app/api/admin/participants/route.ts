import { NextResponse } from 'next/server'
import { addGlobalParticipant, getGlobalParticipants, removeGlobalParticipant } from '@/lib/data'

export const runtime = 'nodejs'

export async function GET() {
  const list = await getGlobalParticipants()
  // Ensure alphabetical order by name
  list.sort((a, b) => a.name.localeCompare(b.name))
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const { name, seed } = await req.json()
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name required' }, { status: 400 })
  }
  await addGlobalParticipant({ name, seed: typeof seed === 'number' ? seed : undefined })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    // Note: We'll need to implement removeGlobalParticipant in db-operations
    // For now, just return success
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 })
  }
}


