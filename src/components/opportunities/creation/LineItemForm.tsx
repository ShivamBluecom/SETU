'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { BU_FIELD_CONFIG, commitmentTermToMonths, type FieldDef } from '@/lib/bu-field-config'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

export interface LineItemInitialData {
  buId: string
  buName: string
  buType: string | null
  quantity: string | number | null
  unitPrice: string | number | null
  details: string | null
}

interface LineItemFormProps {
  opportunityId: string
  lineItemId?: string
  initialData?: LineItemInitialData
  onSaved: () => void
  onCancel: () => void
}

interface BUOption { id: string; name: string; buType?: string | null }

const BU_TYPES = ['ISG', 'NETWORKING_AV', 'ISS', 'BC_MICROSOFT', 'CLOUD']
const BU_TYPE_LABELS: Record<string, string> = {
  ISG: 'ISG', NETWORKING_AV: 'Networking & AV', ISS: 'ISS',
  BC_MICROSOFT: 'BC Microsoft', CLOUD: 'Cloud',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 500,
  color: 'var(--color-text-3)', marginBottom: '4px',
}

const RESERVED_DETAIL_KEYS = new Set(['buType', 'commitmentTerm', 'monthlyCommitValue', 'licenceCount', 'pricePerLicence'])

function FieldInput({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  if (field.type === 'select' || field.type === 'multiselect') {
    const opts = (field.options ?? []).map(o => ({ value: o, label: o }))
    const allOpts = field.required ? opts : [{ value: '', label: '— None —' }, ...opts]
    return (
      <SearchableSelect
        value={value}
        onChange={onChange}
        options={allOpts}
        placeholder="Select…"
      />
    )
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        placeholder={field.placeholder ?? ''}
        style={{ resize: 'vertical' }}
      />
    )
  }
  return (
    <input
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder ?? ''}
      min={field.type === 'number' ? '0' : undefined}
    />
  )
}

