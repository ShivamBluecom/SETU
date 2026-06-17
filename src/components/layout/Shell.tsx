import type { SessionUser } from '@/types/api'
import { Topbar } from './Topbar'
import { Sidebar } from './Sidebar'

interface ShellProps {
  user: SessionUser
  children: React.ReactNode
}

export function Shell({ user, children }: ShellProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar role={user.role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar user={user} />
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            background: 'var(--color-bg)',
            padding: '24px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
