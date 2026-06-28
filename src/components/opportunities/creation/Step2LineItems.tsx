'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { formatINR } from '@/lib/format'
import { LineItemForm, type LineItemInitialData } from './LineItemForm'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface LineItem {
  id: string
  buId: string
  bu: { id: string; name: string; buType?: string | null }
  buOwner: { name: string } | null
  totalValue: string | number
  quantity: string | number | null
  unitPrice: string | number | null
  details: string | null
  assignmentStatus: string
}

interface Step2LineItemsProps {
  opportunityId: string
  onNext: () => void
  onBack: () => void
}

export function Step2LineItems({ opportunityId, onNext, onBack }: Step2LineItemsProps) {
  const { showToast } = useToast()
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}`)
      const data = await res.json()
      setLineItems(data.lineItems ?? [])
    } finally {
      setLoading(false)
    }
  }, [opportunityId])

  useEffect(() => { load() }, [load])

  const handleDelete = async (liId: string) => {
    const res = await fetch(`/api/opportunities/${opportunityId}/line-items/${liId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Line item removed', 'success')
      if (expandedId === liId) setExpandedId(null)
      load()
    } else {
      showToast('Failed to remove line item', 'error')
    }
  }

  const toggleExpand = (id: string) => {
    setShowAddForm(false)
    setExpandedId(prev => prev === id ? null : id)
  }

  const total = lineItems.reduce((sum, li) => sum + Number(li.totalValue), 0)

  return (
    <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>Line Items</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-3)' }}>Add one or more BU-specific line items for this opportunity.</p>
        </div>
        {!showAddForm && (
          <button
            className="btn-secondary"
            onClick={() => { setExpandedId(null); setShowAddForm(true) }}
            style={{ fontSize: '13px' }}
          >
            + Add Line Item
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>Loading…</p>
      ) : (
        <>
          {lineItems.length > 0 && (
            <div style={{ marginBottom: '16px', border: '0.5px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
              {lineItems.map((li, i) => {
                const isExpanded = expandedId === li.id
                const initialData: LineItemInitialData = {
                  buId: li.buId,
                  buName: li.bu.name,
                  buType: li.bu.buType ?? null,
                  quantity: li.quantity,
                  unitPrice: li.unitPrice,
                  details: li.details,
                }
                return (
                  <div
                    key={li.id}
                    style={{ borderBottom: i < lineItems.length - 1 ? '0.5px solid var(--color-border)' : 'none' }}
                  >
                    {/* Row header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px 14px',
                      background: isExpanded ? 'var(--color-surface-2)' : 'var(--color-bg)',
                    }}>
                      <button
                        onClick={() => toggleExpand(li.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-text-3)', display: 'flex', flexShrink: 0 }}
                        title={isExpanded ? 'Collapse' : 'Expand to edit'}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-1)' }}>{li.bu.name}</span>
                        {li.buOwner ? (
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--color-text-3)' }}>→ {li.buOwner.name}</span>
                        ) : (
                          <span style={{
                            marginLeft: '8px', fontSize: '10px', padding: '1px 5px', borderRadius: '3px',
                            background: 'var(--color-surface-2)', color: 'var(--color-text-3)',
                            border: '0.5px solid var(--color-border)',
                          }}>Pending assignment</span>
                        )}
                      </div>

                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-1)', flexShrink: 0 }}>
                        {formatINR(li.totalValue)}
                      </span>

                      <button
                        onClick={() => handleDelete(li.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '4px', display: 'flex', flexShrink: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Accordion edit form */}
                    {isExpanded && (
                      <div style={{ padding: '0 14px 14px' }}>
                        <LineItemForm
                          opportunityId={opportunityId}
                          lineItemId={li.id}
                          initialData={initialData}
                          onSaved={() => { setExpandedId(null); load() }}
                          onCancel={() => setExpandedId(null)}
                        />
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Subtotal row */}
              <div style={{ padding: '10px 14px', background: 'var(--color-surface)', display: 'flex', justifyContent: 'flex-end', borderTop: '0.5px solid var(--color-border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-3)', marginRight: '8px' }}>Subtotal</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>
                  {formatINR(total)}
                </span>
              </div>
            </div>
          )}

          {lineItems.length === 0 && !showAddForm && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-3)', padding: '24px 0', textAlign: 'center' }}>
              No line items yet. Add at least one to continue.
            </p>
          )}

          {showAddForm && (
            <div style={{ marginBottom: '16px' }}>
              <LineItemForm
                opportunityId={opportunityId}
                onSaved={() => { setShowAddForm(false); load() }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '0.5px solid var(--color-border)' }}>
        <button type="button" className="btn-secondary" onClick={onBack}>← Back</button>
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
          disabled={lineItems.length === 0}
          title={lineItems.length === 0 ? 'Add at least one line item to continue' : undefined}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
