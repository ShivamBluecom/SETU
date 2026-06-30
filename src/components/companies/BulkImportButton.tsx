'use client'

import { useRef, useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

interface Territory { id: string; name: string }

type ParsedRow = {
  rowNum: number
  name: string
  territory: string
  data: Record<string, string>
  errors: string[]
  territoryId?: string
}

type ImportResult = {
  created: number
  errors: Array<{ index: number; name: string; error: string }>
}

// Column name aliases → canonical key
const COL_MAP: Record<string, string> = {
  name: 'name', 'company name': 'name', company: 'name',
  industry: 'industry',
  territory: 'territory', 'territory name': 'territory',
  address: 'address',
  'user count': 'userCount', usercount: 'userCount', users: 'userCount',
  website: 'website',
  gst: 'gstNumber', 'gst number': 'gstNumber', gstnumber: 'gstNumber',
  linkedin: 'linkedinUrl', 'linkedin url': 'linkedinUrl', linkedinurl: 'linkedinUrl',
}

const REQUIRED = ['name', 'industry', 'territory', 'address', 'userCount', 'website']

const URL_RE = /^https?:\/\/.+\..+/

function normalizeWebsite(val: string): string {
  if (!val) return val
  if (/^https?:\/\//i.test(val)) return val
  return 'https://' + val
}

function parseFile(buffer: ArrayBuffer, fileName: string): string[][] {
  // Dynamic import of xlsx to avoid SSR issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const XLSX = require('xlsx')
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  return rows
}

function buildRows(rawRows: string[][], territories: Territory[]): ParsedRow[] {
  if (rawRows.length < 2) return []

  // Map headers to canonical keys
  const headers = (rawRows[0] as string[]).map(h => (h ?? '').toString().trim().toLowerCase())
  const colIndex: Record<string, number> = {}
  headers.forEach((h, i) => {
    const key = COL_MAP[h]
    if (key && !(key in colIndex)) colIndex[key] = i
  })

  const territoryMap = new Map(territories.map(t => [t.name.toLowerCase(), t]))

  const rows: ParsedRow[] = []
  const seenNames = new Set<string>()

  for (let i = 1; i < rawRows.length; i++) {
    const raw = rawRows[i] as string[]
    // Skip fully empty rows
    if (raw.every(cell => !cell?.toString().trim())) continue

    const get = (key: string): string =>
      colIndex[key] !== undefined ? (raw[colIndex[key]] ?? '').toString().trim() : ''

    const errs: string[] = []

    // Check required columns exist in header
    for (const req of REQUIRED) {
      if (!(req in colIndex)) {
        errs.push(`Missing column: ${req}`)
      }
    }

    const name = get('name')
    const industry = get('industry')
    const territoryName = get('territory')
    const address = get('address')
    const userCountRaw = get('userCount')
    let website = get('website')
    const gstNumber = get('gstNumber')
    const linkedinUrl = get('linkedinUrl')

    // Required field checks
    if (!name) errs.push('Name is required')
    if (!industry) errs.push('Industry is required')
    if (!territoryName) errs.push('Territory is required')
    if (!address) errs.push('Address is required')
    if (!userCountRaw) errs.push('User Count is required')
    if (!website) errs.push('Website is required')

    // User count must be a non-negative integer
    if (userCountRaw && (isNaN(Number(userCountRaw)) || Number(userCountRaw) < 0 || !Number.isInteger(Number(userCountRaw)))) {
      errs.push('User Count must be a non-negative integer')
    }

    // Normalize and validate website
    if (website) {
      website = normalizeWebsite(website)
      if (!URL_RE.test(website)) errs.push('Website must be a valid URL')
    }

    // Resolve territory
    let territoryId: string | undefined
    if (territoryName) {
      const match = territoryMap.get(territoryName.toLowerCase())
      if (match) {
        territoryId = match.id
      } else {
        errs.push(`Territory "${territoryName}" not found`)
      }
    }

    // In-file duplicate check
    const nameKey = name.toLowerCase()
    if (name && seenNames.has(nameKey)) {
      errs.push('Duplicate name in this file')
    } else if (name) {
      seenNames.add(nameKey)
    }

    rows.push({
      rowNum: i + 1,
      name: name || `(row ${i + 1})`,
      territory: territoryName,
      data: { name, industry, territory: territoryName, address, userCount: userCountRaw, website, gstNumber, linkedinUrl },
      errors: errs,
      territoryId,
    })
  }

  return rows
}

const TEMPLATE_CSV =
  'Name,Industry,Territory,Address,User Count,Website,GST Number,LinkedIn URL\n' +
  'Acme Corp,Technology,North India,"123 MG Road, Bangalore",250,https://acme.com,,\n'

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'companies_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ImportModal({
  rows,
  result,
  importing,
  onClose,
  onImport,
}: {
  rows: ParsedRow[]
  result: ImportResult | null
  importing: boolean
  onClose: () => void
  onImport: () => void
}) {
  const validCount = rows.filter(r => r.errors.length === 0).length
  const invalidCount = rows.length - validCount

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card-3d"
        style={{
          width: '100%', maxWidth: '760px',
          maxHeight: '85vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          borderRadius: '16px', padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--color-text-1)' }}>
              Import Companies
            </h2>
            {!result && (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-3)' }}>
                <span style={{ color: 'var(--color-success, #16a34a)', fontWeight: 600 }}>{validCount} valid</span>
                {' · '}
                <span style={{ color: invalidCount > 0 ? 'var(--color-danger)' : 'var(--color-text-3)', fontWeight: invalidCount > 0 ? 600 : 400 }}>
                  {invalidCount} invalid
                </span>
                {' · '}
                {rows.length} rows total
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
              cursor: 'pointer', color: 'var(--color-text-2)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Result view */}
        {result ? (
          <div style={{ flex: 1, overflow: 'auto' }}>
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: result.created > 0 ? 'rgba(22,163,74,0.06)' : 'rgba(239,68,68,0.06)',
              border: `1px solid ${result.created > 0 ? 'rgba(22,163,74,0.2)' : 'rgba(239,68,68,0.2)'}`,
              marginBottom: result.errors.length > 0 ? '16px' : 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={20} color="#16a34a" />
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-1)' }}>
                  {result.created} {result.created === 1 ? 'company' : 'companies'} imported successfully
                </span>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: 'var(--color-danger)' }}>
                  {result.errors.length} failed:
                </p>
                <div style={{ borderRadius: '10px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((e, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--color-text-1)', fontWeight: 500 }}>{e.name}</td>
                          <td style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{e.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Preview table */}
            <div style={{ flex: 1, overflow: 'auto', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '48px' }}>#</th>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Territory</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.rowNum}>
                      <td style={{ color: 'var(--color-text-3)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{row.rowNum}</td>
                      <td style={{ color: 'var(--color-text-1)', fontWeight: 500 }}>{row.name}</td>
                      <td style={{ fontSize: '13px' }}>{row.data.industry || <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                      <td style={{ fontSize: '13px' }}>{row.territory || <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                      <td>
                        {row.errors.length === 0 ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '11px', fontWeight: 600,
                            color: '#16a34a', background: 'rgba(22,163,74,0.08)',
                            padding: '2px 8px', borderRadius: '20px',
                          }}>
                            <CheckCircle size={11} /> Ready
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '11px', fontWeight: 600,
                            color: 'var(--color-danger)', background: 'rgba(239,68,68,0.08)',
                            padding: '2px 8px', borderRadius: '20px',
                            maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                            title={row.errors.join('; ')}
                          >
                            <AlertCircle size={11} /> {row.errors[0]}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexShrink: 0 }}>
          <button
            onClick={downloadTemplate}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', color: 'var(--color-text-3)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', padding: '4px 0',
            }}
          >
            <Download size={12} /> Download template
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={onClose}>
              {result ? 'Close' : 'Cancel'}
            </button>
            {!result && (
              <button
                className="btn-primary"
                onClick={onImport}
                disabled={validCount === 0 || importing}
              >
                {importing ? 'Importing…' : `Import ${validCount} valid row${validCount === 1 ? '' : 's'}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BulkImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { showToast } = useToast()

  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    // Fetch territories first
    let territories: Territory[] = []
    try {
      const res = await fetch('/api/territories')
      territories = await res.json()
    } catch {
      showToast('Failed to load territories', 'error')
      return
    }

    const buffer = await file.arrayBuffer()
    try {
      const raw = parseFile(buffer, file.name)
      const parsed = buildRows(raw, territories)
      if (parsed.length === 0) {
        showToast('No data rows found in file', 'error')
        return
      }
      setResult(null)
      setRows(parsed)
    } catch (err) {
      showToast('Could not parse file. Ensure it is a valid CSV or Excel file.', 'error')
    }
  }

  const handleImport = async () => {
    if (!rows) return
    const validRows = rows.filter(r => r.errors.length === 0)
    if (validRows.length === 0) return

    setImporting(true)
    try {
      const companies = validRows.map(r => ({
        name: r.data.name.trim(),
        industry: r.data.industry,
        territoryId: r.territoryId!,
        address: r.data.address.trim(),
        userCount: parseInt(r.data.userCount),
        website: r.data.website,
        gstNumber: r.data.gstNumber || undefined,
        linkedinUrl: r.data.linkedinUrl || undefined,
      }))

      const res = await fetch('/api/companies/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies }),
      })
      const data: ImportResult = await res.json()
      setResult(data)
      if (data.created > 0) {
        router.refresh()
      }
    } catch {
      showToast('Import failed. Please try again.', 'error')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setRows(null)
    setResult(null)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        className="btn-secondary"
        onClick={() => fileInputRef.current?.click()}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Upload size={14} /> Import CSV / Excel
      </button>

      {rows && (
        <ImportModal
          rows={rows}
          result={result}
          importing={importing}
          onClose={handleClose}
          onImport={handleImport}
        />
      )}
    </>
  )
}
