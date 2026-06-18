'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import type { OpportunityStage, OpportunityPriority } from '@/types/enums'
import type { SessionUser } from '@/types/api'

interface NewOpportunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStage?: OpportunityStage
  onCreated: () => void
}

interface SelectOption { id: string; name: string }

const BLANK_FORM = (stage: OpportunityStage) => ({
  title: '',
  companyId: '',
  primaryContactId: '',
  value: '',
  closeDate: '',
  stage,
  priority: 'MEDIUM' as OpportunityPriority,
  productService: '',
  description: '',
  buId: '',
  buOwnerId: '',
  territoryId: '',
})

// Roles whose BU dropdown is locked to their assigned BU
const BU_LOCKED_ROLES = ['ISR', 'BU_MANAGER', 'BU_HEAD']
// Roles whose Territory dropdown is locked to their assigned territory
const TERRITORY_LOCKED_ROLES = ['ISR', 'BU_MANAGER', 'TERRITORY_MANAGER']
// Roles that can assign an opportunity owner
const ASSIGN_OWNER_ROLES = ['BU_HEAD', 'TERRITORY_MANAGER', 'ADMIN']

export function NewOpportunityModal({
  open,
  onOpenChange,
  defaultStage = 'PROSPECTING',
  onCreated,
}: NewOpportunityModalProps) {
  const { data: session } = useSession()
  const currentUser = session?.user as SessionUser | undefined

  const buLocked = !!currentUser && BU_LOCKED_ROLES.includes(currentUser.role)
  const territoryLocked = !!currentUser && TERRITORY_LOCKED_ROLES.includes(currentUser.role)
  const canAssignOwner = !!currentUser && ASSIGN_OWNER_ROLES.includes(currentUser.role)

  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [companies, setCompanies] = useState<SelectOption[]>([])
  const [contacts, setContacts] = useState<SelectOption[]>([])
  const [allBUs, setAllBUs] = useState<SelectOption[]>([])
  const [allTerritories, setAllTerritories] = useState<SelectOption[]>([])
  const [buOwners, setBUOwners] = useState<SelectOption[]>([])

  const [form, setForm] = useState(BLANK_FORM(defaultStage))

  // Filter BUs and territories to only what this role can access
  const visibleBUs = useMemo(() => {
    if (!currentUser || !buLocked || !currentUser.buId) return allBUs
    return allBUs.filter(b => b.id === currentUser.buId)
  }, [allBUs, currentUser, buLocked])

  const visibleTerritories = useMemo(() => {
    if (!currentUser || !territoryLocked || !currentUser.territoryId) return allTerritories
    return allTerritories.filter(t => t.id === currentUser.territoryId)
  }, [allTerritories, currentUser, territoryLocked])

  // Fetch reference data when modal opens
  useEffect(() => {
    if (!open) return
    fetch('/api/companies').then(r => r.json()).then(d => setCompanies(d.map((c: SelectOption) => ({ id: c.id, name: c.name }))))
    fetch('/api/business-units').then(r => r.json()).then(d => setAllBUs(d.map((b: SelectOption) => ({ id: b.id, name: b.name }))))
    fetch('/api/territories').then(r => r.json()).then(d => setAllTerritories(d.map((t: SelectOption) => ({ id: t.id, name: t.name }))))
  }, [open])

  // Pre-fill locked fields as soon as the modal opens or the user is known
  useEffect(() => {
    if (!open || !currentUser) return
    setForm(f => ({
      ...f,
      buId: buLocked && currentUser.buId ? currentUser.buId : f.buId,
      territoryId: territoryLocked && currentUser.territoryId ? currentUser.territoryId : f.territoryId,
    }))
  }, [open, currentUser?.role, currentUser?.buId, currentUser?.territoryId])

  // Fetch contacts when company changes
  useEffect(() => {
    setForm(f => ({ ...f, primaryContactId: '' }))
    if (!form.companyId) { setContacts([]); return }
    fetch(`/api/contacts?companyId=${form.companyId}`).then(r => r.json()).then(d => setContacts(d.map((c: SelectOption) => ({ id: c.id, name: c.name }))))
  }, [form.companyId])

  // Fetch BU owners when BU changes (only for roles that can assign)
  useEffect(() => {
    setForm(f => ({ ...f, buOwnerId: '' }))
    if (!form.buId || !canAssignOwner) { setBUOwners([]); return }
    fetch(`/api/users?buId=${form.buId}&roles=BU_MANAGER,ACCOUNT_MANAGER`).then(r => r.json()).then(d => setBUOwners(d.map((u: SelectOption) => ({ id: u.id, name: u.name }))))
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
        setForm(BLANK_FORM(defaultStage))
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
  const lockedHint: React.CSSProperties = { fontSize: '11px', color: 'var(--color-text-3)', marginTop: '3px' }

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

        {currentUser?.role !== 'ACCOUNT_MANAGER' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>
                Business Unit
                {buLocked && <span style={{ marginLeft: '4px', color: 'var(--color-accent)', fontSize: '10px' }}>● assigned</span>}
              </label>
              <select value={form.buId} onChange={set('buId')} disabled={buLocked && !!currentUser?.buId}>
                <option value="">Select BU</option>
                {visibleBUs.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {buLocked && !currentUser?.buId && (
                <p style={lockedHint}>No BU assigned — contact admin</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>
                Territory
                {territoryLocked && <span style={{ marginLeft: '4px', color: 'var(--color-accent)', fontSize: '10px' }}>● assigned</span>}
              </label>
              <select value={form.territoryId} onChange={set('territoryId')} disabled={territoryLocked && !!currentUser?.territoryId}>
                <option value="">Select territory</option>
                {visibleTerritories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {territoryLocked && !currentUser?.territoryId && (
                <p style={lockedHint}>No territory assigned — contact admin</p>
              )}
            </div>
          </div>
        )}

        {canAssignOwner && visibleBUs.length > 0 && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Assign Owner</label>
            <select value={form.buOwnerId} onChange={set('buOwnerId')} disabled={!form.buId}>
              <option value="">Unassigned</option>
              {buOwners.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
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
