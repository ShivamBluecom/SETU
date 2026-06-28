import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateServiceAddonSchema } from '@/lib/validations/opportunity'
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; sId: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const addon = await prisma.serviceAddon.findFirst({
    where: { id: params.sId, opportunityId: params.id },
    include: { opportunity: { select: { createdById: true } } },
  })
  if (!addon) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (addon.opportunity.createdById !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateServiceAddonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.serviceAddon.update({
    where: { id: params.sId },
    data: parsed.data,
  })

  await recomputeValue(params.id)
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; sId: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const addon = await prisma.serviceAddon.findFirst({
    where: { id: params.sId, opportunityId: params.id },
    include: { opportunity: { select: { createdById: true } } },
  })
  if (!addon) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (addon.opportunity.createdById !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.serviceAddon.delete({ where: { id: params.sId } })
  await recomputeValue(params.id)

  return NextResponse.json({ ok: true })
}
