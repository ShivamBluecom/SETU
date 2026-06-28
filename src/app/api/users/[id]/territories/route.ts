import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const actor = session.user as SessionUser
  if (actor.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { territoryId } = await req.json()
  if (!territoryId) return NextResponse.json({ error: 'territoryId required' }, { status: 400 })

  await prisma.userTerritory.upsert({
    where: { userId_territoryId: { userId: params.id, territoryId } },
    update: {},
    create: { userId: params.id, territoryId },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const actor = session.user as SessionUser
  if (actor.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { territoryId } = await req.json()
  if (!territoryId) return NextResponse.json({ error: 'territoryId required' }, { status: 400 })

  await prisma.userTerritory.deleteMany({
    where: { userId: params.id, territoryId },
  })

  return NextResponse.json({ ok: true })
}
