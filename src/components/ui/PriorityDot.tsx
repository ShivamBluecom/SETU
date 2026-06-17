interface PriorityDotProps {
  priority: string
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'var(--color-danger)',
  MEDIUM: 'var(--color-warning)',
  LOW: 'var(--color-text-3)',
}

const PRIORITY_TITLES: Record<string, string> = {
  HIGH: 'High priority',
  MEDIUM: 'Medium priority',
  LOW: 'Low priority',
}

export function PriorityDot({ priority }: PriorityDotProps) {
  return (
    <span
      title={PRIORITY_TITLES[priority] ?? priority}
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: PRIORITY_COLORS[priority] ?? 'var(--color-text-3)',
        flexShrink: 0,
      }}
    />
  )
}
