'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface InlineContactFormProps {
  companyId: string
  onCreated: (contact: { id: string; name: string; designation: string | null }) => void
  onCancel: () => void
}

const BLANK = {
  name: '', designation: '', email: '', phone: '',
  personalEmail: '', personalPhone: '', alternatePhone: '', linkedinUrl: '',
}

export function InlineContactForm({ companyId, onCreated, onCancel }: InlineContactFormProps) {
  const { showToast } = useToast()
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const setPhone = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value.replace(/[^0-9+\-\s]/g, '') }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, string> = {
        name: form.name,
        companyId,
        designation: form.designation,
        email: form.email,
        phone: form.phone,
      }
      if (form.personalEmail) body.personalEmail = form.personalEmail
      if (form.personalPhone) body.personalPhone = form.personalPhone
      if (form.alternatePhone) body.alternatePhone = form.alternatePhone
      if (form.linkedinUrl) body.linkedinUrl = form.linkedinUrl

      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const contact = await res.json()
        showToast('Contact created', 'success')
        onCreated({ id: contact.id, name: contact.name, designation: contact.designation ?? null })
      } else {
        const err = await res.json()
        showToast(err.error ?? 'Failed to create contact', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--color-text-3)', marginBottom: '3px' }

  return (
    <div style={{ marginTop: '8px', padding: '12px', background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '6px' }}>
      <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-1)' }}>New Contact</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={lbl}>Name *</label>
          <input value={form.name} onChange={set('name')} required placeholder="Full name" />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={lbl}>Designation *</label>
          <input value={form.designation} onChange={set('designation')} required placeholder="e.g. CTO, VP Sales" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={lbl}>Work Email *</label>
            <input type="email" value={form.email} onChange={set('email')} required placeholder="email@company.com" />
          </div>
          <div>
            <label style={lbl}>Work Phone *</label>
            <input type="tel" value={form.phone} onChange={setPhone('phone')} required placeholder="+91 98765 43210" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={lbl}>Personal Email</label>
            <input type="email" value={form.personalEmail} onChange={set('personalEmail')} placeholder="personal@gmail.com" />
          </div>
          <div>
            <label style={lbl}>Personal Phone</label>
            <input type="tel" value={form.personalPhone} onChange={setPhone('personalPhone')} placeholder="+91 98765 43210" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={lbl}>Alternate Phone</label>
            <input type="tel" value={form.alternatePhone} onChange={setPhone('alternatePhone')} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label style={lbl}>LinkedIn URL</label>
            <input value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/…" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ fontSize: '12px' }}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: '12px' }}>
            {saving ? 'Creating…' : 'Create Contact'}
          </button>
        </div>
      </form>
    </div>
  )
}
