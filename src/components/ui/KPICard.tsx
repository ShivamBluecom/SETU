interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  valueColor?: 'accent' | 'default' | 'danger'
  accent?: 'teal' | 'blue' | 'purple' | 'orange' | 'green'
  icon?: React.ReactNode
}

const ACCENT_GRADIENTS: Record<string, string> = {
  teal:   'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
  blue:   'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  purple: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
  orange: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
  green:  'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)',
}

const ACCENT_GLOWS: Record<string, string> = {
  teal:   'rgba(13,148,136,0.12)',
  blue:   'rgba(37,99,235,0.12)',
  purple: 'rgba(124,58,237,0.12)',
  orange: 'rgba(217,119,6,0.12)',
  green:  'rgba(22,163,74,0.12)',
}

const VALUE_COLORS = {
  accent:  'var(--color-accent)',
  default: 'var(--color-text-1)',
  danger:  'var(--color-danger)',
}

export function KPICard({
  title,
  value,
  subtitle,
  valueColor = 'default',
  accent = 'teal',
  icon,
}: KPICardProps) {
  const gradient = ACCENT_GRADIENTS[accent]
  const glow = ACCENT_GLOWS[accent]

  return (
    <div
      className="card-3d"
      style={{
        padding: '0',
        overflow: 'hidden',
        minWidth: 0,
        position: 'relative',
      }}
    >
      {/* Gradient top bar */}
      <div
        style={{
          height: '3px',
          background: gradient,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
        }}
      />

      <div style={{ padding: '22px 22px 20px' }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--color-text-3)',
            }}
          >
            {title}
          </span>
          {icon && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: glow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '26px',
            fontWeight: 700,
            color: VALUE_COLORS[valueColor],
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: subtitle ? '6px' : 0,
          }}
        >
          {value}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-3)',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
