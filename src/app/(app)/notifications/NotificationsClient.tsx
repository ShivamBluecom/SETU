'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { StageBadge } from '@/components/ui/StageBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/contexts/ToastContext'
import { formatRelativeTime } from '@/lib/format'
import type { NotificationWithOpportunity } from '@/types/api'

interface Props {
  notifications: NotificationWithOpportunity[]
}

export function NotificationsClient({ notifications: initial }: Props) {
  const [notifications, setNotifications] = useState(initial)
  const { showToast } = useToast()

  const clearOne = async (id: string) => {
    const prev = notifications
    setNotifications(n => n.filter(x => x.id !== id))
    const res = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      setNotifications(prev)
      showToast('Failed to clear notification', 'error')
    }
  }

  const clearAll = async () => {
    const prev = notifications
    setNotifications([])
    const res = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    if (res.ok) {
      showToast('All notifications cleared', 'success')
    } else {
      setNotifications(prev)
      showToast('Failed to clear notifications', 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
          Notifications
        </h1>
        {notifications.length > 0 && (
          <button className="btn-secondary" onClick={clearAll} style={{ fontSize: '13px' }}>
            Clear all
          </button>
        )}
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
              {n.stage ? (
                <StageBadge stage={n.stage} />
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: 'var(--color-surface-2)', color: 'var(--color-text-3)', border: '0.5px solid var(--color-border)' }}>
                  New Line Item
                </span>
              )}
              <span style={{ fontSize: '11px', color: 'var(--color-text-3)', flexShrink: 0 }}>
                {formatRelativeTime(n.createdAt)}
              </span>
              <button
                type="button"
                onClick={() => clearOne(n.id)}
                title="Clear notification"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-3)', padding: '4px', flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
