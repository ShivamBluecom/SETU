'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/contexts/ToastContext'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import type { SessionUser } from '@/types/api'

interface Step1DetailsProps {
  opportunityId: string | null
  onNext: (opportunityId: string) => void
}

interface SelectOption { id: string; name: string }
interface ContactOption { id: string; name: string; designation?: string | null }

const STAGE_OPTIONS = [
  { value: 'PROSPECTING', label: 'Prospecting' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

const fieldStyle: React.CSSProperties = { marginBottom: '16px' }
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 500,
  color: 'var(--color-text-3)', marginBottom: '5px',
}
const errStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--color-danger)', marginTop: '3px',
}

export function Step1Details({ opportunityId, onNext }: Step1DetailsProps) {
  const { data: session } = useSession()
  const user = session?.user as SessionUser | undefined
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [companies, setCompanies] = useState<SelectOption[]>([])
  const [contacts, setContacts] = useState<ContactOption[]>([])
  const [territories, setTerritories] = useState<SelectOption[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [additionalContactIds, setAdditionalContactIds] = useState<string[]>([])
  const [originalAdditionalContactIds, setOriginalAdditionalContactIds] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    companyId: '',
    primaryContactId: '',
    closeDate: '',
    stage: 'PROSPECTING',
    priority: 'MEDIUM',
    territoryId: '',
    description: '',
  })

  // Load reference data
  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(d => setCompanies(d.map((c: SelectOption) => ({ id: c.id, name: c.name }))))
    fetch('/api/territories').then(r => r.json()).then(d => setTerritories(d))
  }, [])

  // Pre-fill territory for locked roles
  useEffect(() => {
    if (!user) return
    if (user.role === 'TERRITORY_MANAGER' && user.territoryId) {
      setForm(f => ({ ...f, territoryId: user.territoryId! }))
    } else if (user.role === 'ACCOUNT_MANAGER' && user.territoryIds?.[0]) {
      setForm(f => ({ ...f, territoryId: user.territoryIds[0] }))
    }
  }, [user?.role, user?.territoryId, user?.territoryIds?.[0]])

  // Load contacts when company changes
  useEffect(() => {
    setForm(f => ({ ...f, primaryContactId: '' }))
    setAdditionalContactIds([])
    setOriginalAdditionalContactIds([])
    if (!form.companyId) { setContacts([]); return }
    fetch(`/api/contacts?companyId=${form.companyId}`).then(r => r.json()).then(d => setContacts(d))
  }, [form.companyId])

  // Load existing draft if resuming
  useEffect(() => {
    if (!opportunityId) return
    fetch(`/api/opportunities/${opportunityId}`).then(r => r.json()).then(opp => {
      setForm({
        title: opp.title ?? '',
        companyId: opp.company?.id ?? '',
        primaryContactId: opp.primaryContact?.id ?? '',
        closeDate: opp.closeDate ? String(opp.closeDate).split('T')[0] : '',
        stage: opp.stage ?? 'PROSPECTING',
        priority: opp.priority ?? 'MEDIUM',
        territoryId: opp.territory?.id ?? '',
        description: opp.description ?? '',
      })
      const addl = (opp.additionalContacts ?? []).map((ac: { contactId: string }) => ac.contactId)
      setAdditionalContactIds(addl)
      setOriginalAdditionalContactIds(addl)
    })
  }, [opportunityId])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(prev => { const next = { ...prev }; delete next[k]; return next })
  }

  const isTerritoryLocked = user?.role === 'TERRITORY_MANAGER' || user?.role === 'ACCOUNT_MANAGER'

  const availableAdditionalContacts = contacts.filter(
    c => c.id !== form.primaryContactId && !additionalContactIds.includes(c.id)
  )

  const handleSave = async (advance: boolean) => {
    const newErrors: Record<string, string> = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.companyId) newErrors.companyId = 'Company is required'
    if (!form.closeDate) newErrors.closeDate = 'Close date is required'
    if (!form.primaryContactId) newErrors.primaryContactId = 'Primary contact is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    try {
      const body = {
        ...form,
        status: 'DRAFT',
        primaryContactId: form.primaryContactId || undefined,
        territoryId: form.territoryId || undefined,
        description: form.description || undefined,
        closeDate: new Date(form.closeDate).toISOString(),
      }

      let res: Response
      let id = opportunityId

      if (opportunityId) {
        res = await fetch(`/api/opportunities/${opportunityId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error ?? 'Failed to save', 'error')
        return
      }

      const data = await res.json()
      id = data.id

      // Sync additional contacts
      const toAdd = additionalContactIds.filter(cId => !originalAdditionalContactIds.includes(cId))
      const toRemove = originalAdditionalContactIds.filter(cId => !additionalContactIds.includes(cId))

      await Promise.all([
        ...toAdd.map(contactId =>
          fetch(`/api/opportunities/${id}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId }),
          })
        ),
        ...toRemove.map(contactId =>
          fetch(`/api/opportunities/${id}/contacts`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId }),
          })
        ),
      ])

      setOriginalAdditionalContactIds([...additionalContactIds])
      showToast('Draft saved', 'success')
      if (advance && id) onNext(id)
    } finally {
      setSaving(false)
    }
  }

  const companyOptions = companies.map(c => ({ value: c.id, label: c.name }))
  const territoryOptions = territories.map(t => ({ value: t.id, label: t.name }))

  return (
    <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
      <div style={fieldStyle}>
        <label style={labelStyle}>Title *</label>
        <input
          value={form.title}
          onChange={set('title')}
          placeholder="e.g. Cisco Network Refresh — ACME Corp"
          style={errors.title ? { borderColor: 'var(--color-danger)' } : undefined}
        />
        {errors.title && <p style={errStyle}>{errors.title}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Company *</label>
          <SearchableSelect
            value={form.companyId}
            onChange={v => {
              setForm(f => ({ ...f, companyId: v }))
              if (errors.companyId) setErrors(prev => { const next = { ...prev }; delete next.companyId; return next })
            }}
            options={companyOptions}
            placeholder="Select company…"
            style={errors.companyId ? { outline: '1px solid var(--color-danger)', borderRadius: '6px' } : undefined}
          />
          {errors.companyId && <p style={errStyle}>{errors.companyId}</p>}
        </div>
        <div>
          <label style={labelStyle}>Primary Contact *</label>
          <select
            value={form.primaryContactId}
            onChange={set('primaryContactId')}
            disabled={!form.companyId}
            style={errors.primaryContactId ? { borderColor: 'var(--color-danger)' } : undefined}
          >
            <option value="">Select contact…</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name}{c.designation ? ` · ${c.designation}` : ''}</option>)}
          </select>
          {errors.primaryContactId && <p style={errStyle}>{errors.primaryContactId}</p>}
        </div>
      </div>

      {/* Additional Contacts */}
      {form.companyId && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Additional Contacts</label>
          {additionalContactIds.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {additionalContactIds.map(id => {
                const contact = contacts.find(c => c.id === id)
                return (
                  <span
                    key={id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 8px',
                      background: 'var(--color-accent-bg)', color: 'var(--color-accent-text)',
                      borderRadius: '4px', fontSize: '12px',
                    }}
                  >
                    {contact?.name ?? id}
                    <button
                      type="button"
                      onClick={() => setAdditionalContactIds(prev => prev.filter(x => x !== id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0 0 0 2px', fontSize: '14px', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          )}
          {availableAdditionalContacts.length > 0 && (
            <select
              value=""
              onChange={e => { if (e.target.value) setAdditionalContactIds(prev => [...prev, e.target.value]) }}
            >
              <option value="">+ Add contact…</option>
              {availableAdditionalContacts.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.designation ? ` · ${c.designation}` : ''}</option>
              ))}
            </select>
          )}
          {form.companyId && contacts.length === 0 && (
            <p style={{ fontSize: '11px', color: 'var(--color-text-3)', margin: '4px 0 0' }}>
              No contacts for this company yet.
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Close Date *</label>
          <input
            type="date"
            value={form.closeDate}
            onChange={set('closeDate')}
            style={errors.closeDate ? { borderColor: 'var(--color-danger)' } : undefined}
          />
          {errors.closeDate && <p style={errStyle}>{errors.closeDate}</p>}
        </div>
        <div>
          <label style={labelStyle}>Stage</label>
          <select value={form.stage} onChange={set('stage')}>
            {STAGE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select value={form.priority} onChange={set('priority')}>
            {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>
          Territory
          {isTerritoryLocked && (
            <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--color-accent)' }}>● assigned</span>
          )}
        </label>
        {isTerritoryLocked ? (
          <select value={form.territoryId} disabled>
            {territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        ) : (
          <SearchableSelect
            value={form.territoryId}
            onChange={v => setForm(f => ({ ...f, territoryId: v }))}
            options={[{ value: '', label: 'None' }, ...territoryOptions]}
            placeholder="Select territory…"
          />
        )}
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="Additional context, background, customer needs…"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '0.5px solid var(--color-border)' }}>
        {opportunityId ? (
          <button
            type="button"
            className="btn-secondary"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            onClick={async () => {
              if (!window.confirm('Delete this draft? This cannot be undone.')) return
              const res = await fetch(`/api/opportunities/${opportunityId}`, { method: 'DELETE' })
              if (res.ok) {
                showToast('Draft deleted', 'success')
                window.location.href = '/opportunities'
              } else {
                showToast('Failed to delete draft', 'error')
              }
            }}
          >
            Delete Draft
          </button>
        ) : <span />}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
            Save Draft
          </button>
          <button type="button" className="btn-primary" onClick={() => handleSave(true)} disabled={saving}>
            {saving ? 'Saving…' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
