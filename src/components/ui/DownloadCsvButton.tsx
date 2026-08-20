'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Modal } from './Modal'
import { downloadCsv } from '@/lib/csv'

export interface CsvExportOption {
  label: string
  filename: string
  headers: string[]
  rows: (string | number)[][]
}

const buttonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '5px',
  fontSize: '13px', color: 'var(--color-text-3)',
  background: 'none', border: '0.5px solid var(--color-border)',
  borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
  padding: '6px 10px', height: '34px', flexShrink: 0,
}

export function DownloadCsvButton({ options }: { options: CsvExportOption[] }) {
  const [open, setOpen] = useState(false)

  const run = (opt: CsvExportOption) => {
    downloadCsv(opt.filename, opt.headers, opt.rows)
    setOpen(false)
  }

  if (options.length === 1) {
    return (
      <button type="button" style={buttonStyle} onClick={() => run(options[0])}>
        <Download size={13} /> Download
      </button>
    )
  }

  return (
    <>
      <button type="button" style={buttonStyle} onClick={() => setOpen(true)}>
        <Download size={13} /> Download
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Download CSV" maxWidth="360px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map(opt => (
            <button
              key={opt.label}
              type="button"
              className="btn-secondary"
              onClick={() => run(opt)}
              style={{ justifyContent: 'flex-start' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
