'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
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

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  ADMIN:              { bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed' },
  TERRITORY_MANAGER:  { bg: 'rgba(8,145,178,0.1)',   color: '#0891b2' },
  BU_HEAD:            { bg: 'rgba(13,148,136,0.1)',   color: '#0d9488' },
  BU_MANAGER:         { bg: 'rgba(22,163,74,0.1)',    color: '#16a34a' },
  ACCOUNT_MANAGER:    { bg: 'rgba(217,119,6,0.12)',   color: '#d97706' },
  ISR:                { bg: 'rgba(100,116,139,0.1)',  color: '#64748b' },
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/opportunities': 'Opportunities',
  '/pipeline':      'Pipeline',
  '/companies':     'Companies',
  '/contacts':      'Contacts',
  '/notifications': 'Notifications',
  '/admin':         'Admin',
}

function getTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || (path !== '/dashboard' && pathname.startsWith(path))) {
      return title
    }
  }
  return 'SETU'
}

function UserMenu({ user }: { user: TopbarProps['user'] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const roleStyle = ROLE_COLORS[user.role]

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '50%',
          outline: open ? '2px solid var(--color-accent)' : 'none',
          outlineOffset: '2px',
          transition: 'outline 150ms',
        }}
        aria-label="User menu"
        aria-expanded={open}
      >
        <Avatar name={user.name ?? user.email ?? ''} size="sm" />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-xl)',
            minWidth: '240px',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'fade-in-up 180ms ease forwards',
          }}
        >
          {/* User info */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--gradient-brand-subtle)',
            }}
          >
            <Avatar name={user.name ?? user.email ?? ''} size="md" />
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: '13px',
                  color: 'var(--color-text-1)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name ?? 'Unknown'}
              </p>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '12px',
                  color: 'var(--color-text-3)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </p>
            </div>
          </div>

          {/* Role badge */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>Role</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: roleStyle.color,
                background: roleStyle.bg,
                padding: '3px 9px',
                borderRadius: '20px',
              }}
            >
              {ROLE_LABELS[user.role]}
            </span>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '11px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--color-danger)',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <LogOut size={14} strokeWidth={2} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname()
  const title = getTitle(pathname)

  return (
    <header
      className="glass"
      style={{
        height: 'var(--topbar-height)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '12px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-1)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
      </div>

      <div style={{ flex: 1 }} />

      {/* Notifications */}
      <Link
        href="/notifications"
        title="Notifications"
        style={{
          color: 'var(--color-text-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-xs)',
          transition: 'box-shadow 150ms, background 150ms',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
          ;(e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-xs)'
          ;(e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'
        }}
      >
        <Bell size={15} strokeWidth={1.75} />
      </Link>

      <UserMenu user={user} />
    </header>
  )
}
