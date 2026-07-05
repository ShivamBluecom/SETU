'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CompanyEditModal } from './CompanyEditModal'
import type { Company, Territory } from '@prisma/client'

interface Props {
  company: Company & { territory: Pick<Territory, 'id' | 'name'> | null }
}

export function CompanyEditButton({ company }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        className="btn-secondary"
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '4px 10px' }}
      >
        <Pencil size={12} /> Edit
      </button>
      <CompanyEditModal
        open={open}
        onOpenChange={setOpen}
        company={company}
        onSaved={() => { setOpen(false); router.refresh() }}
      />
    </>
  )
}
