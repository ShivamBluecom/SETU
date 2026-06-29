import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { OpportunitiesClient } from './OpportunitiesClient'
import type { SessionUser } from '@/types/api'

export default async function OpportunitiesPage() {
  const session = await auth()
  if (!session) return null

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const raw = await prisma.opportunity.findMany({
    where: {
      AND: [
        filter,
        {
          OR: [
            { status: 'CREATED' },
            { status: 'DRAFT', createdById: user.id },
          ],
        },
      ],
    },
    select: {
      id: true,
      title: true,
      status: true,
      stage: true,
      priority: true,
      value: true,
      updatedAt: true,
      company: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      territory: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const opportunities = raw.map(o => ({ ...o, value: o.value.toNumber() }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
          Opportunities
        </h1>
      </div>
      <OpportunitiesClient opportunities={opportunities} currentUserId={user.id} />
    </div>
  )
}
