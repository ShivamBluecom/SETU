import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateServiceAddonSchema } from '@/lib/validations/opportunity'
import type { SessionUser } from '@/types/api'

async function recomputeValue(opportunityId: string) {
  const [lineItems, serviceAddons] = await Promise.all([
    prisma.lineItem.findMany({ where: { opportunityId }, select: { totalValue: true } }),
    prisma.serviceAddon.findMany({ where: { opportunityId }, select: { value: true } }),
  ])
  const total =
    lineItems.reduce((s, r) => s + Number(r.totalValue), 0) +
    serviceAddons.reduce((s, r) => s + Number(r.value), 0)
  await prisma.opportunity.update({ where: { id: opportunityId }, data: { value: total } })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const opp = await prisma.opportunity.findFirst({
    where: { id: params.id, createdById: user.id },
    select: { id: true },
  })
  if (!opp) return NextResponse.json({ error: 'Not found or no permission' }, { status: 404 })

  const body = await req.json()
  const parsed = CreateServiceAddonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const addon = await prisma.serviceAddon.create({
    data: { ...parsed.data, opportunityId: params.id },
  })

  await recomputeValue(params.id)

  return NextResponse.json(addon, { status: 201 })
}
