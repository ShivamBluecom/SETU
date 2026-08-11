import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { ConcludedClient } from '@/components/concluded/ConcludedClient'
import type { SessionUser } from '@/types/api'

export default async function ConcludedPage() {
  const session = await auth()
  if (!session) return null

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const raw = await prisma.opportunity.findMany({
    where: {
      AND: [
        filter,
        { stage: { in: ['WON', 'LOST'] } },
        { status: 'CREATED' },
      ],
    },
    select: {
      id: true,
      displayId: true,
      title: true,
      stage: true,
      value: true,
      createdAt: true,
      closeDate: true,
      updatedAt: true,
      closingComment: true,
      finalDealValue: true,
      poNumber: true,
      expectedDeliveryDate: true,
      keyDecisionMaker: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      lossReason: true,
      lostTo: true,
      couldBeRevived: true,
      company: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      territory: { select: { id: true, name: true } },
      lineItems: { select: { details: true, bu: { select: { buType: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const opportunities = raw.map(o => ({
    ...o,
    value: o.value.toNumber(),
    finalDealValue: o.finalDealValue != null ? o.finalDealValue.toNumber() : null,
  }))

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
          Concluded
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-3)' }}>
          Won and lost opportunities — view only
        </p>
      </div>
      <ConcludedClient opportunities={opportunities} />
    </div>
  )
}
