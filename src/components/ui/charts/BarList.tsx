interface BarListRow {
  label: string
  value: number
}

interface BarListProps {
  rows: BarListRow[]
  formatValue: (value: number) => string
  color?: string
  emptyLabel?: string
}

export function BarList({ rows, formatValue, color = 'var(--color-accent)', emptyLabel = 'No data' }: BarListProps) {
  const max = Math.max(1, ...rows.map(r => r.value))

  if (rows.length === 0) {
    return <p style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>{emptyLabel}</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {rows.map(row => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--color-text-2)',
              width: '110px',
              flexShrink: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.label}
          </span>
          <div style={{ flex: 1, background: 'var(--color-surface-2)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.max(2, (row.value / max) * 100)}%`,
                height: '100%',
                background: color,
                borderRadius: '4px',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-text-1)',
              width: '72px',
              flexShrink: 0,
              textAlign: 'right',
            }}
          >
            {formatValue(row.value)}
          </span>
        </div>
      ))}
    </div>
  )
}
