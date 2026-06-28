'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  style,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value)
  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    if (!open) { setQuery(''); return }
    inputRef.current?.focus()
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const handleSelect = (optVal: string) => {
    onChange(optVal)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' && filtered.length > 0) handleSelect(filtered[0].value)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(o => !o) }}
        disabled={disabled}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 10px',
          border: '0.5px solid var(--color-border)',
          borderRadius: '6px',
          background: disabled ? 'var(--color-surface-2)' : 'var(--color-bg)',
          color: selected ? 'var(--color-text-1)' : 'var(--color-text-3)',
          fontSize: '13px',
          cursor: disabled ? 'default' : 'pointer',
          textAlign: 'left',
          minHeight: '34px',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={13} style={{ flexShrink: 0, marginLeft: '6px', opacity: 0.5 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--color-bg)',
            border: '0.5px solid var(--color-border)',
            borderRadius: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '6px 6px 4px' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to filter…"
              style={{ width: '100%', boxSizing: 'border-box', fontSize: '12px' }}
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '8px 10px', fontSize: '13px', color: 'var(--color-text-3)' }}>
                No options
              </div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    fontSize: '13px',
                    background: opt.value === value ? 'var(--color-accent-bg)' : 'transparent',
                    color: opt.value === value ? 'var(--color-accent-text)' : 'var(--color-text-1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'block',
                  }}
                  onMouseEnter={e => {
                    if (opt.value !== value) e.currentTarget.style.background = 'var(--color-surface)'
                  }}
                  onMouseLeave={e => {
                    if (opt.value !== value) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
