'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import type { CompanyWithCounts } from '@/types/api'
import { formatINR } from '@/lib/format'
import { EmptyState } from '@/components/ui/EmptyState'

interface CompanyTableProps {
  companies: CompanyWithCounts[]
  currentUserId: string
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

export function CompanyTable({ companies, currentUserId }: CompanyTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState<'mine' | 'all'>('mine')

  const filtered = useMemo(() => {
    let result = companies
    if (ownerFilter === 'mine') result = result.filter(c => c.createdById === currentUserId)
    if (!search.trim()) return result
    const q = search.toLowerCase()
    return result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.industry ?? '').toLowerCase().includes(q) ||
      (c.headOffice ?? '').toLowerCase().includes(q)
    )
  }, [companies, ownerFilter, currentUserId, search])

  if (companies.length === 0) {
    return <EmptyState message="Companies will appear here." />
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        {/* Owner toggle */}
        <div style={{ display: 'flex', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', height: '34px', flexShrink: 0 }}>
          {(['mine', 'all'] as const).map(v => (
            <button
              key={v}
              onClick={() => setOwnerFilter(v)}
              style={{
                padding: '0 14px', fontSize: '12px', fontWeight: 500,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: ownerFilter === v ? 'var(--color-accent)' : 'transparent',
                color: ownerFilter === v ? '#fff' : 'var(--color-text-2)',
                transition: 'background 150ms, color 150ms',
              }}
            >
              {v === 'mine' ? 'My Companies' : 'All Companies'}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
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
            placeholder="Search by name, industry, city…"
            style={{ ...filterInputStyle, paddingLeft: '30px', width: '280px' }}
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
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
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
          >
            <X size={12} /> Clear
          </button>
        )}
        {(search || ownerFilter === 'mine') && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-3)', marginLeft: '4px' }}>
            {filtered.length} of {companies.length} companies
          </span>
        )}
      </div>

      <div className="card-3d" style={{ overflow: 'hidden', padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-3)', fontSize: '14px' }}>
            {search ? `No companies match "${search}".` : ownerFilter === 'mine' ? 'You have not created any companies yet.' : 'No companies found.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Territory</th>
                <th>Head Office</th>
                <th>Open Opps</th>
                <th>Pipeline Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company) => (
                <tr
                  key={company.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/companies/${company.id}`)}
                >
                  <td style={{ color: 'var(--color-text-1)', fontWeight: 500 }}>{company.name}</td>
                  <td>{company.industry ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                  <td>{company.territory?.name ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                  <td>{company.headOffice ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {company.openOpportunities ?? company._count.opportunities}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {formatINR(company.pipelineValue ?? 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
