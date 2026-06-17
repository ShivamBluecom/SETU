import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { KPICard } from '@/components/ui/KPICard'
import { StageBlocks } from '@/components/ui/StageBlocks'
import { DashboardTable } from './DashboardTable'
import { formatINR } from '@/lib/format'
import type { SessionUser } from '@/types/api'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const [allOpps, recentOpps] = await Promise.all([
    prisma.opportunity.findMany({
      where: filter,
      select: { stage: true, value: true },
    }),
    prisma.opportunity.findMany({
      where: filter,
      include: {
        company: { select: { id: true, name: true, industry: true } },
        primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        buOwner: { select: { id: true, name: true, email: true } },
        bu: { select: { id: true, name: true } },
        territory: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
  ])

  const openOpps = allOpps.filter(o => o.stage !== 'WON' && o.stage !== 'LOST')
  const pipelineValue = openOpps.reduce((sum, o) => sum + Number(o.value), 0)
  const wonCount = allOpps.filter(o => o.stage === 'WON').length
  const winRate = allOpps.length > 0 ? Math.round((wonCount / allOpps.length) * 100) : 0

  const stageCounts = allOpps.reduce<Record<string, number>>((acc, o) => {
    acc[o.stage] = (acc[o.stage] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
        Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <KPICard
          title="Pipeline Value"
          value={formatINR(pipelineValue)}
          subtitle={`${openOpps.length} open opportunities`}
          valueColor="accent"
        />
        <KPICard
          title="Open Opportunities"
          value={String(openOpps.length)}
          subtitle="Excluding Won & Lost"
        />
        <KPICard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle={`${wonCount} won of ${allOpps.length} total`}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-3)' }}>
          Stage Distribution
        </p>
        <StageBlocks counts={stageCounts} />
      </div>

      <div>
        <p style={{ margin: '0 0 12px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-3)' }}>
          Recent Opportunities
        </p>
        <DashboardTable opportunities={recentOpps} />
      </div>
    </div>
  )
}
