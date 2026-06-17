import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'
import { z } from 'zod'

const CreateTerritorySchema = z.object({
  name: z.string().min(1),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const territories = await prisma.territory.findMany({
    include: {
      _count: { select: { businessUnits: true, users: true, opportunities: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(territories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = CreateTerritorySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  const territory = await prisma.territory.create({ data: parsed.data })
  return NextResponse.json(territory, { status: 201 })
}
