import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateContactSchema } from '@/lib/validations/contact'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: parsed.data,
      include: { company: { select: { id: true, name: true } } },
    })
    return NextResponse.json(contact)
  } catch {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }
}
