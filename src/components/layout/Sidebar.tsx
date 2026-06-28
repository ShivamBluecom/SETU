'use client'

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
} from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { UserRole } from '@/types/enums'

interface SidebarProps {
  role: UserRole
}

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/opportunities', icon: List, label: 'Opportunities' },
  { href: '/pipeline', icon: Columns, label: 'Pipeline' },
  { href: '/companies', icon: Building2, label: 'Companies' },
  { href: '/contacts', icon: Users, label: 'Contacts' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const items = role === 'ADMIN'
    ? [...NAV, { href: '/admin', icon: Shield, label: 'Admin' }]
    : NAV

  return (
    <Tooltip.Provider delayDuration={400}>
      <nav
        style={{
          width: '48px',
          background: 'var(--color-surface)',
          borderRight: '0.5px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 0',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Tooltip.Root key={href}>
              <Tooltip.Trigger asChild>
                <Link
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: active ? 'var(--color-accent)' : 'var(--color-surface-2)',
                    color: active ? '#fff' : 'var(--color-text-3)',
                    textDecoration: 'none',
                    transition: 'background 150ms, color 150ms',
                  }}
                  aria-label={label}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  style={{
                    background: 'var(--color-text-1)',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                  }}
                >
                  {label}
                  <Tooltip.Arrow style={{ fill: 'var(--color-text-1)' }} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )
        })}
      </nav>
    </Tooltip.Provider>
  )
}
