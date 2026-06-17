import type { Prisma } from '@prisma/client'
import type { SessionUser } from '@/types/api'

export function getOpportunityFilter(user: SessionUser): Prisma.OpportunityWhereInput {
  const sharedClause: Prisma.OpportunityWhereInput = {
    shares: { some: { userId: user.id } },
  }

  switch (user.role) {
    case 'ISR':
      return { OR: [{ createdById: user.id }, sharedClause] }

    case 'ACCOUNT_MANAGER':
      return {
        OR: [{ createdById: user.id }, { buOwnerId: user.id }, sharedClause],
      }

    case 'BU_MANAGER':
    case 'BU_HEAD':
      if (!user.buId) return { id: 'none' }
      return { OR: [{ buId: user.buId }, sharedClause] }

    case 'TERRITORY_MANAGER':
      if (!user.territoryId) return { id: 'none' }
      return { OR: [{ territoryId: user.territoryId }, sharedClause] }

    case 'ADMIN':
      return {}

    default:
      return { id: 'none' }
  }
}
