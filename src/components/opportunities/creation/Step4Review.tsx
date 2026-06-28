'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { StageBadge } from '@/components/ui/StageBadge'
import { formatINR, formatDate } from '@/lib/format'
import { BU_FIELD_CONFIG, commitmentTermToMonths } from '@/lib/bu-field-config'

const RESERVED_DETAIL_KEYS = new Set(['buType', 'commitmentTerm', 'monthlyCommitValue', 'licenceCount', 'pricePerLicence'])

interface Opp {
  id: string
  title: string
  stage: string
  priority: string
  value: number | string
  closeDate: string | null
  description: string | null
  company: { name: string }
  primaryContact: { name: string; designation?: string | null } | null
  territory: { name: string } | null
  createdBy: { name: string }
  additionalContacts?: Array<{ contactId: string; contact: { id: string; name: string; designation: string | null; email: string | null } }>
  lineItems: Array<{
    id: string
    bu: { name: string; buType?: string | null; members?: Array<{ id: string; name: string }> }
    buOwner: { name: string } | null
    totalValue: number | string
    quantity: number | string | null
    unitPrice: number | string | null
    details: string | null
  }>
  serviceAddons: Array<{
    id: string
    type: string
    description: string | null
    value: number | string
  }>
}

interface Step4ReviewProps {
  opportunityId: string
  onBack: () => void
  onCreated: () => void
}

const ROW_STYLE: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  padding: '8px 0', borderBottom: '0.5px solid var(--color-border)',
}
const KEY_STYLE: React.CSSProperties = {
  fontSize: '12px', color: 'var(--color-text-3)', fontWeight: 500, minWidth: '140px',
}
const VAL_STYLE: React.CSSProperties = {
  fontSize: '13px', color: 'var(--color-text-1)', textAlign: 'right', flex: 1,
}
const SECTION_LABEL: React.CSSProperties = {
  fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'var(--color-text-3)', margin: '0 0 12px',
}

