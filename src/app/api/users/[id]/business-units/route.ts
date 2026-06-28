import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const actor = session.user as SessionUser
  if (actor.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { buId } = await req.json()
  if (!buId) return NextResponse.json({ error: 'buId required' }, { status: 400 })

  await prisma.userBusinessUnit.upsert({
    where: { userId_buId: { userId: params.id, buId } },
    update: {},
    create: { userId: params.id, buId },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const actor = session.user as SessionUser
  if (actor.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { buId } = await req.json()
  if (!buId) return NextResponse.json({ error: 'buId required' }, { status: 400 })

  await prisma.userBusinessUnit.deleteMany({
    where: { userId: params.id, buId },
  })

  return NextResponse.json({ ok: true })
}
