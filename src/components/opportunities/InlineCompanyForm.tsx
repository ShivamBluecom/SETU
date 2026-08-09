'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { WebsiteInput } from '@/components/ui/WebsiteInput'
import { useToast } from '@/contexts/ToastContext'

interface InlineCompanyFormProps {
  territories: { id: string; name: string }[]
  onCreated: (company: { id: string; name: string; createdById?: string | null }) => void
  onCancel: () => void
}

const INDUSTRIES = [
  'Technology', 'Manufacturing', 'Healthcare', 'Finance & Banking', 'Retail',
  'Education', 'Government', 'Logistics & Transport', 'Real Estate',
  'Hospitality', 'Media & Entertainment', 'Telecom', 'Energy & Utilities', 'Other',
]

const BLANK = {
  name: '', industry: '', territoryId: '', address: '',
  userCount: '', website: '', gstNumber: '', linkedinUrl: '',
}

export function InlineCompanyForm({ territories, onCreated, onCancel }: InlineCompanyFormProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n })
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.industry) errs.industry = 'Required'
    if (!form.territoryId) errs.territoryId = 'Required'
    if (!form.address.trim()) errs.address = 'Required'
    if (form.userCount === '' || isNaN(parseInt(form.userCount))) errs.userCount = 'Required'
    if (!form.website.trim()) errs.website = 'Required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
        industry: form.industry,
        territoryId: form.territoryId,
        address: form.address.trim(),
        userCount: parseInt(form.userCount),
        website: form.website.trim(),
        gstNumber: form.gstNumber || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
      }
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const company = await res.json()
        showToast('Company created', 'success')
        onCreated({ id: company.id, name: company.name, createdById: company.createdById })
      } else if (res.status === 409) {
        const err = await res.json()
        setErrors({ name: err.error ?? 'Company already exists' })
      } else {
        const err = await res.json().catch(() => null)
        const fieldErrors: Record<string, string[]> = err?.details?.fieldErrors ?? {}
        const mapped: Record<string, string> = {}
        for (const [field, msgs] of Object.entries(fieldErrors)) {
          mapped[field] = (msgs as string[])[0] ?? 'Invalid'
        }
        if (Object.keys(mapped).length > 0) setErrors(mapped)
        else showToast(err?.error ?? 'Failed to create company', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--color-text-3)', marginBottom: '3px' }
  const errMsg = (k: string) => errors[k]
    ? <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-danger)' }}>{errors[k]}</p>
    : null
  const bc = (k: string): React.CSSProperties | undefined => errors[k] ? { borderColor: 'var(--color-danger)' } : undefined

  return (
    <div style={{ marginTop: '8px', padding: '12px', background: 'var(--color-surface-2)', border: '0.5px solid var(--color-border)', borderLeft: '3px solid var(--color-accent)', borderRadius: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--color-text-1)' }}>New Company</p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel new company"
          style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-text-3)' }}
        >
          <X size={14} />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={lbl}>Company Name *</label>
          <input value={form.name} onChange={set('name')} placeholder="Acme Corp" style={bc('name')} />
          {errMsg('name')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={lbl}>Industry *</label>
            <select value={form.industry} onChange={set('industry')} style={bc('industry')}>
              <option value="">Select…</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            {errMsg('industry')}
          </div>
          <div>
            <label style={lbl}>Territory *</label>
            <select value={form.territoryId} onChange={set('territoryId')} style={bc('territoryId')}>
              <option value="">Select…</option>
              {territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errMsg('territoryId')}
          </div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={lbl}>Address *</label>
          <input value={form.address} onChange={set('address')} placeholder="Full office address" style={bc('address')} />
          {errMsg('address')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={lbl}>GST Number</label>
            <input value={form.gstNumber} onChange={set('gstNumber')} placeholder="22AAAAA0000A1Z5" />
          </div>
          <div>
            <label style={lbl}>User Count *</label>
            <input type="number" min="0" value={form.userCount} onChange={set('userCount')} placeholder="e.g. 250" style={bc('userCount')} />
            {errMsg('userCount')}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={lbl}>Website *</label>
            <WebsiteInput
              value={form.website}
              onChange={v => { setErrors(prev => { const n = { ...prev }; delete n.website; return n }); setForm(f => ({ ...f, website: v })) }}
              style={bc('website')}
            />
            {errMsg('website')}
          </div>
          <div>
            <label style={lbl}>LinkedIn URL</label>
            <input value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/company/…" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ fontSize: '12px' }}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: '12px' }}>
            {saving ? 'Creating…' : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  )
}
