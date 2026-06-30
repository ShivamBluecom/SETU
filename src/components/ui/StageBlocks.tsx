'use client'

import { useState } from 'react'

interface StageBlocksProps {
  counts: Partial<Record<string, number>>
  selectedStage?: string | null
  onStageClick?: (stage: string) => void
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
  ringColor: string
}> = {
  PROSPECTING: {
    gradient:   'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    labelColor: '#64748b',
    numColor:   '#0f172a',
    border:     '#cbd5e1',
    glow:       'rgba(100,116,139,0)',
    ringColor:  '#94a3b8',
  },
  QUALIFIED: {
    gradient:   'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    labelColor: '#1d4ed8',
    numColor:   '#1e40af',
    border:     '#bfdbfe',
    glow:       'rgba(37,99,235,0.08)',
    ringColor:  '#2563eb',
  },
  PROPOSAL: {
    gradient:   'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    labelColor: '#c2410c',
    numColor:   '#9a3412',
    border:     '#fdba74',
    glow:       'rgba(194,65,12,0.08)',
    ringColor:  '#ea580c',
  },
  NEGOTIATION: {
    gradient:   'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)',
    labelColor: '#7e22ce',
    numColor:   '#6b21a8',
    border:     '#d8b4fe',
    glow:       'rgba(126,34,206,0.08)',
    ringColor:  '#9333ea',
  },
  WON: {
    gradient:   'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
    labelColor: '#0f766e',
    numColor:   '#0d9488',
    border:     '#5eead4',
    glow:       'rgba(13,148,136,0.12)',
    ringColor:  '#0d9488',
  },
  LOST: {
    gradient:   'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
    labelColor: '#b91c1c',
    numColor:   '#dc2626',
    border:     '#fca5a5',
    glow:       'rgba(220,38,38,0.08)',
    ringColor:  '#dc2626',
  },
}

function StageBlock({
  stage,
  label,
  count,
  selected,
  dimmed,
  interactive,
  onClick,
}: {
  stage: string
  label: string
  count: number
  selected: boolean
  dimmed: boolean
  interactive: boolean
  onClick?: () => void
}) {
  const [hover, setHover] = useState(false)
  const s = BLOCK_STYLES[stage]

  return (
    <div
      onClick={interactive ? onClick : undefined}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        background: s.gradient,
        borderRadius: '12px',
        border: selected
          ? `2px solid ${s.ringColor}`
          : hover
          ? `1.5px solid ${s.ringColor}`
          : `1px solid ${s.border}`,
        boxShadow: selected
          ? `0 0 0 3px ${s.ringColor}22, 0 4px 16px ${s.glow}`
          : hover
          ? `0 4px 16px ${s.glow}, 0 2px 8px rgba(0,0,0,0.06)`
          : `0 2px 8px ${s.glow}`,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        textAlign: 'center',
        cursor: interactive ? 'pointer' : 'default',
        opacity: dimmed ? 0.38 : 1,
        transform: selected ? 'translateY(-2px)' : hover ? 'translateY(-1px)' : 'none',
        transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: s.ringColor,
            textTransform: 'uppercase',
          }}
        >
          ✓
        </div>
      )}
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
}

export function StageBlocks({ counts, selectedStage, onStageClick }: StageBlocksProps) {
  const interactive = !!onStageClick

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '10px',
      }}
    >
      {STAGES.map(({ stage, label }) => (
        <StageBlock
          key={stage}
          stage={stage}
          label={label}
          count={counts[stage] ?? 0}
          selected={selectedStage === stage}
          dimmed={!!selectedStage && selectedStage !== stage}
          interactive={interactive}
          onClick={() => onStageClick?.(stage)}
        />
      ))}
    </div>
  )
}
