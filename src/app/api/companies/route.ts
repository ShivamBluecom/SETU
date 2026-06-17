import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateCompanySchema } from '@/lib/validations/company'

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

  const body = await req.json()
  const parsed = CreateCompanySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const company = await prisma.company.create({
    data: parsed.data,
    include: { territory: { select: { id: true, name: true } } },
  })

  return NextResponse.json(company, { status: 201 })
}
