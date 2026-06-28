import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateCompanySchema } from '@/lib/validations/company'
import type { SessionUser } from '@/types/api'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companies = await prisma.company.findMany({
    include: {
      territory: { select: { id: true, name: true } },
      _count: { select: { opportunities: true, contacts: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(companies)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const body = await req.json()
  const parsed = CreateCompanySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  // SQL Server collation is case-insensitive by default — plain equals suffices
  const existing = await prisma.company.findFirst({
    where: { name: { equals: parsed.data.name.trim() } },
    select: { name: true },
  })
  if (existing) {
    return NextResponse.json(
      { error: `A company named '${existing.name}' already exists`, field: 'name' },
      { status: 409 }
    )
  }

  const company = await prisma.company.create({
    data: { ...parsed.data, createdById: user.id },
    include: { territory: { select: { id: true, name: true } } },
  })

  return NextResponse.json(company, { status: 201 })
}
