'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'

export function NewCompanyButton() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const [form, setForm] = useState({ name: '', industry: '', website: '', headOffice: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, string> = { name: form.name }
      if (form.industry) body.industry = form.industry
      if (form.website) body.website = form.website
      if (form.headOffice) body.headOffice = form.headOffice

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        showToast('Company created', 'success')
        setOpen(false)
        setForm({ name: '', industry: '', website: '', headOffice: '' })
        router.refresh()
      } else {
        showToast('Failed to create company', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '4px' }

  return (
    <>
      <button
        className="btn-primary"
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Plus size={14} /> New Company
      </button>

      <Modal open={open} onOpenChange={setOpen} title="New Company">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Company Name *</label>
            <input value={form.name} onChange={set('name')} required placeholder="Acme Corp" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Industry</label>
            <input value={form.industry} onChange={set('industry')} placeholder="Technology, Manufacturing…" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Head Office</label>
              <input value={form.headOffice} onChange={set('headOffice')} placeholder="Mumbai" />
            </div>
            <div>
              <label style={labelStyle}>Website</label>
              <input type="url" value={form.website} onChange={set('website')} placeholder="https://…" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
