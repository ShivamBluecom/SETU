import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StageBadge } from '@/components/ui/StageBadge'
import { formatRelativeTime } from '@/lib/format'
import { MarkAllReadButton } from './MarkAllReadButton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SessionUser } from '@/types/api'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) return null

  const user = session.user as SessionUser

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    include: {
      opportunity: {
        include: { company: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
          Notifications
        </h1>
        {notifications.some(n => !n.read) && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <EmptyState message="Notifications will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: n.read ? 'var(--color-bg)' : 'var(--color-surface)',
                border: '0.5px solid var(--color-border)',
                borderRadius: '6px',
              }}
            >
              {!n.read && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-1)' }}>
                  {n.opportunity.title}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-3)' }}>
                  {n.opportunity.company.name}
                </p>
              </div>
              <StageBadge stage={n.stage} />
              <span style={{ fontSize: '11px', color: 'var(--color-text-3)', flexShrink: 0 }}>
                {formatRelativeTime(n.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
