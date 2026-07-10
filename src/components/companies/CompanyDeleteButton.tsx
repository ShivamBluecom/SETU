'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'

interface Props {
  companyId: string
  companyName: string
  contactCount: number
}

export function CompanyDeleteButton({ companyId, companyName, contactCount }: Props) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/companies/${companyId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to delete company.')
        setDeleting(false)
        return
      }
      router.push('/companies')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { setError(null); setOpen(true) }}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '12px', padding: '4px 10px',
          background: 'none', border: '0.5px solid var(--color-border)',
          borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
          color: 'var(--color-danger)',
        }}
      >
        <Trash2 size={12} /> Delete
      </button>

      <Modal open={open} onOpenChange={setOpen} title="Delete Company">
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--color-text-1)' }}>{companyName}</strong>?
          {contactCount > 0 && (
            <> This will also permanently delete <strong>{contactCount} contact{contactCount === 1 ? '' : 's'}</strong>.</>
          )}
          {' '}This action cannot be undone.
        </p>

        {error && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px',
            background: 'var(--color-danger-bg, #fff1f0)', border: '1px solid var(--color-danger)',
            borderRadius: '6px', fontSize: '13px', color: 'var(--color-danger)',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            className="btn-secondary"
            onClick={() => setOpen(false)}
            disabled={deleting}
            style={{ fontSize: '13px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              fontSize: '13px', padding: '6px 16px',
              background: 'var(--color-danger)', color: '#fff',
              border: 'none', borderRadius: '6px', cursor: deleting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontWeight: 500, opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? 'Deleting…' : 'Delete Company'}
          </button>
        </div>
      </Modal>
    </>
  )
}
