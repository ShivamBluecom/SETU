import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'
import { z } from 'zod'

const CreateBUSchema = z.object({
  name: z.string().min(1),
  territoryId: z.string().optional(),
  headId: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bus = await prisma.businessUnit.findMany({
    include: {
      territory: { select: { id: true, name: true } },
      head: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(bus)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateBUSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  const bu = await prisma.businessUnit.create({
    data: parsed.data,
    include: {
      territory: { select: { id: true, name: true } },
      head: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(bu, { status: 201 })
}