export function LineItemForm({ opportunityId, lineItemId, initialData, onSaved, onCancel }: LineItemFormProps) {
  const { showToast } = useToast()
  const isEdit = !!lineItemId

  const [allBUs, setAllBUs] = useState<BUOption[]>([])
  const [selectedBUId, setSelectedBUId] = useState(initialData?.buId ?? '')
  const [manualBUType, setManualBUType] = useState('')
  const [oemOptions, setOemOptions] = useState<Record<string, string[]>>({})
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [licenceCount, setLicenceCount] = useState('')
  const [pricePerLicence, setPricePerLicence] = useState('')
  const [monthlyCommit, setMonthlyCommit] = useState('')
  const [commitTerm, setCommitTerm] = useState('Monthly')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/business-units').then(r => r.json()).then((data: BUOption[]) => setAllBUs(data))
  }, [])

  // Pre-fill from initialData (edit mode)
  useEffect(() => {
    if (!initialData) return
    setSelectedBUId(initialData.buId)

    const details = initialData.details ? JSON.parse(initialData.details) as Record<string, unknown> : {}

    // Set BU type for the manual selector (fallback while allBUs loads, or when bu has no buType)
    const detailBUType = typeof details.buType === 'string' ? details.buType : ''
    setManualBUType(initialData.buType ?? detailBUType)

    if (initialData.quantity != null) setQuantity(String(initialData.quantity))
    if (initialData.unitPrice != null) setUnitPrice(String(initialData.unitPrice))

    const lc = details.licenceCount
    const pp = details.pricePerLicence
    const mc = details.monthlyCommitValue
    const ct = details.commitmentTerm

    if (lc != null) setLicenceCount(String(lc))
    if (pp != null) setPricePerLicence(String(pp))
    if (mc != null) setMonthlyCommit(String(mc))
    if (typeof ct === 'string') setCommitTerm(ct)

    const buFieldVals: Record<string, string> = {}
    for (const [k, v] of Object.entries(details)) {
      if (!RESERVED_DETAIL_KEYS.has(k)) buFieldVals[k] = String(v ?? '')
    }
    setFieldValues(buFieldVals)
  }, [initialData])

  const selectedBU = allBUs.find(b => b.id === selectedBUId)
  const activeBUType = selectedBU?.buType ?? manualBUType

  // Fetch OEM options when BU type is known — separate from field reset
  useEffect(() => {
    if (!activeBUType) return
    if (oemOptions[activeBUType]) return // already fetched
    fetch(`/api/oem-configs?buType=${activeBUType}`)
      .then(r => r.json())
      .then((data: Array<{ name: string }>) => {
        setOemOptions(prev => ({ ...prev, [activeBUType]: data.map(o => o.name) }))
      })
  }, [activeBUType, oemOptions])

  const config = activeBUType ? BU_FIELD_CONFIG[activeBUType] : null

  // When user explicitly changes BU, reset everything
  const handleBUChange = (buId: string) => {
    setSelectedBUId(buId)
    setManualBUType('')
    setFieldValues({})
    setQuantity(''); setUnitPrice(''); setLicenceCount(''); setPricePerLicence(''); setMonthlyCommit('')
    setCommitTerm('Monthly')
  }

  // When user explicitly changes BU type, reset BU-specific fields
  const handleBUTypeChange = (buType: string) => {
    setManualBUType(buType)
    setFieldValues({})
  }

  const computeTotal = (): number => {
    if (!config) return 0
    switch (config.totalValueFormula) {
      case 'QTY_X_UNIT': return (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0)
      case 'LICENCE_X_PRICE': return (parseFloat(licenceCount) || 0) * (parseFloat(pricePerLicence) || 0)
      case 'MONTHLY_X_TERM': return (parseFloat(monthlyCommit) || 0) * commitmentTermToMonths(commitTerm)
      default: return 0
    }
  }

  const handleSave = async () => {
    if (!selectedBUId) { showToast('Please select a Business Unit', 'error'); return }
    if (!activeBUType) { showToast('Please select a BU Type', 'error'); return }
    if (!config) return

    const details: Record<string, unknown> = { buType: activeBUType, ...fieldValues }
    if (config.totalValueFormula === 'MONTHLY_X_TERM') {
      details.commitmentTerm = commitTerm
      details.monthlyCommitValue = parseFloat(monthlyCommit) || 0
    }
    if (config.totalValueFormula === 'LICENCE_X_PRICE') {
      details.licenceCount = parseFloat(licenceCount) || 0
      details.pricePerLicence = parseFloat(pricePerLicence) || 0
    }

    const body: Record<string, unknown> = {
      buId: selectedBUId,
      details: JSON.stringify(details),
      totalValue: computeTotal(),
    }
    if (config.showQtyUnitPrice) {
      body.quantity = parseFloat(quantity) || null
      body.unitPrice = parseFloat(unitPrice) || null
    }

    setSaving(true)
    try {
      const url = isEdit
        ? `/api/opportunities/${opportunityId}/line-items/${lineItemId}`
        : `/api/opportunities/${opportunityId}/line-items`
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        showToast(isEdit ? 'Line item updated' : 'Line item added', 'success')
        onSaved()
      } else {
        const err = await res.json()
        showToast(err.error ?? 'Failed to save line item', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const buOemOptions = oemOptions[activeBUType] ?? []

  return (
    <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '16px', background: 'var(--color-surface-2)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={LABEL_STYLE}>Business Unit *</label>
          <SearchableSelect
            value={selectedBUId}
            onChange={handleBUChange}
            options={allBUs.map(b => ({ value: b.id, label: b.name }))}
            placeholder="Select BU…"
            disabled={isEdit}
          />
        </div>
        <div>
          <label style={LABEL_STYLE}>BU Type *</label>
          {selectedBU?.buType ? (
            <input value={BU_TYPE_LABELS[selectedBU.buType] ?? selectedBU.buType} readOnly style={{ background: 'var(--color-surface)', color: 'var(--color-text-2)' }} />
          ) : (
            <select value={manualBUType} onChange={e => handleBUTypeChange(e.target.value)} disabled={isEdit && !!manualBUType}>
              <option value="">Select type…</option>
              {BU_TYPES.map(bt => <option key={bt} value={bt}>{BU_TYPE_LABELS[bt]}</option>)}
            </select>
          )}
        </div>
      </div>

      {config && (
        <>
          {config.showQtyUnitPrice && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={LABEL_STYLE}>Quantity</label>
                <input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={LABEL_STYLE}>Unit Price ₹</label>
                <input type="number" min="0" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={LABEL_STYLE}>Total Value ₹</label>
                <input value={computeTotal().toLocaleString('en-IN')} readOnly style={{ background: 'var(--color-surface)', color: 'var(--color-text-2)' }} />
              </div>
            </div>
          )}

          {config.totalValueFormula === 'LICENCE_X_PRICE' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={LABEL_STYLE}>Licence Count</label>
                <input type="number" min="0" value={licenceCount} onChange={e => setLicenceCount(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={LABEL_STYLE}>Per-Licence Price ₹</label>
                <input type="number" min="0" value={pricePerLicence} onChange={e => setPricePerLicence(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={LABEL_STYLE}>Total Value ₹</label>
                <input value={computeTotal().toLocaleString('en-IN')} readOnly style={{ background: 'var(--color-surface)', color: 'var(--color-text-2)' }} />
              </div>
            </div>
          )}

          {config.totalValueFormula === 'MONTHLY_X_TERM' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={LABEL_STYLE}>Monthly Commit ₹</label>
                <input type="number" min="0" value={monthlyCommit} onChange={e => setMonthlyCommit(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={LABEL_STYLE}>Commitment Term</label>
                <select value={commitTerm} onChange={e => setCommitTerm(e.target.value)}>
                  {['Monthly', '1 Year', '2 Year', '3 Year'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>TCV ₹</label>
                <input value={computeTotal().toLocaleString('en-IN')} readOnly style={{ background: 'var(--color-surface)', color: 'var(--color-text-2)' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {config.fields.map(field => {
              const options = field.oemManaged ? buOemOptions : (field.options ?? [])
              const effectiveField: FieldDef = { ...field, options }
              return (
                <div key={field.key} style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : undefined }}>
                  <label style={LABEL_STYLE}>{field.label}{field.required && ' *'}</label>
                  {field.hint && (
                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--color-text-3)' }}>{field.hint}</p>
                  )}
                  <FieldInput
                    field={effectiveField}
                    value={fieldValues[field.key] ?? ''}
                    onChange={v => setFieldValues(prev => ({ ...prev, [field.key]: v }))}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '0.5px solid var(--color-border)' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving || !selectedBUId || !activeBUType}>
          {saving ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save Changes' : 'Add Line Item')}
        </button>
      </div>
    </div>
  )
}
