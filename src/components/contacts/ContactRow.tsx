import type { Contact, Company } from '@prisma/client'

interface ContactRowProps {
  contact: Contact & { company: Pick<Company, 'id' | 'name'> }
  showCompany?: boolean
}

export function ContactRow({ contact, showCompany = true }: ContactRowProps) {
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
    </tr>
  )
}
