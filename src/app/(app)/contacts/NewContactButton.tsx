'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { NewContactModal } from '@/components/contacts/NewContactModal'
import { useRouter } from 'next/navigation'

export function NewContactButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        className="btn-primary"
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Plus size={14} /> New Contact
      </button>
      <NewContactModal
        open={open}
        onOpenChange={setOpen}
        onCreated={() => { setOpen(false); router.refresh() }}
      />
    </>
  )
}
