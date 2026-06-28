import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPocAddedNotification } from '@/lib/notifications'
import type { SessionUser } from '@/types/api'

async function requireOwner(oppId: string, userId: string) {
  return prisma.opportunity.findFirst({
    where: { id: oppId, createdById: userId },
    select: { id: true },
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const opp = await requireOwner(params.id, user.id)
  if (!opp) return NextResponse.json({ error: 'Only the opportunity owner can share it' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  // Don't add the owner as a POC
  if (userId === user.id) return NextResponse.json({ error: 'Owner is already on the opportunity' }, { status: 409 })

  await prisma.opportunityPoc.upsert({
    where: { opportunityId_userId: { opportunityId: params.id, userId } },
    update: {},
    create: { opportunityId: params.id, userId, addedById: user.id },
  })

  await createPocAddedNotification(params.id, userId)

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const opp = await requireOwner(params.id, user.id)
  if (!opp) return NextResponse.json({ error: 'Only the opportunity owner can share it' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await prisma.opportunityPoc.deleteMany({
    where: { opportunityId: params.id, userId },
  })

  return NextResponse.json({ ok: true })
}
