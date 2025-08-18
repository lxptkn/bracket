import { NextResponse } from 'next/server'
import { addGlobalModerator, getGlobalModerators, removeGlobalModerator } from '@/lib/data'

export const runtime = 'nodejs'

export async function GET() {
  const list = await getGlobalModerators()
  list.sort((a, b) => a.name.localeCompare(b.name))
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name || typeof name !== 'string') return NextResponse.json({ error: 'name required' }, { status: 400 })
  await addGlobalModerator({ name })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { name } = await req.json()
  if (!name || typeof name !== 'string') return NextResponse.json({ error: 'name required' }, { status: 400 })
  await removeGlobalModerator(name)
  return NextResponse.json({ ok: true })
}