export function Step4Review({ opportunityId, onBack, onCreated }: Step4ReviewProps) {
  const { showToast } = useToast()
  const [opp, setOpp] = useState<Opp | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/opportunities/${opportunityId}`)
      .then(r => r.json())
      .then(d => setOpp(d))
      .finally(() => setLoading(false))
  }, [opportunityId])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CREATED' }),
      })
      if (res.ok) {
        showToast('Opportunity created!', 'success')
        onCreated()
      } else {
        const err = await res.json()
        showToast(err.error ?? 'Failed to create', 'error')
      }
    } finally {
      setCreating(false)
    }
  }

  if (loading || !opp) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
        <p style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>Loading…</p>
      </div>
    )
  }

  const lineItemsTotal = opp.lineItems.reduce((sum, li) => sum + Number(li.totalValue), 0)
  const servicesTotal = opp.serviceAddons.reduce((sum, s) => sum + Number(s.value), 0)
  const grandTotal = lineItemsTotal + servicesTotal

  return (
    <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
      <p style={{ ...SECTION_LABEL, marginBottom: '16px' }}>Review &amp; Create</p>

      {/* Opportunity Details */}
      <div style={{ marginBottom: '24px' }}>
        <p style={SECTION_LABEL}>Details</p>
        <div style={ROW_STYLE}>
          <span style={KEY_STYLE}>Title</span>
          <span style={{ ...VAL_STYLE, fontWeight: 600 }}>{opp.title}</span>
        </div>
        <div style={ROW_STYLE}>
          <span style={KEY_STYLE}>Company</span>
          <span style={VAL_STYLE}>{opp.company.name}</span>
        </div>
        {opp.primaryContact && (
          <div style={ROW_STYLE}>
            <span style={KEY_STYLE}>Primary Contact</span>
            <span style={VAL_STYLE}>{opp.primaryContact.name}{opp.primaryContact.designation ? ` · ${opp.primaryContact.designation}` : ''}</span>
          </div>
        )}
        {opp.additionalContacts && opp.additionalContacts.length > 0 && (
          <div style={ROW_STYLE}>
            <span style={KEY_STYLE}>Additional Contacts</span>
            <div style={{ textAlign: 'right' }}>
              {opp.additionalContacts.map(ac => (
                <div key={ac.contactId} style={{ fontSize: '13px', color: 'var(--color-text-1)' }}>
                  {ac.contact.name}{ac.contact.designation ? ` · ${ac.contact.designation}` : ''}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={ROW_STYLE}>
          <span style={KEY_STYLE}>Stage</span>
          <span style={VAL_STYLE}><StageBadge stage={opp.stage} /></span>
        </div>
        <div style={ROW_STYLE}>
          <span style={KEY_STYLE}>Priority</span>
          <span style={VAL_STYLE}>{opp.priority.charAt(0) + opp.priority.slice(1).toLowerCase()}</span>
        </div>
        <div style={ROW_STYLE}>
          <span style={KEY_STYLE}>Close Date</span>
          <span style={VAL_STYLE}>{formatDate(opp.closeDate)}</span>
        </div>
        {opp.territory && (
          <div style={ROW_STYLE}>
            <span style={KEY_STYLE}>Territory</span>
            <span style={VAL_STYLE}>{opp.territory.name}</span>
          </div>
        )}
        {opp.description && (
          <div style={{ padding: '8px 0' }}>
            <p style={{ ...KEY_STYLE, marginBottom: '4px' }}>Description</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-2)', lineHeight: 1.6 }}>{opp.description}</p>
          </div>
        )}
      </div>

      {/* Line Items */}
      {opp.lineItems.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={SECTION_LABEL}>Line Items</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {opp.lineItems.map(li => {
              const details = li.details ? (() => { try { return JSON.parse(li.details!) as Record<string, unknown> } catch { return {} } })() : {}
              const buType = li.bu.buType ?? (typeof details.buType === 'string' ? details.buType : null)
              const config = buType ? BU_FIELD_CONFIG[buType] : null
              const buHead = li.bu.members?.[0]

              return (
                <div key={li.id} style={{ border: '0.5px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '10px 12px', background: 'var(--color-surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>{li.bu.name}</span>
                      {li.buOwner && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-3)', marginLeft: '8px' }}>→ {li.buOwner.name}</span>
                      )}
                      {buHead && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-3)', marginLeft: '8px' }}>BU Head: {buHead.name}</span>
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>{formatINR(li.totalValue)}</span>
                  </div>

                  {/* Pricing breakdown */}
                  {config && (
                    <div style={{ padding: '8px 12px', borderBottom: '0.5px solid var(--color-border)', background: 'var(--color-bg)' }}>
                      {config.totalValueFormula === 'QTY_X_UNIT' && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>
                          {Number(li.quantity ?? 0).toLocaleString('en-IN')} units × {formatINR(li.unitPrice ?? 0)} = {formatINR(li.totalValue)}
                        </span>
                      )}
                      {config.totalValueFormula === 'LICENCE_X_PRICE' && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>
                          {Number(details.licenceCount ?? 0).toLocaleString('en-IN')} licences × {formatINR(details.pricePerLicence as number)} = {formatINR(li.totalValue)}
                        </span>
                      )}
                      {config.totalValueFormula === 'MONTHLY_X_TERM' && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>
                          {formatINR(details.monthlyCommitValue as number)}/month × {String(details.commitmentTerm ?? 'Monthly')} ({commitmentTermToMonths(String(details.commitmentTerm ?? 'Monthly'))} months) = {formatINR(li.totalValue)} TCV
                        </span>
                      )}
                    </div>
                  )}

                  {/* BU-specific fields */}
                  {config && config.fields.length > 0 && (
                    <div style={{ padding: '8px 12px' }}>
                      {config.fields
                        .filter(f => !RESERVED_DETAIL_KEYS.has(f.key) && details[f.key])
                        .map(f => (
                          <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '12px' }}>
                            <span style={{ color: 'var(--color-text-3)' }}>{f.label}</span>
                            <span style={{ color: 'var(--color-text-1)', textAlign: 'right', maxWidth: '60%' }}>{String(details[f.key])}</span>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0 0' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-3)', marginRight: '8px' }}>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>{formatINR(lineItemsTotal)}</span>
          </div>
        </div>
      )}

      {/* Services */}
      {opp.serviceAddons.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={SECTION_LABEL}>Services</p>
          {opp.serviceAddons.map(s => (
            <div key={s.id} style={ROW_STYLE}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-1)' }}>
                  {s.type === 'MANAGED' ? 'Managed Services (ARR)' : 'Implementation'}
                </span>
                {s.description && (
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-3)' }}>{s.description}</p>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>{formatINR(s.value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grand Total */}
      <div style={{ background: 'var(--color-surface-2)', borderRadius: '6px', padding: '14px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>Grand Total</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)' }}>
          {formatINR(grandTotal)}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '0.5px solid var(--color-border)' }}>
        <button type="button" className="btn-secondary" onClick={onBack}>← Back</button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleCreate}
          disabled={creating}
          style={{ padding: '8px 20px' }}
        >
          {creating ? 'Creating…' : 'Create Opportunity'}
        </button>
      </div>
    </div>
  )
}
