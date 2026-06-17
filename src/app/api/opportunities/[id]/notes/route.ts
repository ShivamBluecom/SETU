import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import type { SessionUser } from '@/types/api'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const opp = await prisma.opportunity.findFirst({
    where: { id: params.id, ...filter },
    select: { id: true },
  })
  if (!opp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { content } = await req.json()
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  const note = await prisma.note.create({
    data: { content: content.trim(), opportunityId: params.id, authorId: user.id },
    include: { author: { select: { id: true, name: true } } },
  })

  return NextResponse.json(note, { status: 201 })
}
