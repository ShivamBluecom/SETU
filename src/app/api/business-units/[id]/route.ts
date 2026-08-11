import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'
import { z } from 'zod'

const UpdateBUSchema = z.object({
  name: z.string().min(1).optional(),
  buType: z.enum(['ISG', 'NETWORKING_AV', 'ISS', 'SSG', 'CLOUD']).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = UpdateBUSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  const bu = await prisma.businessUnit.update({
    where: { id: params.id },
    data: parsed.data,
    include: {
      members: {
        where: { role: 'BU_HEAD' },
        select: { id: true, name: true, email: true },
        take: 1,
      },
      _count: { select: { members: true, lineItems: true, userBUAssignments: true } },
    },
  })
  return NextResponse.json(bu)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const bu = await prisma.businessUnit.findUnique({
    where: { id: params.id },
    include: { _count: { select: { members: true, lineItems: true, userBUAssignments: true } } },
  })
  if (!bu) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (bu._count.members > 0 || bu._count.lineItems > 0 || bu._count.userBUAssignments > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${bu._count.members} member(s), ${bu._count.lineItems} line item(s), and ${bu._count.userBUAssignments} assignment(s) are linked to this business unit.` },
      { status: 409 }
    )
  }

  await prisma.businessUnit.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
