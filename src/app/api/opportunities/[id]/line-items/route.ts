import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateLineItemSchema } from '@/lib/validations/opportunity'
import { createLineItemNotification } from '@/lib/notifications'
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
  const parsed = CreateLineItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // BU assignment flow
  let buOwnerId: string | undefined
  let assignmentStatus = 'PENDING'

  const buMembers = await prisma.user.findMany({
    where: {
      buId: data.buId,
      role: { in: ['BU_HEAD', 'BU_MANAGER'] },
    },
    select: { id: true, role: true },
    orderBy: { createdAt: 'asc' },
  })

  const buHead = buMembers.find(m => m.role === 'BU_HEAD')

  if (buHead) {
    // Flow A: has BU Head — notify them to assign manually
    await createLineItemNotification(params.id, buHead.id)
  } else {
    // Flow B: no BU Head — auto-assign to first BU Manager
    const buManager = buMembers.find(m => m.role === 'BU_MANAGER')
    if (buManager) {
      buOwnerId = buManager.id
      assignmentStatus = 'ASSIGNED'
      await createLineItemNotification(params.id, buManager.id)
    }
  }

  const lineItem = await prisma.lineItem.create({
    data: {
      opportunityId: params.id,
      buId: data.buId,
      quantity: data.quantity ?? null,
      unitPrice: data.unitPrice ?? null,
      totalValue: data.totalValue,
      buOwnerId: buOwnerId ?? null,
      assignmentStatus,
      details: data.details,
    },
    include: {
      bu: { select: { id: true, name: true } },
      buOwner: { select: { id: true, name: true, email: true } },
    },
  })

  await recomputeValue(params.id)

  return NextResponse.json(lineItem, { status: 201 })
}
