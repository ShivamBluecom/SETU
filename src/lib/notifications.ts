import { prisma } from '@/lib/prisma'
import type { OpportunityStage } from '@/types/enums'

export async function createStageNotifications(
  opportunityId: string,
  stage: OpportunityStage,
  buId: string | null,
  territoryId: string | null
): Promise<void> {
  const orClauses = [{ role: 'ADMIN' }] as object[]
  if (buId) orClauses.push({ buId })
  if (territoryId) orClauses.push({ territoryId })

  const recipients = await prisma.user.findMany({
    where: {
      role: { in: ['BU_HEAD', 'TERRITORY_MANAGER', 'ADMIN'] },
      OR: orClauses,
    },
    select: { id: true },
  })

  if (recipients.length === 0) return

  for (const recipient of recipients) {
    const notifId = `${opportunityId}-${recipient.id}-${stage}`
    await prisma.notification.upsert({
      where: { id: notifId },
      update: {},
      create: {
        id: notifId,
        opportunityId,
        userId: recipient.id,
        stage,
      },
    })
  }
}
