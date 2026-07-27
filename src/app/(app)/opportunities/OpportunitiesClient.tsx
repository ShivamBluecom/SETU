'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trash2, Search, X } from 'lucide-react'
import { StageBadge } from '@/components/ui/StageBadge'
import { PriorityDot } from '@/components/ui/PriorityDot'
import { Avatar } from '@/components/ui/Avatar'
import { OpportunityDrawer } from '@/components/opportunities/OpportunityDrawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatINR, formatDate } from '@/lib/format'

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

interface Opp {
  id: string
  title: string
  status: string
  stage: string
  priority: string
  value: number | string
  createdAt: string | Date
  updatedAt: string | Date
  company: { id: string; name: string }
  createdBy: { id: string; name: string }
  territory: { id: string; name: string } | null
}

interface OpportunitiesClientProps {
  opportunities: Opp[]
  currentUserId: string
}

const STAGE_LABELS: Record<string, string> = {
  PROSPECTING: 'Prospecting',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
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

export function OpportunitiesClient({ opportunities: initial, currentUserId }: OpportunitiesClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [opps, setOpps] = useState<Opp[]>(initial)
  // Sync when router.refresh() delivers updated server data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setOpps(initial) }, [initial])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Open drawer when navigated here with ?open=<id> (e.g. from dashboard)
  useEffect(() => {
    const openId = searchParams.get('open')
    if (openId) { setSelectedId(openId); setDrawerOpen(true) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter state
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterOwner, setFilterOwner] = useState('')
  const [filterTerritory, setFilterTerritory] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterStage, filterOwner, filterTerritory, filterCompany, dateFrom, dateTo])

  // Unique values for dropdowns (derived from full list)
  const stages = useMemo(() => [...new Set(opps.map(o => o.stage))].sort(), [opps])
  const owners = useMemo(() => {
    const seen = new Set<string>()
    return opps.filter(o => !seen.has(o.createdBy.id) && seen.add(o.createdBy.id)).map(o => o.createdBy)
  }, [opps])
  const territories = useMemo(() => {
    const seen = new Set<string>()
    return opps.filter(o => o.territory && !seen.has(o.territory.id) && seen.add(o.territory.id)).map(o => o.territory!)
  }, [opps])
  const companies = useMemo(() => {
    const seen = new Set<string>()
    return opps.filter(o => !seen.has(o.company.id) && seen.add(o.company.id)).map(o => o.company)
  }, [opps])

  const hasFilters = search || filterStage || filterOwner || filterTerritory || filterCompany || dateFrom || dateTo

  const clearFilters = () => {
    setSearch('')
    setFilterStage('')
    setFilterOwner('')
    setFilterTerritory('')
    setFilterCompany('')
    setDateFrom('')
    setDateTo('')
  }

  const filtered = useMemo(() => {
    return opps.filter(o => {
      if (search) {
        const q = search.toLowerCase()
        const hit =
          o.title.toLowerCase().includes(q) ||
          o.company.name.toLowerCase().includes(q) ||
          o.createdBy.name.toLowerCase().includes(q) ||
          `setu-${o.id}`.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (filterStage && o.stage !== filterStage) return false
      if (filterOwner && o.createdBy.id !== filterOwner) return false
      if (filterTerritory && o.territory?.id !== filterTerritory) return false
      if (filterCompany && o.company.id !== filterCompany) return false
      if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false
      if (dateTo && new Date(o.createdAt) > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [opps, search, filterStage, filterOwner, filterTerritory, filterCompany, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleRowClick = (opp: Opp, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-delete]')) return
    if (opp.status === 'DRAFT') {
      router.push(`/opportunities/new?id=${opp.id}`)
    } else {
      setSelectedId(opp.id)
      setDrawerOpen(true)
    }
  }

  const handleDelete = async (opp: Opp, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Delete draft "${opp.title}"? This cannot be undone.`)) return
    const res = await fetch(`/api/opportunities/${opp.id}`, { method: 'DELETE' })
    if (res.ok) {
      setOpps(prev => prev.filter(o => o.id !== opp.id))
    } else {
      const err = await res.json().catch(() => null)
      alert(err?.error ?? 'Failed to delete draft')
    }
  }

  if (opps.length === 0) {
    return (
      <EmptyState
        message="No opportunities yet."
        action={
          <button className="btn-primary" onClick={() => router.push('/opportunities/new')} style={{ fontSize: '13px', padding: '6px 14px' }}>
            New Opportunity
          </button>
        }
      />
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        {/* Text search */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-3)',
              pointerEvents: 'none',
            }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, company, owner…"
            style={{ ...filterInputStyle, paddingLeft: '30px', width: '240px' }}
          />
        </div>

        {/* Stage */}
        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          style={{ ...filterInputStyle, width: 'auto', paddingRight: '28px' }}
        >
          <option value="">All stages</option>
          {stages.map(s => (
            <option key={s} value={s}>{STAGE_LABELS[s] ?? s}</option>
          ))}
        </select>

        {/* Owner */}
        <select
          value={filterOwner}
          onChange={e => setFilterOwner(e.target.value)}
          style={{ ...filterInputStyle, width: 'auto', paddingRight: '28px' }}
        >
          <option value="">All owners</option>
          {owners.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>

        {/* Territory */}
        {territories.length > 0 && (
          <select
            value={filterTerritory}
            onChange={e => setFilterTerritory(e.target.value)}
            style={{ ...filterInputStyle, width: 'auto', paddingRight: '28px' }}
          >
            <option value="">All territories</option>
            {territories.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}

        {/* Company */}
        <select
          value={filterCompany}
          onChange={e => setFilterCompany(e.target.value)}
          style={{ ...filterInputStyle, width: 'auto', paddingRight: '28px' }}
        >
          <option value="">All companies</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

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

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--color-text-3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '6px',
              fontFamily: 'inherit',
              transition: 'color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
          >
            <X size={12} />
            Clear
          </button>
        )}

        <div style={{ flex: 1 }} />

        <button
          className="btn-primary"
          onClick={() => router.push('/opportunities/new')}
          style={{ fontSize: '13px', padding: '6px 14px', height: '34px', whiteSpace: 'nowrap' }}
        >
          New Opportunity
        </button>
      </div>

      {/* Result count */}
      <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--color-text-3)' }}>
        {hasFilters
          ? `${filtered.length} of ${opps.length} opportunities`
          : `${opps.length} opportunities`}
      </p>

      <div className="card-3d" style={{ overflow: 'hidden', padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-3)', fontSize: '14px' }}>
            No opportunities match the current filters.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Opp ID</th>
                <th>Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Priority</th>
                <th>Created By</th>
                <th>Territory</th>
                <th>Value</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(opp => (
                <tr
                  key={opp.id}
                  style={{ cursor: 'pointer' }}
                  onClick={e => handleRowClick(opp, e)}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)' }}>
                      setu-{opp.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-1)', fontSize: '14px' }}>
                    {opp.title}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>
                    {opp.company.name}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: opp.status === 'DRAFT' ? 'var(--color-surface-2)' : 'var(--color-accent-bg)',
                        color: opp.status === 'DRAFT' ? 'var(--color-text-3)' : 'var(--color-accent-text)',
                        border: '0.5px solid',
                        borderColor: opp.status === 'DRAFT' ? 'var(--color-border)' : 'transparent',
                      }}
                    >
                      {opp.status === 'DRAFT' ? 'Draft' : 'Created'}
                    </span>
                  </td>
                  <td>
                    {opp.status === 'CREATED'
                      ? <StageBadge stage={opp.stage} />
                      : <span style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>—</span>
                    }
                  </td>
                  <td>
                    <PriorityDot priority={opp.priority} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Avatar name={opp.createdBy.name} size="sm" />
                      <span style={{ fontSize: '13px' }}>{opp.createdBy.name}</span>
                      {opp.createdBy.id === currentUserId && (
                        <span style={{ fontSize: '10px', color: 'var(--color-accent)' }}>you</span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>
                    {opp.territory?.name ?? '—'}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>
                      {formatINR(opp.value)}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
                    {formatDate(opp.updatedAt)}
                  </td>
                  <td style={{ width: '36px' }}>
                    {opp.status === 'DRAFT' && opp.createdBy.id === currentUserId && (
                      <button
                        data-delete
                        onClick={e => handleDelete(opp, e)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--color-text-3)', padding: '4px', display: 'flex',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
                        title="Delete draft"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination footer */}
      {filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', flexWrap: 'wrap', gap: '8px' }}>
          {/* Showing X–Y of Z */}
          <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>
            Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
          </span>

          {/* Page buttons */}
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

          {/* Rows per page */}
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
        onUpdated={() => router.refresh()}
      />
    </>
  )
}
