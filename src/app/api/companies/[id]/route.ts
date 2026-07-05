import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { UpdateCompanySchema } from '@/lib/validations/company'
import type { SessionUser } from '@/types/api'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const body = await req.json()
  const parsed = UpdateCompanySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.company.findUnique({
    where: { id: params.id },
    select: { createdById: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.createdById !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (parsed.data.name) {
    const duplicate = await prisma.company.findFirst({
      where: { name: { equals: parsed.data.name.trim() }, id: { not: params.id } },
      select: { name: true },
    })
    if (duplicate) {
      return NextResponse.json(
        { error: `A company named '${duplicate.name}' already exists`, field: 'name' },
        { status: 409 }
      )
    }
  }

  const company = await prisma.company.update({
    where: { id: params.id },
    data: parsed.data,
    include: { territory: { select: { id: true, name: true } } },
  })

  return NextResponse.json(company)
}

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
        where: { ...oppFilter, status: 'CREATED' },
        include: {
          company: { select: { id: true, name: true, industry: true } },
          primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          territory: { select: { id: true, name: true } },
          lineItems: {
            include: {
              bu: { select: { id: true, name: true } },
              buOwner: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      },
      _count: { select: { opportunities: true, contacts: true } },
    },
  })

  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(company)
}
