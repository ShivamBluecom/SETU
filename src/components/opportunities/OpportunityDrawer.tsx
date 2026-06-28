'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, Share2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { StageBadge } from '@/components/ui/StageBadge'
import { Avatar } from '@/components/ui/Avatar'
import { NotesList } from './NotesList'
import { PocModal } from './PocModal'
import { LineItemForm, type LineItemInitialData } from '@/components/opportunities/creation/LineItemForm'
import { useToast } from '@/contexts/ToastContext'
import { formatINR, formatDate } from '@/lib/format'
import type { OpportunityWithRelations } from '@/types/api'
import type { OpportunityStage } from '@/types/enums'

interface OpportunityDrawerProps {
  opportunityId: string | null
  open: boolean
  onClose: () => void
  canEdit?: boolean
  onUpdated?: () => void
}

const STAGES: OpportunityStage[] = [
  'PROSPECTING', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST',
]

const STAGE_LABELS: Record<OpportunityStage, string> = {
  PROSPECTING: 'Prospecting',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
}

const SEC: React.CSSProperties = {
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'var(--color-text-3)', margin: 0,
}

const LBL: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 500,
  color: 'var(--color-text-3)', marginBottom: '4px',
}

export function OpportunityDrawer({
  opportunityId,
  open,
  onClose,
  onUpdated,
}: OpportunityDrawerProps) {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const { showToast } = useToast()

  const [opp, setOpp] = useState<OpportunityWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  // Line item edit state
  const [liExpanded, setLiExpanded] = useState<string | null>(null)
  const [liAddOpen, setLiAddOpen] = useState(false)

  // Service add state
  const [svcAddOpen, setSvcAddOpen] = useState(false)
  const [svcType, setSvcType] = useState<'MANAGED' | 'IMPLEMENTATION'>('MANAGED')
  const [svcDescription, setSvcDescription] = useState('')
  const [svcValue, setSvcValue] = useState('')
  const [svcSaving, setSvcSaving] = useState(false)

  useEffect(() => {
    if (!open || !opportunityId) return
    setLoading(true)
    setOpp(null)
    setLiExpanded(null)
    setLiAddOpen(false)
    setSvcAddOpen(false)
    fetch(`/api/opportunities/${opportunityId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setOpp(d))
      .finally(() => setLoading(false))
  }, [open, opportunityId])

  const reloadOpp = async () => {
    if (!opp) return
    const updated = await fetch(`/api/opportunities/${opp.id}`).then(r => r.ok ? r.json() : null)
    if (updated) setOpp(updated)
    onUpdated?.()
  }

  const handleStageChange = async (stage: OpportunityStage) => {
    if (!opp) return
    const res = await fetch(`/api/opportunities/${opp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOpp(prev => prev ? { ...prev, stage: updated.stage } : prev)
      showToast('Stage updated', 'success')
      onUpdated?.()
    } else {
      showToast('Failed to update stage', 'error')
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim() || !opp) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/opportunities/${opp.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteText }),
      })
      if (res.ok) {
        const note = await res.json()
        setOpp(prev => prev ? { ...prev, notes: [...(prev.notes ?? []), note] } : prev)
        setNoteText('')
        showToast('Note added', 'success')
      }
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteLineItem = async (liId: string) => {
    if (!opp) return
    const res = await fetch(`/api/opportunities/${opp.id}/line-items/${liId}`, { method: 'DELETE' })
    if (res.ok) {
      if (liExpanded === liId) setLiExpanded(null)
      showToast('Line item removed', 'success')
      await reloadOpp()
    } else {
      showToast('Failed to remove line item', 'error')
    }
  }

  const handleDeleteService = async (svcId: string) => {
    if (!opp) return
    const res = await fetch(`/api/opportunities/${opp.id}/services/${svcId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Service removed', 'success')
      await reloadOpp()
    } else {
      showToast('Failed to remove service', 'error')
    }
  }

  const handleAddService = async () => {
    if (!opp) return
    setSvcSaving(true)
    try {
      const res = await fetch(`/api/opportunities/${opp.id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: svcType,
          description: svcDescription.trim() || undefined,
          value: parseFloat(svcValue) || 0,
        }),
      })
      if (res.ok) {
        setSvcAddOpen(false)
        setSvcDescription('')
        setSvcValue('')
        showToast('Service added', 'success')
        await reloadOpp()
      } else {
        showToast('Failed to add service', 'error')
      }
    } finally {
      setSvcSaving(false)
    }
  }

  if (!open) return null

  const currentPocs = opp?.pocs ?? []
  const isOwner = !!currentUserId && !!opp?.createdBy && currentUserId === opp.createdBy.id
  const lineItems = opp?.lineItems ?? []
  const serviceAddons = opp?.serviceAddons ?? []

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 30 }}
        onClick={onClose}
      />
      <div
        className="drawer-enter"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '600px',
          background: 'var(--color-bg)',
          borderLeft: '0.5px solid var(--color-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          zIndex: 31, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {loading && (
          <div style={{ padding: '24px', color: 'var(--color-text-3)', fontSize: '13px' }}>Loading…</div>
        )}
        {!loading && !opp && (
          <div style={{ padding: '24px', color: 'var(--color-text-3)', fontSize: '13px' }}>Could not load opportunity.</div>
        )}

        {!loading && opp && (
          <>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: 'var(--color-text-1)' }}>{opp.title}</h2>
                <StageBadge stage={opp.stage} />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {isOwner && (
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    onClick={() => setShareOpen(true)}
                  >
                    <Share2 size={13} /> Share
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '6px',
                    border: '0.5px solid var(--color-border)', background: 'var(--color-surface)',
                    cursor: 'pointer', color: 'var(--color-text-2)',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

              {/* Details */}
              <section style={{ marginBottom: '24px' }}>
                <p style={{ ...SEC, marginBottom: '12px' }}>Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Detail label="Value">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 500 }}>{formatINR(opp.value)}</span>
                  </Detail>
                  <Detail label="Close Date">{formatDate(opp.closeDate)}</Detail>
                  <Detail label="Priority">{opp.priority.charAt(0) + opp.priority.slice(1).toLowerCase()}</Detail>
                  {opp.territory && <Detail label="Territory">{opp.territory.name}</Detail>}
                </div>
                {opp.description && (
                  <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-2)', lineHeight: 1.6 }}>{opp.description}</p>
                )}
              </section>

              {/* Company + Contacts */}
              <section style={{ marginBottom: '24px' }}>
                <p style={{ ...SEC, marginBottom: '12px' }}>Company</p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-1)', margin: '0 0 4px' }}>{opp.company.name}</p>
                {opp.company.industry && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-3)', margin: 0 }}>{opp.company.industry}</p>
                )}
                {opp.primaryContact && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'var(--color-surface)', borderRadius: '6px', border: '0.5px solid var(--color-border)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'var(--color-text-3)', fontWeight: 500 }}>Primary</p>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 500 }}>{opp.primaryContact.name}</p>
                    {opp.primaryContact.designation && (
                      <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'var(--color-text-3)' }}>{opp.primaryContact.designation}</p>
                    )}
                    {opp.primaryContact.email && (
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-2)' }}>{opp.primaryContact.email}</p>
                    )}
                  </div>
                )}
                {opp.additionalContacts && opp.additionalContacts.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {opp.additionalContacts.map(ac => (
                      <div key={ac.contactId} style={{ padding: '8px 10px', background: 'var(--color-surface)', borderRadius: '6px', border: '0.5px solid var(--color-border)' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 500 }}>{ac.contact.name}</p>
                        {ac.contact.designation && (
                          <p style={{ margin: '0', fontSize: '12px', color: 'var(--color-text-3)' }}>{ac.contact.designation}</p>
                        )}
                        {ac.contact.email && (
                          <p style={{ margin: '0', fontSize: '12px', color: 'var(--color-text-2)' }}>{ac.contact.email}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Line Items */}
              <section style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={SEC}>Line Items</p>
                  {isOwner && !liAddOpen && (
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={() => { setLiExpanded(null); setLiAddOpen(true) }}
                    >
                      + Add
                    </button>
                  )}
                </div>

                {lineItems.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: liAddOpen ? '8px' : 0 }}>
                    {lineItems.map(li => {
                      const buHead = li.bu.members?.[0]
                      const isExpanded = liExpanded === li.id
                      const initialData: LineItemInitialData = {
                        buId: li.buId,
                        buName: li.bu.name,
                        buType: li.bu.buType ?? null,
                        quantity: li.quantity as string | number | null,
                        unitPrice: li.unitPrice as string | number | null,
                        details: li.details,
                      }
                      return (
                        <div key={li.id}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 10px',
                            background: isExpanded ? 'var(--color-surface-2)' : 'var(--color-surface)',
                            borderRadius: isExpanded ? '6px 6px 0 0' : '6px',
                            border: '0.5px solid var(--color-border)',
                            borderBottom: isExpanded ? 'none' : '0.5px solid var(--color-border)',
                          }}>
                            {isOwner && (
                              <button
                                onClick={() => setLiExpanded(prev => prev === li.id ? null : li.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-text-3)', display: 'flex', flexShrink: 0 }}
                                title={isExpanded ? 'Collapse' : 'Edit details'}
                              >
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-1)' }}>{li.bu.name}</span>
                                {li.buOwner ? (
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>→ {li.buOwner.name}</span>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-3)', opacity: 0.6 }}>Unassigned</span>
                                )}
                              </div>
                              {buHead && (
                                <div style={{ fontSize: '11px', color: 'var(--color-text-3)', marginTop: '2px' }}>
                                  BU Head: {buHead.name}
                                </div>
                              )}
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500, color: 'var(--color-text-1)', flexShrink: 0 }}>
                              {formatINR(li.totalValue)}
                            </span>
                            {isOwner && (
                              <button
                                onClick={() => handleDeleteLineItem(li.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '4px', display: 'flex', flexShrink: 0 }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
                                title="Remove"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          {isOwner && isExpanded && (
                            <div style={{
                              border: '0.5px solid var(--color-border)', borderTop: 'none',
                              borderRadius: '0 0 6px 6px', padding: '12px',
                              background: 'var(--color-bg)',
                            }}>
                              <LineItemForm
                                opportunityId={opp.id}
                                lineItemId={li.id}
                                initialData={initialData}
                                onSaved={() => { setLiExpanded(null); reloadOpp() }}
                                onCancel={() => setLiExpanded(null)}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {lineItems.length === 0 && !liAddOpen && (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-3)', textAlign: 'center', padding: '12px 0' }}>
                    No line items yet.
                  </p>
                )}

                {isOwner && liAddOpen && (
                  <LineItemForm
                    opportunityId={opp.id}
                    onSaved={() => { setLiAddOpen(false); reloadOpp() }}
                    onCancel={() => setLiAddOpen(false)}
                  />
                )}
              </section>

              {/* Services */}
              <section style={{ marginBottom: '24px' }}>
                <p style={{ ...SEC, marginBottom: '12px' }}>Services</p>

                {serviceAddons.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                    {serviceAddons.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'var(--color-surface)', borderRadius: '6px', border: '0.5px solid var(--color-border)' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '12px', fontWeight: 500 }}>
                            {s.type === 'MANAGED' ? 'Managed Services (ARR)' : 'Implementation'}
                          </span>
                          {s.description && (
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-3)' }}>{s.description}</p>
                          )}
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
                          {formatINR(s.value)}
                        </span>
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '4px', display: 'flex', flexShrink: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isOwner && !svcAddOpen && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {!serviceAddons.some(s => s.type === 'MANAGED') && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        onClick={() => { setSvcType('MANAGED'); setSvcAddOpen(true) }}
                      >
                        + Managed Services
                      </button>
                    )}
                    {!serviceAddons.some(s => s.type === 'IMPLEMENTATION') && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        onClick={() => { setSvcType('IMPLEMENTATION'); setSvcAddOpen(true) }}
                      >
                        + Implementation
                      </button>
                    )}
                  </div>
                )}

                {isOwner && svcAddOpen && (
                  <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '12px', background: 'var(--color-surface)' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-1)' }}>
                      {svcType === 'MANAGED' ? 'Managed Services (ARR)' : 'Implementation'}
                    </p>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={LBL}>Description</label>
                      <textarea value={svcDescription} onChange={e => setSvcDescription(e.target.value)} rows={2} style={{ resize: 'vertical' }} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={LBL}>Value ₹{svcType === 'MANAGED' ? ' (ARR)' : ''}</label>
                      <input type="number" min="0" value={svcValue} onChange={e => setSvcValue(e.target.value)} placeholder="0" />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn-secondary" onClick={() => { setSvcAddOpen(false); setSvcDescription(''); setSvcValue('') }}>Cancel</button>
                      <button className="btn-primary" onClick={handleAddService} disabled={svcSaving}>
                        {svcSaving ? 'Adding…' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Ownership */}
              <section style={{ marginBottom: '24px' }}>
                <p style={{ ...SEC, marginBottom: '12px' }}>Created By</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar name={opp.createdBy.name} size="sm" />
                  <span style={{ fontSize: '13px' }}>{opp.createdBy.name}</span>
                </div>
              </section>

              {/* Stage update — owner only */}
              {isOwner && (
                <section style={{ marginBottom: '24px' }}>
                  <p style={{ ...SEC, marginBottom: '8px' }}>Update Stage</p>
                  <select
                    value={opp.stage}
                    onChange={e => handleStageChange(e.target.value as OpportunityStage)}
                    style={{ maxWidth: '200px' }}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                  </select>
                </section>
              )}

              {/* Notes */}
              <section>
                <p style={{ ...SEC, marginBottom: '12px' }}>Notes</p>
                <NotesList notes={opp.notes ?? []} />
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={3}
                    placeholder="Add a note…"
                    style={{ flex: 1, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-primary"
                      onClick={handleAddNote}
                      disabled={savingNote || !noteText.trim()}
                      style={{ padding: '8px 12px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      {opp && (
        <PocModal
          opportunityId={opp.id}
          open={shareOpen}
          onOpenChange={setShareOpen}
          currentPocs={currentPocs}
          canRemovePoc={isOwner}
          onShared={() => {
            fetch(`/api/opportunities/${opp.id}`)
              .then(r => r.ok ? r.json() : null)
              .then(d => { if (d) setOpp(d) })
          }}
        />
      )}
    </>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'var(--color-text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </p>
      <div style={{ fontSize: '14px', color: 'var(--color-text-1)' }}>{children}</div>
    </div>
  )
}
