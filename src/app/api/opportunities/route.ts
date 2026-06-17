import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { CreateOpportunitySchema } from '@/lib/validations/opportunity'
import { canAssignOwner } from '@/lib/auth'
import type { SessionUser } from '@/types/api'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const opportunities = await prisma.opportunity.findMany({
    where: filter,
    include: {
      company: { select: { id: true, name: true, industry: true } },
      primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      buOwner: { select: { id: true, name: true, email: true } },
      bu: { select: { id: true, name: true } },
      territory: { select: { id: true, name: true } },
    },
    orderBy: [{ stage: 'asc' }, { orderIndex: 'asc' }, { updatedAt: 'desc' }],
  })

  return NextResponse.json(opportunities)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const body = await req.json()
  const parsed = CreateOpportunitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  if (data.buOwnerId && !canAssignOwner(user.role)) {
    return NextResponse.json({ error: 'Forbidden: cannot assign owner' }, { status: 403 })
  }

  let buOwnerId = data.buOwnerId
  let territoryId = data.territoryId

  if (data.buId) {
    const bu = await prisma.businessUnit.findUnique({
      where: { id: data.buId },
      include: {
        members: {
          where: { role: 'BU_MANAGER' },
          select: { id: true },
          take: 1,
        },
      },
    })
    if (bu) {
      if (!bu.headId && !buOwnerId) {
        buOwnerId = bu.members[0]?.id
      }
      if (!territoryId && bu.territoryId) {
        territoryId = bu.territoryId
      }
    }
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      title: data.title,
      description: data.description,
      value: data.value,
      currency: data.currency,
      closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
      stage: data.stage,
      priority: data.priority,
      productService: data.productService,
      companyId: data.companyId,
      primaryContactId: data.primaryContactId,
      buId: data.buId,
      territoryId,
      createdById: user.id,
      buOwnerId,
    },
    include: {
      company: { select: { id: true, name: true, industry: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      buOwner: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(opportunity, { status: 201 })
}
