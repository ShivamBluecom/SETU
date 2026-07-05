'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'

const LOSS_REASONS = [
  'Price',
  'Competition',
  'Budget Freeze',
  'No Decision',
  'Technical Fit',
  'Relationship',
]

interface WonForm {
  closeRemarks: string
  finalDealValue: string
  poNumber: string
  expectedDeliveryDate: string
  keyDecisionMaker: string
  subscriptionStartDate: string
  subscriptionEndDate: string
}

interface LostForm {
  lossReason: string
  lostTo: string
  lossRemarks: string
  couldBeRevived: string
}

const BLANK_WON: WonForm = {
  closeRemarks: '',
  finalDealValue: '',
  poNumber: '',
  expectedDeliveryDate: '',
  keyDecisionMaker: '',
  subscriptionStartDate: '',
  subscriptionEndDate: '',
}

const BLANK_LOST: LostForm = {
  lossReason: '',
  lostTo: '',
  lossRemarks: '',
  couldBeRevived: '',
}

interface WonLostModalProps {
  open: boolean
  stage: 'WON' | 'LOST'
  opportunityId: string
  onSuccess: () => void
  onCancel: () => void
}

export function WonLostModal({ open, stage, opportunityId, onSuccess, onCancel }: WonLostModalProps) {
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [wonForm, setWonForm] = useState<WonForm>(BLANK_WON)
  const [lostForm, setLostForm] = useState<LostForm>(BLANK_LOST)

  const setWon = (k: keyof WonForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setWonForm(f => ({ ...f, [k]: e.target.value }))

  const setLost = (k: keyof LostForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setLostForm(f => ({ ...f, [k]: e.target.value }))

  const isWonValid =
    wonForm.closeRemarks.trim() !== '' &&
    wonForm.finalDealValue !== '' &&
    parseFloat(wonForm.finalDealValue) >= 0 &&
    wonForm.poNumber.trim() !== '' &&
    wonForm.expectedDeliveryDate !== '' &&
    wonForm.keyDecisionMaker.trim() !== ''

  const isLostValid =
    lostForm.lossReason !== '' &&
    lostForm.lostTo.trim() !== '' &&
    lostForm.lossRemarks.trim() !== '' &&
    lostForm.couldBeRevived !== ''

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = { stage }
      if (stage === 'WON') {
        body.closingComment = wonForm.closeRemarks.trim()
        body.finalDealValue = parseFloat(wonForm.finalDealValue)
        body.poNumber = wonForm.poNumber.trim()
        body.expectedDeliveryDate = wonForm.expectedDeliveryDate
        body.keyDecisionMaker = wonForm.keyDecisionMaker.trim()
        if (wonForm.subscriptionStartDate) body.subscriptionStartDate = wonForm.subscriptionStartDate
        if (wonForm.subscriptionEndDate) body.subscriptionEndDate = wonForm.subscriptionEndDate
      } else {
        body.lossReason = lostForm.lossReason
        body.lostTo = lostForm.lostTo.trim()
        body.closingComment = lostForm.lossRemarks.trim()
        body.couldBeRevived = lostForm.couldBeRevived === 'yes'
      }

      const res = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        showToast(stage === 'WON' ? 'Opportunity marked as Won' : 'Opportunity marked as Lost', 'success')
        setWonForm(BLANK_WON)
        setLostForm(BLANK_LOST)
        onSuccess()
      } else {
        const err = await res.json().catch(() => null)
        showToast(err?.error ?? 'Failed to update', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setWonForm(BLANK_WON)
    setLostForm(BLANK_LOST)
    onCancel()
  }

  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 500,
    color: 'var(--color-text-3)', marginBottom: '4px',
  }
  const field: React.CSSProperties = { marginBottom: '12px' }

  return (
    <Modal
      open={open}
      onOpenChange={o => { if (!o) handleCancel() }}
      title={stage === 'WON' ? 'Close as Won' : 'Close as Lost'}
      maxWidth="540px"
    >
      {stage === 'WON' ? (
        <div>
          <div style={field}>
            <label style={lbl}>Close Remarks *</label>
            <textarea
              value={wonForm.closeRemarks}
              onChange={setWon('closeRemarks')}
              rows={3}
              style={{ resize: 'vertical' }}
              placeholder="Summarise the outcome…"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={field}>
              <label style={lbl}>Final Deal Value (₹) *</label>
              <input
                type="number"
                min="0"
                value={wonForm.finalDealValue}
                onChange={setWon('finalDealValue')}
                placeholder="0"
              />
            </div>
            <div style={field}>
              <label style={lbl}>PO Number / Reference *</label>
              <input
                value={wonForm.poNumber}
                onChange={setWon('poNumber')}
                placeholder="PO-12345"
              />
            </div>
            <div style={field}>
              <label style={lbl}>Expected Delivery / Go-live Date *</label>
              <input
                type="date"
                value={wonForm.expectedDeliveryDate}
                onChange={setWon('expectedDeliveryDate')}
              />
            </div>
            <div style={field}>
              <label style={lbl}>Key Decision Maker *</label>
              <input
                value={wonForm.keyDecisionMaker}
                onChange={setWon('keyDecisionMaker')}
                placeholder="Name / Title"
              />
            </div>
            <div style={field}>
              <label style={lbl}>Subscription Start Date</label>
              <input
                type="date"
                value={wonForm.subscriptionStartDate}
                onChange={setWon('subscriptionStartDate')}
              />
            </div>
            <div style={field}>
              <label style={lbl}>Subscription End Date</label>
              <input
                type="date"
                value={wonForm.subscriptionEndDate}
                onChange={setWon('subscriptionEndDate')}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={field}>
            <label style={lbl}>Loss Reason *</label>
            <select value={lostForm.lossReason} onChange={setLost('lossReason')}>
              <option value="">Select reason…</option>
              {LOSS_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={field}>
            <label style={lbl}>Lost To (Competitor) *</label>
            <input
              value={lostForm.lostTo}
              onChange={setLost('lostTo')}
              placeholder="Competitor name"
            />
          </div>
          <div style={field}>
            <label style={lbl}>Loss Remarks *</label>
            <textarea
              value={lostForm.lossRemarks}
              onChange={setLost('lossRemarks')}
              rows={3}
              style={{ resize: 'vertical' }}
              placeholder="What went wrong?"
            />
          </div>
          <div style={field}>
            <label style={lbl}>Could be revived in future? *</label>
            <select value={lostForm.couldBeRevived} onChange={setLost('couldBeRevived')}>
              <option value="">Select…</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button className="btn-secondary" onClick={handleCancel} disabled={saving}>
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving || (stage === 'WON' ? !isWonValid : !isLostValid)}
        >
          {saving ? 'Saving…' : stage === 'WON' ? 'Mark as Won' : 'Mark as Lost'}
        </button>
      </div>
    </Modal>
  )
}
