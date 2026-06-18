import { format, startOfMonth, subMonths } from 'date-fns'
import type { Decimal } from '@prisma/client/runtime/library'

export interface AnalyticsOpportunity {
  stage: string
  priority: string
  value: number | Decimal | string
  createdAt: Date | string
  territory: { name: string } | null
  bu: { name: string } | null
  buOwner: { name: string } | null
}

export interface BreakdownRow {
  label: string
  count: number
  value: number
}

export interface TrendPoint {
  label: string
  count: number
  value: number
}

export interface WinLossSplit {
  won: number
  lost: number
  open: number
}

const PRIORITY_ORDER = ['HIGH', 'MEDIUM', 'LOW']

function groupBy(
  opps: AnalyticsOpportunity[],
  keyOf: (o: AnalyticsOpportunity) => string | null
): BreakdownRow[] {
  const rows = new Map<string, BreakdownRow>()
  for (const o of opps) {
    const label = keyOf(o)
    if (!label) continue
    const row = rows.get(label) ?? { label, count: 0, value: 0 }
    row.count += 1
    row.value += Number(o.value)
    rows.set(label, row)
  }
  return Array.from(rows.values()).sort((a, b) => b.value - a.value)
}

export function groupByPriority(opps: AnalyticsOpportunity[]): BreakdownRow[] {
  const rows = groupBy(opps, o => o.priority)
  return PRIORITY_ORDER.map(p => rows.find(r => r.label === p) ?? { label: p, count: 0, value: 0 })
}

export function groupByTerritory(opps: AnalyticsOpportunity[]): BreakdownRow[] {
  return groupBy(opps, o => o.territory?.name ?? null)
}

export function groupByBusinessUnit(opps: AnalyticsOpportunity[]): BreakdownRow[] {
  return groupBy(opps, o => o.bu?.name ?? null)
}

export function groupByOwner(opps: AnalyticsOpportunity[], topN = 8): BreakdownRow[] {
  return groupBy(opps, o => o.buOwner?.name ?? null).slice(0, topN)
}

export function monthlyTrend(opps: AnalyticsOpportunity[], months = 6): TrendPoint[] {
  const now = startOfMonth(new Date())
  const buckets: TrendPoint[] = []
  const keyFor = (d: Date) => format(d, 'yyyy-MM')
  const byKey = new Map<string, TrendPoint>()

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = subMonths(now, i)
    const key = keyFor(monthStart)
    const point = { label: format(monthStart, 'MMM'), count: 0, value: 0 }
    byKey.set(key, point)
    buckets.push(point)
  }

  for (const o of opps) {
    const key = keyFor(new Date(o.createdAt))
    const point = byKey.get(key)
    if (!point) continue
    point.count += 1
    point.value += Number(o.value)
  }

  return buckets
}

export function winLossSplit(opps: AnalyticsOpportunity[]): WinLossSplit {
  return opps.reduce<WinLossSplit>(
    (acc, o) => {
      if (o.stage === 'WON') acc.won += 1
      else if (o.stage === 'LOST') acc.lost += 1
      else acc.open += 1
      return acc
    },
    { won: 0, lost: 0, open: 0 }
  )
}
