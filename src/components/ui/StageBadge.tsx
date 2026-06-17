import type { OpportunityStage } from '@/types/enums'

interface StageBadgeProps {
  stage: string
}

const STAGE_CONFIG: Record<
  OpportunityStage,
  { label: string; background: string; color: string }
> = {
  PROSPECTING: {
    label: 'Prospecting',
    background: 'var(--color-surface-2)',
    color: 'var(--color-text-2)',
  },
  QUALIFIED: {
    label: 'Qualified',
    background: '#EFF6FF',
    color: '#1D4ED8',
  },
  PROPOSAL: {
    label: 'Proposal',
    background: '#FFF7ED',
    color: '#C2410C',
  },
  NEGOTIATION: {
    label: 'Negotiation',
    background: '#FDF4FF',
    color: '#7E22CE',
  },
  WON: {
    label: 'Won',
    background: 'var(--color-accent-bg)',
    color: 'var(--color-accent-text)',
  },
  LOST: {
    label: 'Lost',
    background: '#FEF2F2',
    color: 'var(--color-danger)',
  },
}

const DEFAULT_CONFIG = {
  label: 'Unknown',
  background: 'var(--color-surface-2)',
  color: 'var(--color-text-3)',
}

export function StageBadge({ stage }: StageBadgeProps) {
  const config = (STAGE_CONFIG as Record<string, (typeof STAGE_CONFIG)[OpportunityStage]>)[stage] ?? DEFAULT_CONFIG
  return (
    <span
      className="stage-badge"
      style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        borderRadius: '4px',
        padding: '2px 8px',
        background: config.background,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  )
}

export { STAGE_CONFIG }
