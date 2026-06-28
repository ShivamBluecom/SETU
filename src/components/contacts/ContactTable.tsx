'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Contact, Company } from '@prisma/client'
import { ContactRow } from './ContactRow'
import { EditContactModal } from './EditContactModal'
import { EmptyState } from '@/components/ui/EmptyState'

type ContactWithCompany = Contact & { company: Pick<Company, 'id' | 'name'> }

interface ContactTableProps {
  contacts: ContactWithCompany[]
  showCompany?: boolean
  onRefresh?: () => void
}

export function ContactTable({ contacts, showCompany = true, onRefresh }: ContactTableProps) {
  const router = useRouter()
  const refresh = onRefresh ?? (() => router.refresh())
  const [editingContact, setEditingContact] = useState<ContactWithCompany | null>(null)

  if (contacts.length === 0) {
    return <EmptyState message="Contacts will appear here." />
  }

  return (
    <>
      <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              {showCompany && <th>Company</th>}
              <th>Email</th>
              <th>Phone</th>
              <th style={{ width: '40px' }} />
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                showCompany={showCompany}
                onEdit={setEditingContact}
              />
            ))}
          </tbody>
        </table>
      </div>

      <EditContactModal
        contact={editingContact}
        open={!!editingContact}
        onOpenChange={open => { if (!open) setEditingContact(null) }}
        onSaved={() => { setEditingContact(null); refresh() }}
      />
    </>
  )
}
