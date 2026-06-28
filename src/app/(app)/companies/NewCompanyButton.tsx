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
  const [nameError, setNameError] = useState('')
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
    if (k === 'name') setNameError('')
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError('')
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        industry: form.industry || undefined,
        website: form.website || undefined,
        address: form.address || undefined,
        gstNumber: form.gstNumber || undefined,
        userCount: form.userCount ? parseInt(form.userCount) : undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        territoryId: form.territoryId || undefined,
      }
      Object.keys(body).forEach(k => body[k] === undefined && delete body[k])

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
          setNameError(err.error)
        } else {
          showToast(err.error ?? 'Company already exists', 'error')
        }
      } else {
        const err = await res.json().catch(() => null)
        const msg = err?.details?.fieldErrors
          ? Object.values(err.details.fieldErrors as Record<string, string[]>).flat().join('; ')
          : err?.error ?? 'Failed to create company'
        showToast(msg, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 500,
    color: 'var(--color-text-3)', marginBottom: '4px',
  }

  return (
    <>
      <button
        className="btn-primary"
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Plus size={14} /> New Company
      </button>

      <Modal open={open} onOpenChange={setOpen} title="New Company" maxWidth="580px">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Company Name *</label>
            <input
              value={form.name}
              onChange={set('name')}
              required
              placeholder="Acme Corp"
              style={{ borderColor: nameError ? 'var(--color-danger)' : undefined }}
            />
            {nameError && (
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-danger)' }}>{nameError}</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Industry</label>
              <select value={form.industry} onChange={set('industry')}>
                <option value="">Select…</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Territory</label>
              <select value={form.territoryId} onChange={set('territoryId')}>
                <option value="">Select…</option>
                {territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Address</label>
            <input value={form.address} onChange={set('address')} placeholder="Full office address" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>GST Number</label>
              <input value={form.gstNumber} onChange={set('gstNumber')} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div>
              <label style={labelStyle}>User Count</label>
              <input type="number" min="0" value={form.userCount} onChange={set('userCount')} placeholder="e.g. 250" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Website</label>
              <input value={form.website} onChange={set('website')} placeholder="https://acme.com" />
            </div>
            <div>
              <label style={labelStyle}>LinkedIn URL</label>
              <input value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/company/…" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={() => { setOpen(false); setNameError('') }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
