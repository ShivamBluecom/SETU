import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ContactTable } from '@/components/contacts/ContactTable'
import { NewContactButton } from './NewContactButton'

export default async function ContactsPage() {
  const session = await auth()
  if (!session) return null

  const contacts = await prisma.contact.findMany({
    include: { company: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
          Contacts
        </h1>
        <NewContactButton />
      </div>
      <ContactTable contacts={contacts} />
    </div>
  )
}
