'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
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

function UserMenu({ user }: { user: TopbarProps['user'] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
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
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--color-surface)',
            border: '0.5px solid var(--color-border)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
            minWidth: '220px',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          {/* User info */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '0.5px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
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

          {/* Role label */}
          <div
            style={{
              padding: '8px 16px',
              borderBottom: '0.5px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>Role</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-text-2)',
                background: 'var(--color-surface-2)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '0.5px solid var(--color-border)',
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
              gap: '8px',
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--color-danger)',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <LogOut size={14} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
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

      <UserMenu user={user} />
    </header>
  )
}
