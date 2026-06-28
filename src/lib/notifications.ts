import { prisma } from '@/lib/prisma'
import type { OpportunityStage } from '@/types/enums'

// Fired when an opportunity stage changes to WON or LOST
// Recipients: BU_HEADs of all participating BUs (via line items), TM, ADMIN
export async function createStageNotifications(
  opportunityId: string,
  stage: OpportunityStage,
  territoryId: string | null
): Promise<void> {
  const buIds = await prisma.lineItem
    .findMany({ where: { opportunityId }, select: { buId: true } })
    .then(rows => [...new Set(rows.map(r => r.buId))])

  const recipients = await prisma.user.findMany({
    where: {
      role: { in: ['BU_HEAD', 'TERRITORY_MANAGER', 'ADMIN'] },
      OR: [
        { role: 'ADMIN' },
        ...(buIds.length ? [{ buId: { in: buIds } }] : []),
        ...(territoryId ? [{ territoryId }] : []),
      ],
    },
    select: { id: true },
  })

  for (const recipient of recipients) {
    const notifId = `${opportunityId}-${recipient.id}-${stage}`
    await prisma.notification.upsert({
      where: { id: notifId },
      update: {},
      create: {
        id: notifId,
        opportunityId,
        userId: recipient.id,
        type: 'STAGE_CHANGE',
        stage,
      },
    })
  }
}

// Fired when a line item is created — notifies BU Head (Flow A) or auto-assigned BU Manager (Flow B)
export async function createLineItemNotification(
  opportunityId: string,
  recipientId: string
): Promise<void> {
  await prisma.notification.create({
    data: {
      opportunityId,
      userId: recipientId,
      type: 'LINE_ITEM_CREATED',
    },
  })
}

// Fired when a BU owner is assigned on a line item
export async function createBuOwnerAssignedNotification(
  opportunityId: string,
  buOwnerId: string
): Promise<void> {
  await prisma.notification.create({
    data: {
      opportunityId,
      userId: buOwnerId,
      type: 'BU_OWNER_ASSIGNED',
    },
  })
}

// Fired when an opportunity moves from DRAFT → CREATED — notifies BU_HEADs for all participating BUs
export async function createOpportunityCreatedNotifications(opportunityId: string): Promise<void> {
  const lineItems = await prisma.lineItem.findMany({ where: { opportunityId }, select: { buId: true } })
  const buIds = [...new Set(lineItems.map(li => li.buId))]
  if (!buIds.length) return
  const buHeads = await prisma.user.findMany({
    where: { role: 'BU_HEAD', buId: { in: buIds } },
    select: { id: true },
  })
  await Promise.all(
    buHeads.map(u => prisma.notification.create({ data: { opportunityId, userId: u.id, type: 'LINE_ITEM_CREATED' } }))
  )
}

// Fired when a POC is added to an opportunity
export async function createPocAddedNotification(
  opportunityId: string,
  addedUserId: string
): Promise<void> {
  await prisma.notification.create({
    data: {
      opportunityId,
      userId: addedUserId,
      type: 'POC_ADDED',
    },
  })
}
