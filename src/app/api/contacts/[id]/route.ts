import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateContactSchema } from '@/lib/validations/contact'
import type { SessionUser } from '@/types/api'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const body = await req.json()
  const parsed = UpdateContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.contact.findUnique({
    where: { id: params.id },
    select: { companyId: true },
  })
  if (!existing) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })

  const company = await prisma.company.findUnique({
    where: { id: existing.companyId },
    select: { createdById: true },
  })
  if (!company || (company.createdById !== user.id && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const contact = await prisma.contact.update({
    where: { id: params.id },
    data: parsed.data,
    include: { company: { select: { id: true, name: true } } },
  })
  return NextResponse.json(contact)
}
