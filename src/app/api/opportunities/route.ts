import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { CreateOpportunitySchema } from '@/lib/validations/opportunity'
import type { SessionUser } from '@/types/api'

const OPP_INCLUDE = {
  company: { select: { id: true, name: true, industry: true } },
  primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  territory: { select: { id: true, name: true } },
  lineItems: {
    include: {
      bu: { select: { id: true, name: true } },
      buOwner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  serviceAddons: { orderBy: { createdAt: 'asc' as const } },
  pocs: {
    select: {
      userId: true,
      user: { select: { id: true, name: true, email: true } },
    },
  },
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)
  const { searchParams } = new URL(req.url)
  const includeDrafts = searchParams.get('includeDrafts') === 'true'

  const where = includeDrafts
    ? {
        OR: [
          filter,
          // Always include user's own drafts regardless of role filter
          { createdById: user.id, status: 'DRAFT' },
        ],
      }
    : { ...filter, status: 'CREATED' }

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: OPP_INCLUDE,
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

  const opportunity = await prisma.opportunity.create({
    data: {
      title: data.title,
      description: data.description,
      closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
      stage: data.stage,
      priority: data.priority,
      status: data.status,
      companyId: data.companyId,
      primaryContactId: data.primaryContactId,
      territoryId: data.territoryId,
      createdById: user.id,
    },
    include: {
      company: { select: { id: true, name: true, industry: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      territory: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(opportunity, { status: 201 })
}
