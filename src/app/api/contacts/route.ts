import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateContactSchema } from '@/lib/validations/contact'
import type { SessionUser } from '@/types/api'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const { searchParams } = req.nextUrl
  const companyId = searchParams.get('companyId')

  if (companyId) {
    // Opportunity creation: contacts for a specific company.
    // Owners/admins get full details; everyone else gets only id+name+designation
    // so they can populate the dropdown without exposing PII.
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { createdById: true },
    })
    const isOwner = user.role === 'ADMIN' || company?.createdById === user.id

    if (isOwner) {
      const contacts = await prisma.contact.findMany({
        where: { companyId },
        include: { company: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
      })
      return NextResponse.json(contacts)
    }

    // Non-owner: strip all PII
    const contacts = await prisma.contact.findMany({
      where: { companyId },
      select: { id: true, name: true, designation: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(contacts)
  }

  // No companyId (contacts page): only return contacts from companies the user created
  const contacts = await prisma.contact.findMany({
    where: user.role === 'ADMIN' ? undefined : { company: { createdById: user.id } },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const body = await req.json()
  const parsed = CreateContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const company = await prisma.company.findUnique({
    where: { id: parsed.data.companyId },
    select: { createdById: true },
  })
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  if (company.createdById !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const contact = await prisma.contact.create({
    data: parsed.data,
    include: { company: { select: { id: true, name: true } } },
  })

  return NextResponse.json(contact, { status: 201 })
}
