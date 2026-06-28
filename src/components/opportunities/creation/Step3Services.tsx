'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { formatINR } from '@/lib/format'
import { Trash2 } from 'lucide-react'

interface ServiceAddon {
  id: string
  type: string
  description: string | null
  value: string | number
}

interface Step3ServicesProps {
  opportunityId: string
  onNext: () => void
  onBack: () => void
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 500,
  color: 'var(--color-text-3)', marginBottom: '4px',
}

function ServiceSection({
  type,
  label,
  subtitle,
  opportunityId,
  services,
  onAdded,
  onDeleted,
}: {
  type: 'MANAGED' | 'IMPLEMENTATION'
  label: string
  subtitle: string
  opportunityId: string
  services: ServiceAddon[]
  onAdded: () => void
  onDeleted: (id: string) => void
}) {
  const { showToast } = useToast()
  const [adding, setAdding] = useState(false)
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const existing = services.filter(s => s.type === type)
  const hasExisting = existing.length > 0

  const handleAdd = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          description: description.trim() || undefined,
          value: parseFloat(value) || 0,
        }),
      })
      if (res.ok) {
        showToast(`${label} added`, 'success')
        setDescription('')
        setValue('')
        setAdding(false)
        onAdded()
      } else {
        showToast('Failed to add', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/opportunities/${opportunityId}/services/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Removed', 'success')
      onDeleted(id)
    } else {
      showToast('Failed to remove', 'error')
    }
  }

  return (
    <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '12px 16px', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-3)' }}>{subtitle}</p>
        </div>
        {!adding && !hasExisting && (
          <button className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={() => setAdding(true)}>
            + Add
          </button>
        )}
      </div>

      {hasExisting && (
        <div>
          {existing.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderTop: '0.5px solid var(--color-border)', background: 'var(--color-bg)' }}>
              <div style={{ flex: 1 }}>
                {s.description && <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-2)' }}>{s.description}</p>}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>{formatINR(s.value)}</span>
              <button
                onClick={() => handleDelete(s.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '4px', display: 'flex' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div style={{ padding: '16px', borderTop: '0.5px solid var(--color-border)', background: 'var(--color-bg)' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={LABEL_STYLE}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Scope of services…"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={LABEL_STYLE}>Value ₹ {type === 'MANAGED' ? '(ARR)' : ''}</label>
            <input type="number" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="0" style={{ maxWidth: '200px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => { setAdding(false); setDescription(''); setValue('') }}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding…' : 'Add'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Step3Services({ opportunityId, onNext, onBack }: Step3ServicesProps) {
  const [services, setServices] = useState<ServiceAddon[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`)
      const data = await res.json()
      setServices(data.serviceAddons ?? [])
    } finally {
      setLoading(false)
    }
  }, [opportunityId])

  useEffect(() => { load() }, [load])

  const handleDeleted = (id: string) => setServices(prev => prev.filter(s => s.id !== id))

  return (
    <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>Service Add-ons</p>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-3)' }}>Optionally add Managed Services or Implementation services to this opportunity. Skip if not applicable.</p>
      </div>

      {loading ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>Loading…</p>
      ) : (
        <>
          <ServiceSection
            type="MANAGED"
            label="Managed Services"
            subtitle="Annual Recurring Revenue (ARR)"
            opportunityId={opportunityId}
            services={services}
            onAdded={load}
            onDeleted={handleDeleted}
          />
          <ServiceSection
            type="IMPLEMENTATION"
            label="Implementation"
            subtitle="One-time implementation / professional services value"
            opportunityId={opportunityId}
            services={services}
            onAdded={load}
            onDeleted={handleDeleted}
          />
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '0.5px solid var(--color-border)' }}>
        <button type="button" className="btn-secondary" onClick={onBack}>← Back</button>
        <button type="button" className="btn-primary" onClick={onNext}>Next →</button>
      </div>
    </div>
  )
}
