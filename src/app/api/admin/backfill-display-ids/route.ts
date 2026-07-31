import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types/api'

export async function POST() {
  const session = await auth()
  const user = session?.user as SessionUser | undefined
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const opps = await prisma.opportunity.findMany({
    where: { displayId: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, createdAt: true },
  })

  if (opps.length === 0) {
    return NextResponse.json({ message: 'Nothing to backfill', count: 0 })
  }

  const existingCounter = await prisma.counter.findUnique({ where: { name: 'opportunity' } })
  const startFrom = (existingCounter?.value ?? 0) + 1

  for (let i = 0; i < opps.length; i++) {
    const num = startFrom + i
    const year = new Date(opps[i].createdAt).getFullYear().toString().slice(-2)
    const displayId = `BCG-OPP-${year}-${num.toString().padStart(6, '0')}`
    await prisma.opportunity.update({ where: { id: opps[i].id }, data: { displayId } })
  }

  const finalValue = startFrom + opps.length - 1
  await prisma.counter.upsert({
    where: { name: 'opportunity' },
    create: { name: 'opportunity', value: finalValue },
    update: { value: finalValue },
  })

  return NextResponse.json({ message: 'Backfill complete', count: opps.length, counterSetTo: finalValue })
}
