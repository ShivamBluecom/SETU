import { Pencil } from 'lucide-react'
import type { Contact, Company } from '@prisma/client'

interface ContactRowProps {
  contact: Contact & { company: Pick<Company, 'id' | 'name'> }
  showCompany?: boolean
  onEdit?: (contact: Contact & { company: Pick<Company, 'id' | 'name'> }) => void
}

export function ContactRow({ contact, showCompany = true, onEdit }: ContactRowProps) {
  return (
    <tr>
      <td style={{ color: 'var(--color-text-1)', fontWeight: 500 }}>{contact.name}</td>
      <td>{contact.designation ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
      {showCompany && <td>{contact.company.name}</td>}
      <td>
        {contact.email ? (
          <a href={`mailto:${contact.email}`} style={{ color: 'var(--color-accent)', fontSize: '13px', textDecoration: 'none' }}>
            {contact.email}
          </a>
        ) : (
          <span style={{ color: 'var(--color-text-3)' }}>—</span>
        )}
      </td>
      <td>{contact.phone ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
      {onEdit && (
        <td style={{ width: '40px' }}>
          <button
            onClick={() => onEdit(contact)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center' }}
            title="Edit contact"
          >
            <Pencil size={14} />
          </button>
        </td>
      )}
    </tr>
  )
}
