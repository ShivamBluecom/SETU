'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { OpportunityDrawer } from '@/components/opportunities/OpportunityDrawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatINR, formatDate } from '@/lib/format'

interface ConcludedOpp {
  id: string
  title: string
  stage: string
  value: number
  closeDate: string | Date | null
  updatedAt: string | Date
  closingComment: string | null
  finalDealValue: number | null
  poNumber: string | null
  expectedDeliveryDate: string | Date | null
  keyDecisionMaker: string | null
  subscriptionStartDate: string | Date | null
  subscriptionEndDate: string | Date | null
  lossReason: string | null
  lostTo: string | null
  couldBeRevived: boolean | null
  company: { id: string; name: string }
  createdBy: { id: string; name: string }
  territory: { id: string; name: string } | null
}

interface ConcludedClientProps {
  opportunities: ConcludedOpp[]
}

const filterInputStyle: React.CSSProperties = {
  fontSize: '13px',
  padding: '7px 10px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-1)',
  fontFamily: 'inherit',
  height: '34px',
  boxShadow: 'var(--shadow-xs)',
  transition: 'border-color 150ms, box-shadow 150ms',
}

export function ConcludedClient({ opportunities }: ConcludedClientProps) {
  const [tab, setTab] = useState<'WON' | 'LOST'>('WON')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const won = useMemo(() => opportunities.filter(o => o.stage === 'WON'), [opportunities])
  const lost = useMemo(() => opportunities.filter(o => o.stage === 'LOST'), [opportunities])
  const current = tab === 'WON' ? won : lost

  const filtered = useMemo(() => {
    if (!search.trim()) return current
    const q = search.toLowerCase()
    return current.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.company.name.toLowerCase().includes(q) ||
      o.createdBy.name.toLowerCase().includes(q) ||
      `setu-${o.id}`.toLowerCase().includes(q) ||
      (o.territory?.name ?? '').toLowerCase().includes(q) ||
      (o.lossReason ?? '').toLowerCase().includes(q) ||
      (o.lostTo ?? '').toLowerCase().includes(q) ||
      (o.poNumber ?? '').toLowerCase().includes(q) ||
      (o.keyDecisionMaker ?? '').toLowerCase().includes(q)
    )
  }, [current, search])

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: active ? 500 : 400,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    background: active ? 'var(--color-surface)' : 'transparent',
    color: active ? 'var(--color-text-1)' : 'var(--color-text-3)',
    boxShadow: active ? 'var(--shadow-xs)' : 'none',
    transition: 'all 120ms',
  })

  if (opportunities.length === 0) {
    return <EmptyState message="No concluded opportunities yet." />
  }

  return (
    <>
      {/* Tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--color-surface-2)', borderRadius: '8px' }}>
          <button style={tabStyle(tab === 'WON')} onClick={() => setTab('WON')}>
            Won ({won.length})
          </button>
          <button style={tabStyle(tab === 'LOST')} onClick={() => setTab('LOST')}>
            Lost ({lost.length})
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, ID, company, territory…"
            style={{ ...filterInputStyle, paddingLeft: '30px', width: '240px' }}
          />
        </div>

        {search && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
            {filtered.length} of {current.length}
          </span>
        )}
      </div>

      <div className="card-3d" style={{ overflow: 'hidden', padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-3)', fontSize: '14px' }}>
            No results match your search.
          </div>
        ) : tab === 'WON' ? (
          <table>
            <thead>
              <tr>
                <th>Opp ID</th>
                <th>Title</th>
                <th>Company</th>
                <th>Final Value</th>
                <th>PO Number</th>
                <th>Expected Delivery</th>
                <th>Key Decision Maker</th>
                <th>Territory</th>
                <th>Owner</th>
                <th>Date Closed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(opp => (
                <tr
                  key={opp.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedId(opp.id); setDrawerOpen(true) }}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)' }}>
                      setu-{opp.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-1)', fontSize: '14px' }}>
                    {opp.title}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>{opp.company.name}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>
                      {opp.finalDealValue != null ? formatINR(opp.finalDealValue) : '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>{opp.poNumber ?? '—'}</td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>
                    {opp.expectedDeliveryDate ? formatDate(opp.expectedDeliveryDate) : '—'}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>{opp.keyDecisionMaker ?? '—'}</td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>{opp.territory?.name ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Avatar name={opp.createdBy.name} size="sm" />
                      <span style={{ fontSize: '13px' }}>{opp.createdBy.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>{formatDate(opp.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Opp ID</th>
                <th>Title</th>
                <th>Company</th>
                <th>Loss Reason</th>
                <th>Lost To</th>
                <th>Could Revive</th>
                <th>Territory</th>
                <th>Owner</th>
                <th>Date Closed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(opp => (
                <tr
                  key={opp.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedId(opp.id); setDrawerOpen(true) }}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)' }}>
                      setu-{opp.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-1)', fontSize: '14px' }}>
                    {opp.title}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>{opp.company.name}</td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>{opp.lossReason ?? '—'}</td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>{opp.lostTo ?? '—'}</td>
                  <td style={{ fontSize: '13px' }}>
                    {opp.couldBeRevived == null ? '—' : (
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px',
                        background: opp.couldBeRevived ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                        color: opp.couldBeRevived ? 'var(--color-accent-text)' : 'var(--color-text-3)',
                      }}>
                        {opp.couldBeRevived ? 'Yes' : 'No'}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>{opp.territory?.name ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Avatar name={opp.createdBy.name} size="sm" />
                      <span style={{ fontSize: '13px' }}>{opp.createdBy.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>{formatDate(opp.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <OpportunityDrawer
        opportunityId={selectedId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
