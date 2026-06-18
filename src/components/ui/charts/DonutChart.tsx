interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
}

const RADIUS = 40
const STROKE = 16
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function DonutChart({ segments, size = 120 }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  let offset = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--color-surface-2)" strokeWidth={STROKE} />
        {total > 0 &&
          segments
            .filter(s => s.value > 0)
            .map(s => {
              const fraction = s.value / total
              const dash = fraction * CIRCUMFERENCE
              const dashoffset = CIRCUMFERENCE - offset
              offset += dash
              return (
                <circle
                  key={s.label}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={dashoffset}
                  transform="rotate(-90 50 50)"
                />
              )
            })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-2)' }}>{s.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-1)' }}>
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
