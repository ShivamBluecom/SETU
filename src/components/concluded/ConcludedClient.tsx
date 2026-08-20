'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

function getQuarterDates(q: Quarter): { from: string; to: string } {
  const now = new Date()
  const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const map: Record<Quarter, { from: string; to: string }> = {
    Q1: { from: `${fy}-04-01`,     to: `${fy}-06-30` },
    Q2: { from: `${fy}-07-01`,     to: `${fy}-09-30` },
    Q3: { from: `${fy}-10-01`,     to: `${fy}-12-31` },
    Q4: { from: `${fy + 1}-01-01`, to: `${fy + 1}-03-31` },
  }
  return map[q]
}
import { Avatar } from '@/components/ui/Avatar'
import { OpportunityDrawer } from '@/components/opportunities/OpportunityDrawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { DownloadCsvButton } from '@/components/ui/DownloadCsvButton'
import { formatINR, formatDate } from '@/lib/format'

function toDateStr(d: string | Date | null): string {
  return d ? new Date(d).toISOString().split('T')[0] : ''
}

interface ConcludedOpp {
  id: string
  displayId: string | null
  title: string
  stage: string
  value: number
  createdAt: string | Date
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
  lineItems: { details: string | null; bu: { buType: string | null } }[]
}

interface ConcludedClientProps {
  opportunities: ConcludedOpp[]
  isAdmin?: boolean
}

const BU_TYPES = ['ISG', 'NETWORKING_AV', 'ISS', 'SSG', 'CLOUD']
const BU_TYPE_LABELS: Record<string, string> = {
  ISG: 'ISG', NETWORKING_AV: 'Networking & AV', ISS: 'ISS', SSG: 'SSG', CLOUD: 'Cloud',
}

