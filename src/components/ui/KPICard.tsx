interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  valueColor?: 'accent' | 'default' | 'danger'
}

const VALUE_COLORS = {
  accent: 'var(--color-accent)',
  default: 'var(--color-text-1)',
  danger: 'var(--color-danger)',
}

export function KPICard({ title, value, subtitle, valueColor = 'default' }: KPICardProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-border)',
        borderRadius: '8px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-text-3)',
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '24px',
          fontWeight: 600,
          color: VALUE_COLORS[valueColor],
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      {subtitle && (
        <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>{subtitle}</span>
      )}
    </div>
  )
}
