import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import type { SessionUser } from '@/types/api'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const oppFilter = getOpportunityFilter(user)

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      territory: { select: { id: true, name: true } },
      contacts: {
        include: { company: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
      },
      opportunities: {
        where: oppFilter,
        include: {
          company: { select: { id: true, name: true, industry: true } },
          primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          buOwner: { select: { id: true, name: true, email: true } },
          bu: { select: { id: true, name: true } },
          territory: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      },
      _count: { select: { opportunities: true, contacts: true } },
    },
  })

  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(company)
}
