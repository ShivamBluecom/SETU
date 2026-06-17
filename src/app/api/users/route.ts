import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types/enums'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')
  const buId = searchParams.get('buId')
  const rolesParam = searchParams.get('roles')
  const roles = rolesParam ? (rolesParam.split(',') as UserRole[]) : undefined

  const users = await prisma.user.findMany({
    where: {
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
      ...(buId ? { buId } : {}),
      ...(roles ? { role: { in: roles } } : {}),
    },
    select: { id: true, name: true, email: true, role: true, buId: true, territoryId: true },
    orderBy: { name: 'asc' },
    take: 20,
  })

  return NextResponse.json(users)
}
