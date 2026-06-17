'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import type { UserRole } from '@/types/enums'

interface TopbarProps {
  user: {
    name?: string | null
    email?: string | null
    role: UserRole
    buId?: string | null
    territoryId?: string | null
  }
}

const ROLE_LABELS: Record<UserRole, string> = {
  ISR: 'ISR',
  ACCOUNT_MANAGER: 'Account Manager',
  BU_MANAGER: 'BU Manager',
  BU_HEAD: 'BU Head',
  TERRITORY_MANAGER: 'Territory Manager',
  ADMIN: 'Admin',
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header
      style={{
        height: '48px',
        background: 'var(--color-surface)',
        borderBottom: '0.5px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-grotesk)',
          fontWeight: 600,
          fontSize: '15px',
          letterSpacing: '1.5px',
          color: 'var(--color-text-1)',
          flexShrink: 0,
        }}
      >
        SETU
      </span>

      <div style={{ flex: 1 }} />

      <span
        style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-text-3)',
          background: 'var(--color-surface-2)',
          padding: '2px 8px',
          borderRadius: '4px',
          border: '0.5px solid var(--color-border)',
        }}
      >
        {ROLE_LABELS[user.role]}
      </span>

      <Link
        href="/notifications"
        style={{
          color: 'var(--color-text-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          border: '0.5px solid var(--color-border)',
          background: 'var(--color-surface)',
          textDecoration: 'none',
        }}
        title="Notifications"
      >
        <Bell size={15} strokeWidth={1.5} />
      </Link>

      <Avatar name={user.name ?? user.email ?? ''} size="sm" />
    </header>
  )
}
