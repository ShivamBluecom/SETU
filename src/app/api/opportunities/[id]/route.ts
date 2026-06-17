import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { UpdateOpportunitySchema } from '@/lib/validations/opportunity'
import { createStageNotifications } from '@/lib/notifications'
import type { SessionUser } from '@/types/api'
import type { OpportunityStage } from '@/types/enums'

const WON_LOST: OpportunityStage[] = ['WON', 'LOST']

async function canAccessOpportunity(userId: string, oppId: string, filter: object) {
  const opp = await prisma.opportunity.findFirst({
    where: { id: oppId, ...filter },
    select: { id: true },
  })
  return !!opp
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const hasAccess = await canAccessOpportunity(user.id, params.id, filter)
  if (!hasAccess) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: params.id },
    include: {
      company: { select: { id: true, name: true, industry: true } },
      primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      buOwner: { select: { id: true, name: true, email: true } },
      bu: { select: { id: true, name: true } },
      territory: { select: { id: true, name: true } },
      notes: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  return NextResponse.json(opportunity)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const hasAccess = await canAccessOpportunity(user.id, params.id, filter)
  if (!hasAccess) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = UpdateOpportunitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const current = await prisma.opportunity.findUnique({
    where: { id: params.id },
    select: { stage: true, buId: true, territoryId: true },
  })

  const data = parsed.data
  const updateData: Record<string, unknown> = { ...data }
  if (data.closeDate) updateData.closeDate = new Date(data.closeDate)

  const updated = await prisma.opportunity.update({
    where: { id: params.id },
    data: updateData,
    include: {
      company: { select: { id: true, name: true, industry: true } },
      buOwner: { select: { id: true, name: true, email: true } },
    },
  })

  if (
    current &&
    data.stage &&
    data.stage !== current.stage &&
    WON_LOST.includes(data.stage)
  ) {
    await createStageNotifications(
      params.id,
      data.stage,
      updated.buId,
      updated.territoryId
    )
  }

  return NextResponse.json(updated)
}
