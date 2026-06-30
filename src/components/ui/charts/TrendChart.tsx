interface TrendChartPoint {
  label: string
  value: number
}

interface TrendChartProps {
  points: TrendChartPoint[]
  color?: string
  height?: number
}

const WIDTH = 280
const DEFAULT_HEIGHT = 80
const PADDING = 6

export function TrendChart({ points, color = 'var(--color-accent)', height: heightProp }: TrendChartProps) {
  const HEIGHT = heightProp ?? DEFAULT_HEIGHT
  const max = Math.max(1, ...points.map(p => p.value))
  const stepX = points.length > 1 ? (WIDTH - PADDING * 2) / (points.length - 1) : 0

  const coords = points.map((p, i) => ({
    x: PADDING + i * stepX,
    y: PADDING + (1 - p.value / max) * (HEIGHT - PADDING * 2),
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x ?? PADDING} ${HEIGHT - PADDING} L ${PADDING} ${HEIGHT - PADDING} Z`

  return (
    <div>
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <path d={areaPath} fill={color} opacity={0.08} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={points[i].label} cx={c.x} cy={c.y} r={2.5} fill={color} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {points.map(p => (
          <span key={p.label} style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}
