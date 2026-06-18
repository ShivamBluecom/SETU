import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'
import { z } from 'zod'

const UpdateTerritorySchema = z.object({
  name: z.string().min(1),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = UpdateTerritorySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 })

  const duplicate = await prisma.territory.findFirst({
    where: { name: { equals: parsed.data.name }, NOT: { id: params.id } },
  })
  if (duplicate) return NextResponse.json({ error: 'A territory with this name already exists' }, { status: 409 })

  const territory = await prisma.territory.update({
    where: { id: params.id },
    data: { name: parsed.data.name },
    include: { _count: { select: { users: true, opportunities: true } } },
  })
  return NextResponse.json(territory)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const territory = await prisma.territory.findUnique({
    where: { id: params.id },
    include: { _count: { select: { users: true, opportunities: true } } },
  })
  if (!territory) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (territory._count.users > 0 || territory._count.opportunities > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${territory._count.users} user(s) and ${territory._count.opportunities} opportunity(s) are linked to this territory.` },
      { status: 409 }
    )
  }

  await prisma.territory.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