function getLineItemBUType(li: { details: string | null; bu: { buType: string | null } }): string | null {
  if (li.bu.buType) return li.bu.buType
  if (!li.details) return null
  try {
    const details = JSON.parse(li.details) as Record<string, unknown>
    return typeof details.buType === 'string' ? details.buType : null
  } catch {
    return null
  }
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

const paginationBtnStyle: React.CSSProperties = {
  fontSize: '12px',
  padding: '0 9px',
  height: '30px',
  borderRadius: '6px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-2)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 120ms, color 120ms',
}

function pageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export function ConcludedClient({ opportunities, isAdmin }: ConcludedClientProps) {
  const [tab, setTab] = useState<'WON' | 'LOST'>('WON')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dateField, setDateField] = useState<'closeDate' | 'createdAt'>('closeDate')
  const [filterBU, setFilterBU] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const won = useMemo(() => opportunities.filter(o => o.stage === 'WON'), [opportunities])
  const lost = useMemo(() => opportunities.filter(o => o.stage === 'LOST'), [opportunities])
  const current = tab === 'WON' ? won : lost

  const filtered = useMemo(() => {
    return current.filter(o => {
      if (search.trim()) {
        const q = search.toLowerCase()
        const hit =
          o.title.toLowerCase().includes(q) ||
          o.company.name.toLowerCase().includes(q) ||
          o.createdBy.name.toLowerCase().includes(q) ||
          (o.displayId ?? '').toLowerCase().includes(q) ||
          (o.territory?.name ?? '').toLowerCase().includes(q) ||
          (o.lossReason ?? '').toLowerCase().includes(q) ||
          (o.lostTo ?? '').toLowerCase().includes(q) ||
          (o.poNumber ?? '').toLowerCase().includes(q) ||
          (o.keyDecisionMaker ?? '').toLowerCase().includes(q)
        if (!hit) return false
      }
      if (filterBU && !o.lineItems.some(li => getLineItemBUType(li) === filterBU)) return false
      const dateVal = dateField === 'closeDate' ? o.closeDate : o.createdAt
      if (dateFrom && (!dateVal || new Date(dateVal) < new Date(dateFrom))) return false
      if (dateTo && (!dateVal || new Date(dateVal) > new Date(dateTo + 'T23:59:59'))) return false
      return true
    })
  }, [current, search, filterBU, dateFrom, dateTo, dateField])

  // Reset page on filter or tab change
  useEffect(() => { setCurrentPage(1) }, [search, filterBU, dateFrom, dateTo, tab, dateField])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const exportOptions = useMemo(() => {
    if (tab === 'WON') {
      const visibleHeaders = ['Opp ID', 'Title', 'Company', 'Final Value', 'PO Number', 'Expected Delivery', 'Key Decision Maker', 'Territory', 'Owner', 'Date Closed']
      const toVisibleRow = (o: ConcludedOpp): (string | number)[] => [
        o.displayId ?? o.id, o.title, o.company.name,
        o.finalDealValue != null ? Number(o.finalDealValue) : '',
        o.poNumber ?? '', toDateStr(o.expectedDeliveryDate), o.keyDecisionMaker ?? '',
        o.territory?.name ?? '', o.createdBy.name, toDateStr(o.updatedAt),
      ]
      const allHeaders = [...visibleHeaders, 'Closing Comment', 'Subscription Start', 'Subscription End', 'Created Date', 'Original Value']
      const toAllRow = (o: ConcludedOpp): (string | number)[] => [
        ...toVisibleRow(o), o.closingComment ?? '', toDateStr(o.subscriptionStartDate),
        toDateStr(o.subscriptionEndDate), toDateStr(o.createdAt), Number(o.value),
      ]
      return [
        { label: 'Visible columns', filename: 'concluded-won.csv', headers: visibleHeaders, rows: filtered.map(toVisibleRow) },
        { label: 'All details', filename: 'concluded-won-full.csv', headers: allHeaders, rows: filtered.map(toAllRow) },
      ]
    }
    const visibleHeaders = ['Opp ID', 'Title', 'Company', 'Loss Reason', 'Lost To', 'Could Revive', 'Territory', 'Owner', 'Date Closed']
    const toVisibleRow = (o: ConcludedOpp): (string | number)[] => [
      o.displayId ?? o.id, o.title, o.company.name, o.lossReason ?? '', o.lostTo ?? '',
      o.couldBeRevived == null ? '' : (o.couldBeRevived ? 'Yes' : 'No'),
      o.territory?.name ?? '', o.createdBy.name, toDateStr(o.updatedAt),
    ]
    const allHeaders = [...visibleHeaders, 'Closing Comment', 'Created Date', 'Original Value']
    const toAllRow = (o: ConcludedOpp): (string | number)[] => [
      ...toVisibleRow(o), o.closingComment ?? '', toDateStr(o.createdAt), Number(o.value),
    ]
    return [
      { label: 'Visible columns', filename: 'concluded-lost.csv', headers: visibleHeaders, rows: filtered.map(toVisibleRow) },
      { label: 'All details', filename: 'concluded-lost-full.csv', headers: allHeaders, rows: filtered.map(toAllRow) },
    ]
  }, [filtered, tab])

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
      {/* Tabs + filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--color-surface-2)', borderRadius: '8px', flexShrink: 0 }}>
          <button style={tabStyle(tab === 'WON')} onClick={() => setTab('WON')}>
            Won ({won.length})
          </button>
          <button style={tabStyle(tab === 'LOST')} onClick={() => setTab('LOST')}>
            Lost ({lost.length})
          </button>
        </div>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Search
            size={13}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)', pointerEvents: 'none' }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, ID, company, territory…"
            style={{ ...filterInputStyle, paddingLeft: '30px', width: '220px' }}
          />
        </div>

        {/* BU */}
        <select
          value={filterBU}
          onChange={e => setFilterBU(e.target.value)}
          style={{ ...filterInputStyle, width: 'auto', paddingRight: '28px' }}
        >
          <option value="">All BUs</option>
          {BU_TYPES.map(bt => (
            <option key={bt} value={bt}>{BU_TYPE_LABELS[bt]}</option>
          ))}
        </select>

        {/* Date field toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--color-surface-2)', borderRadius: '6px', padding: '2px' }}>
          {(['closeDate', 'createdAt'] as const).map(f => (
            <button
              key={f}
              onClick={() => setDateField(f)}
              style={{
                fontSize: '11px', fontWeight: 500, padding: '0 9px', height: '28px',
                borderRadius: '5px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: dateField === f ? 'var(--color-surface)' : 'transparent',
                color: dateField === f ? 'var(--color-text-1)' : 'var(--color-text-3)',
                boxShadow: dateField === f ? 'var(--shadow-xs)' : 'none',
                transition: 'all 120ms',
              }}
            >
              {f === 'closeDate' ? 'Close date' : 'Created date'}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={{ ...filterInputStyle, width: '140px', paddingRight: '8px' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={{ ...filterInputStyle, width: '140px', paddingRight: '8px' }}
          />
        </div>

        {/* Quarter presets */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => {
            const { from, to } = getQuarterDates(q)
            const active = dateFrom === from && dateTo === to
            return (
              <button
                key={q}
                onClick={() => { setDateFrom(from); setDateTo(to) }}
                style={{
                  fontSize: '11px', fontWeight: 500, padding: '0 8px',
                  height: '34px', border: '1px solid var(--color-border)',
                  borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                  background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text-2)',
                  transition: 'background 150ms, color 150ms',
                }}
              >
                {q}
              </button>
            )
          })}
        </div>

        <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
          {(search || filterBU || dateFrom || dateTo) ? `${filtered.length} of ${current.length}` : `${current.length} total`}
        </span>

        <div style={{ flex: 1 }} />

        {isAdmin && <DownloadCsvButton options={exportOptions} />}
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
              {paginated.map(opp => (
                <tr
                  key={opp.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedId(opp.id); setDrawerOpen(true) }}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)' }}>
                      {opp.displayId ?? opp.id}
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
              {paginated.map(opp => (
                <tr
                  key={opp.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedId(opp.id); setDrawerOpen(true) }}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)' }}>
                      {opp.displayId ?? opp.id}
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

      {/* Pagination footer */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
            Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ ...paginationBtnStyle, opacity: currentPage === 1 ? 0.35 : 1 }}
            >
              ←
            </button>
            {pageNumbers(currentPage, totalPages).map((p, i) =>
              p === '...'
                ? <span key={`e${i}`} style={{ fontSize: '12px', color: 'var(--color-text-3)', padding: '0 4px' }}>…</span>
                : <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    style={{
                      ...paginationBtnStyle,
                      background: currentPage === p ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: currentPage === p ? '#fff' : 'var(--color-text-2)',
                      borderColor: currentPage === p ? 'var(--color-accent)' : 'var(--color-border)',
                      fontWeight: currentPage === p ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ ...paginationBtnStyle, opacity: currentPage === totalPages ? 0.35 : 1 }}
            >
              →
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>Rows per page</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
              style={{ fontSize: '12px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-2)', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      <OpportunityDrawer
        opportunityId={selectedId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
