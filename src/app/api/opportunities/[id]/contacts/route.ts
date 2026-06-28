import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'

async function requireOwner(oppId: string, userId: string) {
  return prisma.opportunity.findFirst({
    where: { id: oppId, createdById: userId },
    select: { id: true, primaryContactId: true },
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const opp = await requireOwner(params.id, user.id)
  if (!opp) return NextResponse.json({ error: 'Not found or no permission' }, { status: 404 })

  const { contactId } = await req.json()
  if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 })

  if (contactId === opp.primaryContactId) {
    return NextResponse.json({ error: 'This contact is already the primary contact' }, { status: 409 })
  }

  await prisma.opportunityContact.upsert({
    where: { opportunityId_contactId: { opportunityId: params.id, contactId } },
    update: {},
    create: { opportunityId: params.id, contactId },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const opp = await requireOwner(params.id, user.id)
  if (!opp) return NextResponse.json({ error: 'Not found or no permission' }, { status: 404 })

  const { contactId } = await req.json()
  if (!contactId) return NextResponse.json({ error: 'contactId required' }, { status: 400 })

  await prisma.opportunityContact.deleteMany({
    where: { opportunityId: params.id, contactId },
  })

  return NextResponse.json({ ok: true })
}
