'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import type { OpportunityStage, OpportunityPriority } from '@/types/enums'

interface NewOpportunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStage?: OpportunityStage
  canAssignOwner?: boolean
  onCreated: () => void
}

interface SelectOption { id: string; name: string }

export function NewOpportunityModal({
  open,
  onOpenChange,
  defaultStage = 'PROSPECTING',
  canAssignOwner = false,
  onCreated,
}: NewOpportunityModalProps) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [companies, setCompanies] = useState<SelectOption[]>([])
  const [contacts, setContacts] = useState<SelectOption[]>([])
  const [bus, setBUs] = useState<SelectOption[]>([])
  const [buOwners, setBUOwners] = useState<SelectOption[]>([])

  const [form, setForm] = useState({
    title: '',
    companyId: '',
    primaryContactId: '',
    value: '',
    closeDate: '',
    stage: defaultStage,
    priority: 'MEDIUM' as OpportunityPriority,
    productService: '',
    description: '',
    buId: '',
    buOwnerId: '',
  })

  useEffect(() => {
    if (!open) return
    fetch('/api/companies').then(r => r.json()).then(d => setCompanies(d.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))))
    fetch('/api/business-units').then(r => r.json()).then(d => setBUs(d.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }))))
  }, [open])

  useEffect(() => {
    setForm(f => ({ ...f, primaryContactId: '' }))
    if (!form.companyId) { setContacts([]); return }
    fetch(`/api/contacts?companyId=${form.companyId}`).then(r => r.json()).then(d => setContacts(d.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))))
  }, [form.companyId])

  useEffect(() => {
    setForm(f => ({ ...f, buOwnerId: '' }))
    if (!form.buId || !canAssignOwner) { setBUOwners([]); return }
    fetch(`/api/users?buId=${form.buId}&roles=BU_MANAGER,ACCOUNT_MANAGER`).then(r => r.json()).then(d => setBUOwners(d.map((u: { id: string; name: string }) => ({ id: u.id, name: u.name }))))
  }, [form.buId, canAssignOwner])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        ...form,
        value: parseFloat(form.value) || 0,
        closeDate: form.closeDate ? new Date(form.closeDate).toISOString() : undefined,
      }
      Object.keys(body).forEach(k => body[k] === '' && delete body[k])
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        showToast('Opportunity created', 'success')
        onCreated()
        onOpenChange(false)
        setForm({ title: '', companyId: '', primaryContactId: '', value: '', closeDate: '', stage: defaultStage, priority: 'MEDIUM', productService: '', description: '', buId: '', buOwnerId: '' })
      } else {
        const err = await res.json()
        showToast(err.error ?? 'Failed to create', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const fieldStyle = { marginBottom: '12px' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '4px' }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New Opportunity" maxWidth="560px">
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Title *</label>
          <input value={form.title} onChange={set('title')} required placeholder="Opportunity title" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Company *</label>
            <select value={form.companyId} onChange={set('companyId')} required>
              <option value="">Select company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Primary Contact</label>
            <select value={form.primaryContactId} onChange={set('primaryContactId')} disabled={!form.companyId}>
              <option value="">None</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Value (₹)</label>
            <input type="number" min="0" value={form.value} onChange={set('value')} placeholder="0" />
          </div>
          <div>
            <label style={labelStyle}>Close Date</label>
            <input type="date" value={form.closeDate} onChange={set('closeDate')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Stage</label>
            <select value={form.stage} onChange={set('stage')}>
              {(['PROSPECTING','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST'] as OpportunityStage[]).map(s => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase().replace('_',' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority} onChange={set('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Product / Service</label>
          <input value={form.productService} onChange={set('productService')} placeholder="e.g. SD-WAN, Managed WiFi" />
        </div>

        {bus.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Business Unit</label>
              <select value={form.buId} onChange={set('buId')}>
                <option value="">Select BU</option>
                {bus.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {canAssignOwner && (
              <div>
                <label style={labelStyle}>Assign Owner</label>
                <select value={form.buOwnerId} onChange={set('buOwnerId')} disabled={!form.buId}>
                  <option value="">Unassigned</option>
                  {buOwners.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Additional details…" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
          <button type="button" className="btn-secondary" onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  )
}
