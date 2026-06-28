import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { KPICard } from '@/components/ui/KPICard'
import { StageBlocks } from '@/components/ui/StageBlocks'
import { BarList } from '@/components/ui/charts/BarList'
import { TrendChart } from '@/components/ui/charts/TrendChart'
import { DashboardTable } from './DashboardTable'
import { formatINR, formatINRCompact } from '@/lib/format'
import { groupByPriority, groupByTerritory, groupByBusinessUnit, monthlyTrend } from '@/lib/analytics'
import type { SessionUser } from '@/types/api'

const SECTION_LABEL_STYLE: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--color-text-3)',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const user = session.user as SessionUser
  const filter = getOpportunityFilter(user)

  const [allOpps, recentOpps] = await Promise.all([
    prisma.opportunity.findMany({
      where: filter,
      select: {
        stage: true,
        priority: true,
        value: true,
        createdAt: true,
        territory: { select: { name: true } },
        lineItems: { select: { bu: { select: { name: true } }, totalValue: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.opportunity.findMany({
      where: filter,
      include: {
        company: { select: { id: true, name: true, industry: true } },
        primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
        createdBy: { select: { id: true, name: true, email: true } },
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

  const priorityRows = groupByPriority(allOpps)
  const trendPoints = monthlyTrend(allOpps)
  const showTerritory = user.role === 'ADMIN' || user.role === 'BU_HEAD'
  const showBU = user.role === 'ADMIN' || user.role === 'TERRITORY_MANAGER'
  const territoryRows = showTerritory ? groupByTerritory(allOpps) : []
  const buRows = showBU ? groupByBusinessUnit(allOpps) : []

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
        <p style={SECTION_LABEL_STYLE}>Stage Distribution</p>
        <StageBlocks counts={stageCounts} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '20px 24px' }}>
          <p style={SECTION_LABEL_STYLE}>Pipeline Trend (6 mo)</p>
          <TrendChart points={trendPoints.map(p => ({ label: p.label, value: p.count }))} />
        </div>
        <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '20px 24px' }}>
          <p style={SECTION_LABEL_STYLE}>By Priority</p>
          <BarList rows={priorityRows.map(r => ({ label: r.label, value: r.count }))} formatValue={v => String(v)} />
        </div>
      </div>

      {(territoryRows.length > 0 || buRows.length > 0) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: territoryRows.length > 0 && buRows.length > 0 ? 'repeat(2, 1fr)' : '1fr',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {territoryRows.length > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '20px 24px' }}>
              <p style={SECTION_LABEL_STYLE}>By Territory</p>
              <BarList rows={territoryRows} formatValue={formatINRCompact} />
            </div>
          )}
          {buRows.length > 0 && (
            <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '20px 24px' }}>
              <p style={SECTION_LABEL_STYLE}>By Business Unit</p>
              <BarList rows={buRows} formatValue={formatINRCompact} />
            </div>
          )}
        </div>
      )}

      <div>
        <p style={SECTION_LABEL_STYLE}>Recent Opportunities</p>
        <DashboardTable opportunities={recentOpps} />
      </div>
    </div>
  )
}
