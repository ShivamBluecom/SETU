import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateLineItemSchema } from '@/lib/validations/opportunity'
import { createBuOwnerAssignedNotification } from '@/lib/notifications'
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
  { params }: { params: { id: string; liId: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const lineItem = await prisma.lineItem.findFirst({
    where: { id: params.liId, opportunityId: params.id },
    include: { opportunity: { select: { createdById: true } } },
  })
  if (!lineItem) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = lineItem.opportunity.createdById === user.id
  const isBuHead = user.role === 'BU_HEAD' && user.buId === lineItem.buId
  const isAdmin = user.role === 'ADMIN'

  if (!isOwner && !isBuHead && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateLineItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // BU Head can only set buOwnerId — restrict if not owner/admin
  if (!isOwner && !isAdmin) {
    const allowedKeys = ['buOwnerId']
    const hasDisallowedKeys = Object.keys(data).some(k => !allowedKeys.includes(k) && data[k as keyof typeof data] !== undefined)
    if (hasDisallowedKeys) {
      return NextResponse.json({ error: 'BU Head can only assign the BU owner' }, { status: 403 })
    }
  }

  const updateData: Record<string, unknown> = {}
  if (data.buOwnerId !== undefined) updateData.buOwnerId = data.buOwnerId
  if (data.quantity !== undefined) updateData.quantity = data.quantity
  if (data.unitPrice !== undefined) updateData.unitPrice = data.unitPrice
  if (data.totalValue !== undefined) updateData.totalValue = data.totalValue
  if (data.details !== undefined) updateData.details = data.details

  const settingOwner = data.buOwnerId && !lineItem.buOwnerId

  if (settingOwner || (data.buOwnerId && data.buOwnerId !== lineItem.buOwnerId)) {
    updateData.assignmentStatus = 'ASSIGNED'
  }

  const updated = await prisma.lineItem.update({
    where: { id: params.liId },
    data: updateData,
    include: {
      bu: { select: { id: true, name: true } },
      buOwner: { select: { id: true, name: true, email: true } },
    },
  })

  if (data.buOwnerId && data.buOwnerId !== lineItem.buOwnerId) {
    await createBuOwnerAssignedNotification(params.id, data.buOwnerId)
  }

  await recomputeValue(params.id)

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; liId: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as SessionUser

  const lineItem = await prisma.lineItem.findFirst({
    where: { id: params.liId, opportunityId: params.id },
    include: { opportunity: { select: { createdById: true } } },
  })
  if (!lineItem) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (lineItem.opportunity.createdById !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.lineItem.delete({ where: { id: params.liId } })
  await recomputeValue(params.id)

  return NextResponse.json({ ok: true })
}
