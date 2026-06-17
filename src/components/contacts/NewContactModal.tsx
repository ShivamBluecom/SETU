'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'

interface NewContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCompanyId?: string
  onCreated: () => void
}

interface Company { id: string; name: string }

export function NewContactModal({ open, onOpenChange, defaultCompanyId, onCreated }: NewContactModalProps) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [form, setForm] = useState({
    name: '',
    companyId: defaultCompanyId ?? '',
    designation: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (!open) return
    fetch('/api/companies').then(r => r.json()).then(d => setCompanies(d))
  }, [open])

  useEffect(() => {
    if (defaultCompanyId) setForm(f => ({ ...f, companyId: defaultCompanyId }))
  }, [defaultCompanyId])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, string> = { name: form.name, companyId: form.companyId }
      if (form.designation) body.designation = form.designation
      if (form.email) body.email = form.email
      if (form.phone) body.phone = form.phone

      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        showToast('Contact created', 'success')
        onCreated()
        onOpenChange(false)
        setForm({ name: '', companyId: defaultCompanyId ?? '', designation: '', email: '', phone: '' })
      } else {
        const err = await res.json()
        showToast(err.error ?? 'Failed to create contact', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '4px' }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New Contact">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Name *</label>
          <input value={form.name} onChange={set('name')} required placeholder="Full name" />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Company *</label>
          <select value={form.companyId} onChange={set('companyId')} required disabled={!!defaultCompanyId}>
            <option value="">Select company</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Designation</label>
          <input value={form.designation} onChange={set('designation')} placeholder="e.g. CTO, VP Sales" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="email@company.com" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
          <button type="button" className="btn-secondary" onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  )
}
