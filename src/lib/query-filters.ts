import type { Prisma } from '@prisma/client'
import type { SessionUser } from '@/types/api'

export function getOpportunityFilter(user: SessionUser): Prisma.OpportunityWhereInput {
  const sharedClause: Prisma.OpportunityWhereInput = {
    shares: { some: { userId: user.id } },
  }

  switch (user.role) {
    case 'ISR':
      return { OR: [{ createdById: user.id }, sharedClause] }

    case 'BU_MANAGER':
      if (!user.buId || !user.territoryId) return { id: 'none' }
      return { buId: user.buId, territoryId: user.territoryId }

    case 'BU_HEAD':
      if (!user.buId) return { id: 'none' }
      return { buId: user.buId }

    case 'TERRITORY_MANAGER':
      if (!user.territoryId) return { id: 'none' }
      return { territoryId: user.territoryId }

    case 'ACCOUNT_MANAGER':
      return { company: { accountManagerId: user.id } }

    case 'ADMIN':
      return {}

    default:
      return { id: 'none' }
  }
}
