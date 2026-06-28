'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { StageBadge } from '@/components/ui/StageBadge'
import { PriorityDot } from '@/components/ui/PriorityDot'
import { Avatar } from '@/components/ui/Avatar'
import { OpportunityDrawer } from '@/components/opportunities/OpportunityDrawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatINR, formatDate } from '@/lib/format'

interface Opp {
  id: string
  title: string
  status: string
  stage: string
  priority: string
  value: number | string
  updatedAt: string | Date
  company: { id: string; name: string }
  createdBy: { id: string; name: string }
  territory: { id: string; name: string } | null
}

interface OpportunitiesClientProps {
  opportunities: Opp[]
  currentUserId: string
}

export function OpportunitiesClient({ opportunities: initial, currentUserId }: OpportunitiesClientProps) {
  const router = useRouter()
  const [opps, setOpps] = useState<Opp[]>(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleRowClick = (opp: Opp, e: React.MouseEvent) => {
    // Don't open drawer when delete button clicked
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
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-primary"
          onClick={() => router.push('/opportunities/new')}
          style={{ fontSize: '13px', padding: '6px 14px' }}
        >
          New Opportunity
        </button>
      </div>
      <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
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
            {opps.map(opp => (
              <tr
                key={opp.id}
                style={{ cursor: 'pointer' }}
                onClick={e => handleRowClick(opp, e)}
              >
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
                  {opp.status === 'CREATED' ? <StageBadge stage={opp.stage} /> : <span style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>—</span>}
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
      </div>

      <OpportunityDrawer
        opportunityId={selectedId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdated={() => router.refresh()}
      />
    </>
  )
}
