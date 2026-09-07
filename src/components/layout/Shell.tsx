'use client'

import { useEffect, useState } from 'react'
import type { SessionUser } from '@/types/api'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'

interface ShellProps {
  user: SessionUser
  children: React.ReactNode
  showDashboard: boolean
}

export function Shell({ user, children, showDashboard }: ShellProps) {
  const isMobile = useIsMobile()
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) setNavOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (isMobile && navOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMobile, navOpen])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        role={user.role}
        showDashboard={showDashboard}
        isMobile={isMobile}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />
      {isMobile && navOpen && (
        <div
          onClick={() => setNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 150,
          }}
        />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar user={user} isMobile={isMobile} onToggleSidebar={() => setNavOpen(o => !o)} />
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            background: 'var(--color-page)',
            padding: isMobile ? '16px' : '28px 32px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
