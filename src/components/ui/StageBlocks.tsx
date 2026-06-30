interface StageBlocksProps {
  counts: Partial<Record<string, number>>
}

const STAGES: { stage: string; label: string }[] = [
  { stage: 'PROSPECTING', label: 'Prospecting' },
  { stage: 'QUALIFIED',   label: 'Qualified'   },
  { stage: 'PROPOSAL',    label: 'Proposal'    },
  { stage: 'NEGOTIATION', label: 'Negotiation' },
  { stage: 'WON',         label: 'Won'         },
  { stage: 'LOST',        label: 'Lost'        },
]

const BLOCK_STYLES: Record<string, {
  gradient: string
  labelColor: string
  numColor: string
  border: string
  glow: string
}> = {
  PROSPECTING: {
    gradient:   'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    labelColor: '#64748b',
    numColor:   '#0f172a',
    border:     '#cbd5e1',
    glow:       'rgba(100,116,139,0)',
  },
  QUALIFIED: {
    gradient:   'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    labelColor: '#1d4ed8',
    numColor:   '#1e40af',
    border:     '#bfdbfe',
    glow:       'rgba(37,99,235,0.08)',
  },
  PROPOSAL: {
    gradient:   'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    labelColor: '#c2410c',
    numColor:   '#9a3412',
    border:     '#fdba74',
    glow:       'rgba(194,65,12,0.08)',
  },
  NEGOTIATION: {
    gradient:   'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)',
    labelColor: '#7e22ce',
    numColor:   '#6b21a8',
    border:     '#d8b4fe',
    glow:       'rgba(126,34,206,0.08)',
  },
  WON: {
    gradient:   'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
    labelColor: '#0f766e',
    numColor:   '#0d9488',
    border:     '#5eead4',
    glow:       'rgba(13,148,136,0.12)',
  },
  LOST: {
    gradient:   'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
    labelColor: '#b91c1c',
    numColor:   '#dc2626',
    border:     '#fca5a5',
    glow:       'rgba(220,38,38,0.08)',
  },
}

export function StageBlocks({ counts }: StageBlocksProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '10px',
      }}
    >
      {STAGES.map(({ stage, label }) => {
        const s = BLOCK_STYLES[stage]
        const count = counts[stage] ?? 0
        return (
          <div
            key={stage}
            className="card-3d"
            style={{
              background: s.gradient,
              borderRadius: '12px',
              boxShadow: `0 2px 8px ${s.glow}, 0 0 0 1px ${s.border}`,
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '22px',
                fontWeight: 700,
                color: s.numColor,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {count}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: s.labelColor,
              }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
