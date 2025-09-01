import { NextResponse } from 'next/server'
import { participants } from '@/lib/db-operations'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/participants
 * Returns global participants, sorted by name. Empty in build/no-DB contexts.
 */
export async function GET() {
  try {
    // Check if we're in a build context or don't have database access
    if ((!process.env.POSTGRES_URL && !process.env.DATABASE_URL) || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, returning empty participants data');
      return NextResponse.json([]);
    }

    const list = await participants.getAll()
    // Ensure we always return an array and it's sorted
    const sortedList = Array.isArray(list) ? list.sort((a, b) => a.name.localeCompare(b.name)) : []
    return NextResponse.json(sortedList)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json([])
  }
}

/**
 * POST /api/admin/participants
 * Adds a global participant with optional seed.
 */
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

/**
 * DELETE /api/admin/participants
 * Removes a global participant by name.
 */
export async function DELETE(req: Request) {
  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    await participants.removeGlobalParticipant(name)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 })
  }
}


