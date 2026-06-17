'use client'

import { useState, useEffect } from 'react'
import { X, Share2 } from 'lucide-react'
import { StageBadge } from '@/components/ui/StageBadge'
import { Avatar } from '@/components/ui/Avatar'
import { NotesList } from './NotesList'
import { ShareModal } from './ShareModal'
import { useToast } from '@/contexts/ToastContext'
import { formatINR, formatDate } from '@/lib/format'
import type { OpportunityWithRelations } from '@/types/api'
import type { OpportunityStage } from '@/types/enums'

interface OpportunityDrawerProps {
  opportunityId: string | null
  open: boolean
  onClose: () => void
  canEdit?: boolean
  canAssignOwner?: boolean
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

export function OpportunityDrawer({
  opportunityId,
  open,
  onClose,
  canEdit = true,
  canAssignOwner = false,
  onUpdated,
}: OpportunityDrawerProps) {
  const { showToast } = useToast()
  const [opp, setOpp] = useState<OpportunityWithRelations & {
    shares: Array<{ userId: string; user: { id: string; name: string; email: string } }>
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (!open || !opportunityId) return
    setLoading(true)
    fetch(`/api/opportunities/${opportunityId}`)
      .then(r => r.json())
      .then(d => setOpp(d))
      .finally(() => setLoading(false))
  }, [open, opportunityId])

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

  if (!open) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 30,
        }}
        onClick={onClose}
      />
      <div
        className="drawer-enter"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '600px',
          background: 'var(--color-bg)',
          borderLeft: '0.5px solid var(--color-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          zIndex: 31,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {loading && (
          <div style={{ padding: '24px', color: 'var(--color-text-3)', fontSize: '13px' }}>
            Loading…
          </div>
        )}

        {!loading && opp && (
          <>
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '0.5px solid var(--color-border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: 'var(--color-text-1)' }}>
                  {opp.title}
                </h2>
                <StageBadge stage={opp.stage} />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 size={13} /> Share
                </button>
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
              {/* Details grid */}
              <section style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '12px' }}>
                  Details
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Detail label="Value">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 500 }}>
                      {formatINR(opp.value)}
                    </span>
                  </Detail>
                  <Detail label="Close Date">{formatDate(opp.closeDate)}</Detail>
                  <Detail label="Priority">{opp.priority.charAt(0) + opp.priority.slice(1).toLowerCase()}</Detail>
                  {opp.productService && <Detail label="Product / Service">{opp.productService}</Detail>}
                  {opp.bu && <Detail label="Business Unit">{opp.bu.name}</Detail>}
                  {opp.territory && <Detail label="Territory">{opp.territory.name}</Detail>}
                </div>
                {opp.description && (
                  <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                    {opp.description}
                  </p>
                )}
              </section>

              {/* Company + contact */}
              <section style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '12px' }}>
                  Company
                </p>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-1)', margin: '0 0 4px' }}>
                  {opp.company.name}
                </p>
                {opp.company.industry && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-3)', margin: 0 }}>{opp.company.industry}</p>
                )}
                {opp.primaryContact && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'var(--color-surface)', borderRadius: '6px', border: '0.5px solid var(--color-border)' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 500 }}>{opp.primaryContact.name}</p>
                    {opp.primaryContact.designation && (
                      <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'var(--color-text-3)' }}>{opp.primaryContact.designation}</p>
                    )}
                    {opp.primaryContact.email && (
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-2)' }}>{opp.primaryContact.email}</p>
                    )}
                  </div>
                )}
              </section>

              {/* Owner */}
              {(opp.buOwner || opp.createdBy) && (
                <section style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '12px' }}>
                    Ownership
                  </p>
                  {opp.buOwner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Avatar name={opp.buOwner.name} size="sm" />
                      <span style={{ fontSize: '13px' }}>{opp.buOwner.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>Owner</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar name={opp.createdBy.name} size="sm" />
                    <span style={{ fontSize: '13px' }}>{opp.createdBy.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>Created by</span>
                  </div>
                </section>
              )}

              {/* Stage update */}
              {canEdit && (
                <section style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '8px' }}>
                    Update Stage
                  </p>
                  <select
                    value={opp.stage}
                    onChange={(e) => handleStageChange(e.target.value as OpportunityStage)}
                    style={{ maxWidth: '200px' }}
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                    ))}
                  </select>
                </section>
              )}

              {/* Notes */}
              <section>
                <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '12px' }}>
                  Notes
                </p>
                <NotesList notes={opp.notes ?? []} />
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
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
        <ShareModal
          opportunityId={opp.id}
          open={shareOpen}
          onOpenChange={setShareOpen}
          currentShares={opp.shares ?? []}
          onShared={() => {
            fetch(`/api/opportunities/${opp.id}`)
              .then(r => r.json())
              .then(d => setOpp(d))
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
