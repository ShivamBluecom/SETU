'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  List,
  Columns,
  Building2,
  Users,
  Bell,
  Shield,
  Zap,
} from 'lucide-react'
import type { UserRole } from '@/types/enums'

interface SidebarProps {
  role: UserRole
}

const NAV = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/opportunities',  icon: List,            label: 'Opportunities' },
  { href: '/pipeline',       icon: Columns,         label: 'Pipeline' },
  { href: '/companies',      icon: Building2,       label: 'Companies' },
  { href: '/contacts',       icon: Users,           label: 'Contacts' },
  { href: '/notifications',  icon: Bell,            label: 'Notifications' },
]

function NavItem({ href, icon: Icon, label, active }: {
  href: string
  icon: typeof LayoutDashboard
  label: string
  active: boolean
}) {
  const [hover, setHover] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 14px',
        borderRadius: '10px',
        marginBottom: '2px',
        textDecoration: 'none',
        position: 'relative',
        background: active
          ? 'var(--sidebar-item-active)'
          : hover
          ? 'var(--sidebar-item-hover)'
          : 'transparent',
        color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
        transition: 'background 120ms ease, color 120ms ease',
        borderLeft: active ? '2px solid var(--color-accent)' : '2px solid transparent',
      }}
    >
      <Icon
        size={16}
        strokeWidth={active ? 2.25 : 1.75}
        style={{ flexShrink: 0, transition: 'color 120ms' }}
      />
      <span
        style={{
          fontSize: '13px',
          fontWeight: active ? 500 : 400,
          letterSpacing: '0.01em',
          transition: 'font-weight 120ms',
        }}
      >
        {label}
      </span>
      {active && (
        <span
          style={{
            position: 'absolute',
            right: '12px',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'var(--color-accent)',
            boxShadow: '0 0 8px var(--color-accent)',
          }}
        />
      )}
    </Link>
  )
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const items = role === 'ADMIN'
    ? [...NAV, { href: '/admin', icon: Shield, label: 'Admin' }]
    : NAV

  return (
    <nav
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow orb */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-60px',
          left: '-60px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo */}
      <div
        style={{
          padding: '18px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(13,148,136,0.45)',
              flexShrink: 0,
            }}
          >
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '0.1em',
                color: '#ffffff',
                lineHeight: 1.2,
              }}
            >
              SETU
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(148,163,184,0.65)',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                lineHeight: 1,
                marginTop: '2px',
              }}
            >
              Bluecom CRM
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '12px 10px', flex: 1 }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(148,163,184,0.4)',
            padding: '4px 14px 8px',
          }}
        >
          Navigation
        </div>
        {items.map(({ href, icon, label }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <NavItem
              key={href}
              href={href}
              icon={icon}
              label={label}
              active={active}
            />
          )
        })}
      </div>

      {/* Bottom teal glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background:
            'linear-gradient(to top, rgba(8,145,178,0.07) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Version footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: 'rgba(148,163,184,0.35)',
            letterSpacing: '0.05em',
          }}
        >
          v1.0 · Bluecom Group
        </span>
      </div>
    </nav>
  )
}
