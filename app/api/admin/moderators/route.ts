import { NextResponse } from 'next/server'
import { moderators } from '@/lib/db-operations'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/moderators
 * Returns global moderators, sorted by name. Empty in build/no-DB contexts.
 */
export async function GET() {
  try {
    // Check if we're in a build context or don't have database access
    if ((!process.env.POSTGRES_URL && !process.env.DATABASE_URL) || process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Build time or no database detected, returning empty moderators data');
      return NextResponse.json([]);
    }

    const list = await moderators.getAll()
    // Ensure we always return an array and it's sorted
    const sortedList = Array.isArray(list) ? list.sort((a, b) => a.name.localeCompare(b.name)) : []
    return NextResponse.json(sortedList)
  } catch (error) {
    console.error('Error fetching moderators:', error)
    return NextResponse.json([])
  }
}

/**
 * POST /api/admin/moderators
 * Adds a global moderator by name.
 */
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

/**
 * DELETE /api/admin/moderators
 * Removes a global moderator by name.
 */
export async function DELETE(req: Request) {
  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    await moderators.removeGlobalModerator(name)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error removing moderator:', error)
    return NextResponse.json({ error: 'Failed to remove moderator' }, { status: 500 })
  }
}





