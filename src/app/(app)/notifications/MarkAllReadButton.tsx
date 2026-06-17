'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

export function MarkAllReadButton() {
  const router = useRouter()
  const { showToast } = useToast()

  const handleClick = async () => {
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    if (res.ok) {
      showToast('All marked as read', 'success')
      router.refresh()
    }
  }

  return (
    <button className="btn-secondary" onClick={handleClick} style={{ fontSize: '13px' }}>
      Mark all read
    </button>
  )
}
