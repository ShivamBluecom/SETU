'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import type { Contact } from '@prisma/client'

interface EditContactModalProps {
  contact: Contact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditContactModal({ contact, open, onOpenChange, onSaved }: EditContactModalProps) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    personalEmail: '',
    personalPhone: '',
    alternatePhone: '',
    linkedinUrl: '',
  })

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name ?? '',
        designation: contact.designation ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        personalEmail: contact.personalEmail ?? '',
        personalPhone: contact.personalPhone ?? '',
        alternatePhone: contact.alternatePhone ?? '',
        linkedinUrl: contact.linkedinUrl ?? '',
      })
    }
  }, [contact])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const setPhone = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value.replace(/[^0-9+\-\s]/g, '') }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contact) return
    setSaving(true)
    try {
      const body: Record<string, string | undefined> = {
        name: form.name,
        designation: form.designation || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        personalEmail: form.personalEmail || undefined,
        personalPhone: form.personalPhone || undefined,
        alternatePhone: form.alternatePhone || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
      }

      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        showToast('Contact updated', 'success')
        onOpenChange(false)
        onSaved()
      } else {
        const err = await res.json().catch(() => null)
        const msg = err?.details?.fieldErrors
          ? Object.values(err.details.fieldErrors as Record<string, string[]>).flat().join('; ')
          : err?.error ?? 'Failed to update contact'
        showToast(msg, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '4px' }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit Contact" maxWidth="520px">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Name *</label>
          <input value={form.name} onChange={set('name')} required placeholder="Full name" />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Designation</label>
          <input value={form.designation} onChange={set('designation')} placeholder="e.g. CTO, VP Sales" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Work Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="email@company.com" />
          </div>
          <div>
            <label style={labelStyle}>Work Phone</label>
            <input type="tel" value={form.phone} onChange={setPhone('phone')} placeholder="+91 98765 43210" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Personal Email</label>
            <input type="email" value={form.personalEmail} onChange={set('personalEmail')} placeholder="personal@gmail.com" />
          </div>
          <div>
            <label style={labelStyle}>Personal Phone</label>
            <input type="tel" value={form.personalPhone} onChange={setPhone('personalPhone')} placeholder="+91 98765 43210" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Alternate Phone</label>
            <input type="tel" value={form.alternatePhone} onChange={setPhone('alternatePhone')} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label style={labelStyle}>LinkedIn URL</label>
            <input value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/…" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
          <button type="button" className="btn-secondary" onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}
