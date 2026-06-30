'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'

interface Territory { id: string; name: string }

const INDUSTRIES = [
  'Technology', 'Manufacturing', 'Healthcare', 'Finance & Banking', 'Retail',
  'Education', 'Government', 'Logistics & Transport', 'Real Estate',
  'Hospitality', 'Media & Entertainment', 'Telecom', 'Energy & Utilities', 'Other',
]

const BLANK = {
  name: '', industry: '', website: '', address: '',
  gstNumber: '', userCount: '', linkedinUrl: '', territoryId: '',
}

export function NewCompanyButton() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [territories, setTerritories] = useState<Territory[]>([])
  const { showToast } = useToast()
  const router = useRouter()

  const [form, setForm] = useState(BLANK)

  useEffect(() => {
    if (open) {
      fetch('/api/territories').then(r => r.json()).then(d => setTerritories(d))
    }
  }, [open])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setErrors(prev => { const n = { ...prev }; delete n[k]; return n })
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        industry: form.industry,
        territoryId: form.territoryId,
        address: form.address.trim(),
        userCount: form.userCount !== '' ? parseInt(form.userCount) : undefined,
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
        showToast('Company created', 'success')
        setOpen(false)
        setForm(BLANK)
        router.refresh()
      } else if (res.status === 409) {
        const err = await res.json()
        if (err.field === 'name') {
          setErrors({ name: err.error })
        } else {
          showToast(err.error ?? 'Company already exists', 'error')
        }
      } else if (res.status === 400) {
        const err = await res.json().catch(() => null)
        const fieldErrors: Record<string, string[]> = err?.details?.fieldErrors ?? {}
        const mapped: Record<string, string> = {}
        for (const [field, msgs] of Object.entries(fieldErrors)) {
          mapped[field] = (msgs as string[])[0] ?? 'Invalid'
        }
        if (Object.keys(mapped).length > 0) {
          setErrors(mapped)
        } else {
          showToast(err?.error ?? 'Failed to create company', 'error')
        }
      } else {
        showToast('Failed to create company', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 500,
    color: 'var(--color-text-3)', marginBottom: '4px',
  }

  const errMsg = (field: string) =>
    errors[field] ? (
      <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-danger)' }}>{errors[field]}</p>
    ) : null

  const borderColor = (field: string) =>
    errors[field] ? 'var(--color-danger)' : undefined

  return (
    <>
      <button
        className="btn-primary"
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Plus size={14} /> New Company
      </button>

      <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) setErrors({}) }} title="New Company" maxWidth="580px">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Company Name *</label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="Acme Corp"
              style={{ borderColor: borderColor('name') }}
            />
            {errMsg('name')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Industry *</label>
              <select value={form.industry} onChange={set('industry')} style={{ borderColor: borderColor('industry') }}>
                <option value="">Select…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errMsg('industry')}
            </div>
            <div>
              <label style={labelStyle}>Territory *</label>
              <select value={form.territoryId} onChange={set('territoryId')} style={{ borderColor: borderColor('territoryId') }}>
                <option value="">Select…</option>
                {territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errMsg('territoryId')}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Address *</label>
            <input
              value={form.address}
              onChange={set('address')}
              placeholder="Full office address"
              style={{ borderColor: borderColor('address') }}
            />
            {errMsg('address')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>GST Number</label>
              <input value={form.gstNumber} onChange={set('gstNumber')} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div>
              <label style={labelStyle}>User Count *</label>
              <input
                type="number"
                min="0"
                value={form.userCount}
                onChange={set('userCount')}
                placeholder="e.g. 250"
                style={{ borderColor: borderColor('userCount') }}
              />
              {errMsg('userCount')}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Website *</label>
              <input
                value={form.website}
                onChange={set('website')}
                placeholder="https://acme.com"
                style={{ borderColor: borderColor('website') }}
              />
              {errMsg('website')}
            </div>
            <div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/company/…" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); setErrors({}) }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
