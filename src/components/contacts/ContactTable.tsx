'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import type { Contact, Company } from '@prisma/client'
import { ContactRow } from './ContactRow'
import { EditContactModal } from './EditContactModal'
import { EmptyState } from '@/components/ui/EmptyState'

type ContactWithCompany = Contact & { company: Pick<Company, 'id' | 'name'> }

interface ContactTableProps {
  contacts: ContactWithCompany[]
  showCompany?: boolean
  onRefresh?: () => void
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
  width: 'auto',
}

export function ContactTable({ contacts, showCompany = true, onRefresh }: ContactTableProps) {
  const router = useRouter()
  const refresh = onRefresh ?? (() => router.refresh())
  const [editingContact, setEditingContact] = useState<ContactWithCompany | null>(null)

  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('')

  const companies = useMemo(() => {
    const seen = new Set<string>()
    return contacts
      .filter(c => !seen.has(c.company.id) && seen.add(c.company.id))
      .map(c => c.company)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [contacts])

  const hasFilters = search || filterCompany
  const clearFilters = () => { setSearch(''); setFilterCompany('') }

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      if (search) {
        const q = search.toLowerCase()
        const hit =
          c.name.toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q) ||
          (c.designation ?? '').toLowerCase().includes(q)
        if (!hit) return false
      }
      if (filterCompany && c.company.id !== filterCompany) return false
      return true
    })
  }, [contacts, search, filterCompany])

  if (contacts.length === 0) {
    return <EmptyState message="Contacts will appear here." />
  }

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
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
            placeholder="Search name, email, designation…"
            style={{ ...filterInputStyle, paddingLeft: '30px', width: '260px' }}
          />
        </div>

        {showCompany && companies.length > 1 && (
          <select
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
            style={{ ...filterInputStyle, paddingRight: '28px' }}
          >
            <option value="">All companies</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

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
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
          >
            <X size={12} /> Clear
          </button>
        )}

        {hasFilters && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-3)', marginLeft: '4px' }}>
            {filtered.length} of {contacts.length} contacts
          </span>
        )}
      </div>

      <div className="card-3d" style={{ overflow: 'hidden', padding: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-3)', fontSize: '14px' }}>
            No contacts match the current filters.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Designation</th>
                {showCompany && <th>Company</th>}
                <th>Email</th>
                <th>Phone</th>
                <th style={{ width: '40px' }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  showCompany={showCompany}
                  onEdit={setEditingContact}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EditContactModal
        contact={editingContact}
        open={!!editingContact}
        onOpenChange={open => { if (!open) setEditingContact(null) }}
        onSaved={() => { setEditingContact(null); refresh() }}
      />
    </>
  )
}
