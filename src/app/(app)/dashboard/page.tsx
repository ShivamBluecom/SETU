import { TrendingUp, Target, Award } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpportunityFilter } from '@/lib/query-filters'
import { KPICard } from '@/components/ui/KPICard'
import { DashboardClient } from './DashboardClient'
import { formatINR } from '@/lib/format'
import { groupByPriority, groupByTerritory, groupByBusinessUnit, monthlyTrend } from '@/lib/analytics'
import type { SessionUser } from '@/types/api'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 14px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-text-3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {children}
      <span style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
    </p>
  )
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

  const trendPoints = monthlyTrend(allOpps).map(p => ({ label: p.label, value: p.count }))
  const priorityRows = groupByPriority(allOpps).map(r => ({ label: r.label, value: r.count }))

  const showTerritory = user.role === 'ADMIN' || user.role === 'BU_HEAD'
  const showBU = user.role === 'ADMIN' || user.role === 'TERRITORY_MANAGER'
  const territoryRows = showTerritory ? groupByTerritory(allOpps) : []
  const buRows = showBU ? groupByBusinessUnit(allOpps) : []

  return (
    <div>
      {/* KPI Row — static, server-rendered */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <KPICard
          title="Pipeline Value"
          value={formatINR(pipelineValue)}
          subtitle={`${openOpps.length} open opportunities`}
          valueColor="accent"
          accent="teal"
          icon={<TrendingUp size={16} color="#0d9488" strokeWidth={2} />}
        />
        <KPICard
          title="Open Opportunities"
          value={String(openOpps.length)}
          subtitle="Excluding Won & Lost"
          accent="blue"
          icon={<Target size={16} color="#2563eb" strokeWidth={2} />}
        />
        <KPICard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle={`${wonCount} won of ${allOpps.length} total`}
          accent="green"
          icon={<Award size={16} color="#16a34a" strokeWidth={2} />}
        />
      </div>

      {/* Interactive section: table → stage cards → charts */}
      <DashboardClient
        recentOpps={recentOpps as any}
        stageCounts={stageCounts}
        trendPoints={trendPoints}
        priorityRows={priorityRows}
        territoryRows={territoryRows}
        buRows={buRows}
        showTerritory={showTerritory}
        showBU={showBU}
      />
    </div>
  )
}
