import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateContactSchema } from '@/lib/validations/contact'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const companyId = searchParams.get('companyId')

  const contacts = await prisma.contact.findMany({
    where: companyId ? { companyId } : undefined,
    include: { company: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const contact = await prisma.contact.create({
    data: parsed.data,
    include: { company: { select: { id: true, name: true } } },
  })

  return NextResponse.json(contact, { status: 201 })
}
