'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/contexts/ToastContext'

interface PocModalProps {
  opportunityId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPocs: Array<{ userId: string; user: { id: string; name: string; email: string } }>
  onShared: () => void
  canRemovePoc?: boolean
}

interface UserResult {
  id: string
  name: string
  email: string
  role: string
}

export function PocModal({
  opportunityId,
  open,
  onOpenChange,
  currentPocs,
  onShared,
  canRemovePoc = false,
}: PocModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    const timer = setTimeout(() => search(val), 300)
    return () => clearTimeout(timer)
  }

  const handleRemove = async (userId: string) => {
    const res = await fetch(`/api/opportunities/${opportunityId}/pocs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      showToast('User removed', 'success')
      onShared()
    } else {
      showToast('Failed to remove', 'error')
    }
  }

  const handleAdd = async (userId: string) => {
    const res = await fetch(`/api/opportunities/${opportunityId}/pocs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      showToast('User added to shared list', 'success')
      onShared()
      setQuery('')
      setResults([])
    } else {
      const err = await res.json().catch(() => null)
      showToast(err?.error ?? 'Failed to share', 'error')
    }
  }

  const pocUserIds = new Set(currentPocs.map((p) => p.userId))

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Share Opportunity">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--color-text-3)', display: 'block', marginBottom: '6px' }}>
            Search users
          </label>
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Name or email…"
          />
        </div>

        {loading && <p style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>Searching…</p>}

        {results.length > 0 && (
          <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
            {results.map((user) => {
              const alreadyAdded = pocUserIds.has(user.id)
              return (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderBottom: '0.5px solid var(--color-border)',
                    background: alreadyAdded ? 'var(--color-surface)' : 'var(--color-bg)',
                  }}
                >
                  <Avatar name={user.name} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-3)' }}>{user.email}</p>
                  </div>
                  {alreadyAdded ? (
                    <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>Shared</span>
                  ) : (
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleAdd(user.id)}>
                      Add
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {currentPocs.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-3)', marginBottom: '8px' }}>
              Currently shared with
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentPocs.map((poc) => (
                <div key={poc.userId} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar name={poc.user.name} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '13px' }}>{poc.user.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-3)', marginLeft: '6px' }}>{poc.user.email}</span>
                  </div>
                  {canRemovePoc && (
                    <button
                      onClick={() => handleRemove(poc.userId)}
                      className="btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px', flexShrink: 0 }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
