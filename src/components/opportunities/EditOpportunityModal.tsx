'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { useToast } from '@/contexts/ToastContext'
import type { OpportunityWithRelations } from '@/types/api'

interface EditOpportunityModalProps {
  opp: OpportunityWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (updated: OpportunityWithRelations) => void
}

interface Territory { id: string; name: string }

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

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-text-3)', marginBottom: '5px',
}
const FIELD: React.CSSProperties = { marginBottom: '14px' }
const ERR: React.CSSProperties = { fontSize: '11px', color: 'var(--color-danger)', marginTop: '3px' }

export function EditOpportunityModal({ opp, open, onOpenChange, onSaved }: EditOpportunityModalProps) {
  const { showToast } = useToast()
  const [territories, setTerritories] = useState<Territory[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    title: '',
    closeDate: '',
    stage: '',
    priority: '',
    territoryId: '',
    description: '',
  })

  useEffect(() => {
    if (!open) return
    setForm({
      title: opp.title,
      closeDate: opp.closeDate ? String(opp.closeDate).split('T')[0] : '',
      stage: opp.stage,
      priority: opp.priority,
      territoryId: opp.territory?.id ?? '',
      description: opp.description ?? '',
    })
    setErrors({})
    fetch('/api/territories').then(r => r.json()).then(d => setTerritories(d))
  }, [open, opp])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.closeDate) newErrors.closeDate = 'Close date is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    try {
      const res = await fetch(`/api/opportunities/${opp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          closeDate: new Date(form.closeDate).toISOString(),
          stage: form.stage,
          priority: form.priority,
          territoryId: form.territoryId || null,
          description: form.description || undefined,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        showToast('Opportunity updated', 'success')
        onSaved(updated)
        onOpenChange(false)
      } else {
        const err = await res.json()
        showToast(err.error ?? 'Failed to save', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const territoryOptions = territories.map(t => ({ value: t.id, label: t.name }))

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit Opportunity">
      <div>
        <div style={FIELD}>
          <label style={LABEL}>Title *</label>
          <input
            value={form.title}
            onChange={set('title')}
            style={errors.title ? { borderColor: 'var(--color-danger)' } : undefined}
          />
          {errors.title && <p style={ERR}>{errors.title}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={LABEL}>Close Date *</label>
            <input
              type="date"
              value={form.closeDate}
              onChange={set('closeDate')}
              style={errors.closeDate ? { borderColor: 'var(--color-danger)' } : undefined}
            />
            {errors.closeDate && <p style={ERR}>{errors.closeDate}</p>}
          </div>
          <div>
            <label style={LABEL}>Priority</label>
            <select value={form.priority} onChange={set('priority')}>
              {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div style={FIELD}>
          <label style={LABEL}>Stage</label>
          <select value={form.stage} onChange={set('stage')}>
            {STAGE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div style={FIELD}>
          <label style={LABEL}>Territory</label>
          <SearchableSelect
            value={form.territoryId}
            onChange={v => setForm(f => ({ ...f, territoryId: v }))}
            options={[{ value: '', label: 'None' }, ...territoryOptions]}
            placeholder="Select territory…"
          />
        </div>

        <div style={FIELD}>
          <label style={LABEL}>Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3} style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '0.5px solid var(--color-border)' }}>
          <button type="button" className="btn-secondary" onClick={() => onOpenChange(false)}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
