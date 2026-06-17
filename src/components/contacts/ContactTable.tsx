import type { Contact, Company } from '@prisma/client'
import { ContactRow } from './ContactRow'
import { EmptyState } from '@/components/ui/EmptyState'

interface ContactTableProps {
  contacts: Array<Contact & { company: Pick<Company, 'id' | 'name'> }>
  showCompany?: boolean
}

export function ContactTable({ contacts, showCompany = true }: ContactTableProps) {
  if (contacts.length === 0) {
    return <EmptyState message="Contacts will appear here." />
  }

  return (
    <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Designation</th>
            {showCompany && <th>Company</th>}
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} showCompany={showCompany} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
