import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'
import { z } from 'zod'
import type { UserRole } from '@/types/enums'

const UpdateUserSchema = z.object({
  role: z.enum(['ISR', 'ACCOUNT_MANAGER', 'BU_MANAGER', 'BU_HEAD', 'TERRITORY_MANAGER', 'ADMIN'] as const).optional(),
  buId: z.string().nullable().optional(),
  territoryId: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = UpdateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
  }

  const data: { role?: UserRole; buId?: string | null; territoryId?: string | null } = {}
  if (parsed.data.role !== undefined) data.role = parsed.data.role
  if (parsed.data.buId !== undefined) data.buId = parsed.data.buId
  if (parsed.data.territoryId !== undefined) data.territoryId = parsed.data.territoryId

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    include: {
      bu: { select: { id: true, name: true } },
      territory: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(updated)
}
