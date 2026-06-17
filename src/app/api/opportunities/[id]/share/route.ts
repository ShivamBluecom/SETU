import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const opp = await prisma.opportunity.findFirst({
    where: {
      id: params.id,
      OR: [{ createdById: user.id }, { buOwnerId: user.id }],
    },
    select: { id: true },
  })
  if (!opp) return NextResponse.json({ error: 'Not found or no permission' }, { status: 404 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await prisma.opportunityShare.upsert({
    where: { opportunityId_userId: { opportunityId: params.id, userId } },
    update: {},
    create: { opportunityId: params.id, userId },
  })

  return NextResponse.json({ ok: true })
}
