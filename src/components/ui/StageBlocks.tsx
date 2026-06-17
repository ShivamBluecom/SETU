interface StageBlocksProps {
  counts: Partial<Record<string, number>>
}

const STAGES: { stage: string; label: string }[] = [
  { stage: 'PROSPECTING', label: 'Prospecting' },
  { stage: 'QUALIFIED', label: 'Qualified' },
  { stage: 'PROPOSAL', label: 'Proposal' },
  { stage: 'NEGOTIATION', label: 'Negotiation' },
  { stage: 'WON', label: 'Won' },
  { stage: 'LOST', label: 'Lost' },
]

const BLOCK_STYLES: Record<string, { bg: string; color: string }> = {
  PROSPECTING: { bg: 'var(--color-surface-2)', color: 'var(--color-text-2)' },
  QUALIFIED: { bg: '#EFF6FF', color: '#1D4ED8' },
  PROPOSAL: { bg: '#FFF7ED', color: '#C2410C' },
  NEGOTIATION: { bg: '#FDF4FF', color: '#7E22CE' },
  WON: { bg: 'var(--color-accent-bg)', color: 'var(--color-accent-text)' },
  LOST: { bg: '#FEF2F2', color: 'var(--color-danger)' },
}

export function StageBlocks({ counts }: StageBlocksProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {STAGES.map(({ stage, label }) => {
        const { bg, color } = BLOCK_STYLES[stage]
        const count = counts[stage] ?? 0
        return (
          <div
            key={stage}
            style={{
              background: bg,
              borderRadius: '6px',
              border: '0.5px solid var(--color-border)',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              minWidth: '80px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '18px',
                fontWeight: 600,
                color,
              }}
            >
              {count}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.04em',
                color,
                opacity: 0.75,
                textTransform: 'uppercase',
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
