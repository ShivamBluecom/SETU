import { getInitials } from '@/lib/format'

interface AvatarProps {
  name: string | null | undefined
  size?: 'sm' | 'md'
}

const AVATAR_COLORS = [
  { bg: '#E0F2FE', color: '#0369A1' },
  { bg: '#FCE7F3', color: '#9D174D' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: 'var(--color-accent-bg)', color: 'var(--color-accent-text)' },
]

function getColorIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return hash % AVATAR_COLORS.length
}

export function Avatar({ name, size = 'sm' }: AvatarProps) {
  const initials = getInitials(name)
  const { bg, color } = AVATAR_COLORS[getColorIndex(name ?? '?')]
  const dimension = size === 'sm' ? '28px' : '36px'
  const fontSize = size === 'sm' ? '11px' : '13px'

  return (
    <span
      title={name ?? undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        background: bg,
        color,
        fontSize,
        fontWeight: 500,
        fontFamily: 'var(--font-grotesk)',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials}
    </span>
  )
}
