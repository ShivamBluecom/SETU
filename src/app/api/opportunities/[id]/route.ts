import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { UpdateOpportunitySchema } from '@/lib/validations/opportunity'
import { createStageNotifications, createOpportunityCreatedNotifications } from '@/lib/notifications'
import type { SessionUser } from '@/types/api'
import type { OpportunityStage } from '@/types/enums'

const WON_LOST: OpportunityStage[] = ['WON', 'LOST']

async function canAccessOpportunity(userId: string, oppId: string, filter: object, isAdmin: boolean) {
  if (isAdmin) {
    const opp = await prisma.opportunity.findUnique({ where: { id: oppId }, select: { id: true } })
    return !!opp
  }
  const opp = await prisma.opportunity.findFirst({
    where: { id: oppId, OR: [filter as object, { createdById: userId }] },
    select: { id: true },
  })
  return !!opp
}

async function recomputeValue(opportunityId: string) {
  const [lineItems, serviceAddons] = await Promise.all([
    prisma.lineItem.findMany({ where: { opportunityId }, select: { totalValue: true } }),
    prisma.serviceAddon.findMany({ where: { opportunityId }, select: { value: true } }),
  ])
  const total =
    lineItems.reduce((s, r) => s + Number(r.totalValue), 0) +
    serviceAddons.reduce((s, r) => s + Number(r.value), 0)
  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { value: total },
  })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const hasAccess = await canAccessOpportunity(user.id, params.id, filter, user.role === 'ADMIN')
  if (!hasAccess) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: params.id },
    include: {
      company: { select: { id: true, name: true, industry: true } },
      primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      territory: { select: { id: true, name: true } },
      notes: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
      pocs: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      lineItems: {
        include: {
          bu: {
            select: {
              id: true, name: true, buType: true,
              members: { where: { role: 'BU_HEAD' }, select: { id: true, name: true }, take: 1 },
            },
          },
          buOwner: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      serviceAddons: { orderBy: { createdAt: 'asc' } },
      additionalContacts: {
        include: { contact: { select: { id: true, name: true, designation: true, email: true } } },
      },
    },
  })

  return NextResponse.json(opportunity)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  // Only owner or ADMIN can edit core fields
  const opp = await prisma.opportunity.findUnique({
    where: { id: params.id },
    select: { id: true, stage: true, status: true, territoryId: true, createdById: true },
  })
  if (!opp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (opp.createdById !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateOpportunitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const updateData: Record<string, unknown> = { ...data }
  if (data.closeDate) updateData.closeDate = new Date(data.closeDate)

  const updated = await prisma.opportunity.update({
    where: { id: params.id },
    data: updateData,
    include: {
      company: { select: { id: true, name: true, industry: true } },
      territory: { select: { id: true, name: true } },
    },
  })

  if (data.stage && data.stage !== opp.stage && WON_LOST.includes(data.stage as OpportunityStage)) {
    await createStageNotifications(params.id, data.stage as OpportunityStage, updated.territoryId)
  }

  if (data.status === 'CREATED' && opp.status === 'DRAFT') {
    await createOpportunityCreatedNotifications(params.id)
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const opp = await prisma.opportunity.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, createdById: true },
  })
  if (!opp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (opp.createdById !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (opp.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Only draft opportunities can be deleted' }, { status: 400 })
  }

  // Delete child records first (SQL Server NoAction FK)
  await prisma.notification.deleteMany({ where: { opportunityId: params.id } })
  await prisma.note.deleteMany({ where: { opportunityId: params.id } })
  await prisma.opportunityPoc.deleteMany({ where: { opportunityId: params.id } })
  await prisma.serviceAddon.deleteMany({ where: { opportunityId: params.id } })
  await prisma.lineItem.deleteMany({ where: { opportunityId: params.id } })
  await prisma.opportunityContact.deleteMany({ where: { opportunityId: params.id } })
  await prisma.opportunity.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
