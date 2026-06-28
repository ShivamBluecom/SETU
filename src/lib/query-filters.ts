import type { Prisma } from '@prisma/client'
import type { SessionUser } from '@/types/api'

export function getOpportunityFilter(user: SessionUser): Prisma.OpportunityWhereInput {
  const pocClause: Prisma.OpportunityWhereInput = {
    pocs: { some: { userId: user.id } },
  }

  switch (user.role) {
    case 'ISR':
      return { OR: [{ createdById: user.id }, pocClause] }

    case 'BU_MANAGER':
      if (!user.buIds.length) return { id: 'none' }
      return { lineItems: { some: { buId: { in: user.buIds } } } }

    case 'BU_HEAD':
      if (!user.buId) return { id: 'none' }
      return { lineItems: { some: { buId: user.buId } } }

    case 'TERRITORY_MANAGER':
      if (!user.territoryId) return { id: 'none' }
      return { territoryId: user.territoryId }

    case 'ACCOUNT_MANAGER':
      if (!user.territoryIds.length) return { OR: [{ createdById: user.id }, pocClause] }
      return {
        OR: [
          { territoryId: { in: user.territoryIds } },
          { createdById: user.id },
          pocClause,
        ],
      }

    case 'ADMIN':
      return {}

    default:
      return { id: 'none' }
  }
}
