import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AdminTabs } from './AdminTabs'
import type { SessionUser } from '@/types/api'

export default async function AdminPage() {
  const session = await auth()
  if (!session) return null

  const user = session.user as SessionUser
  if (user.role !== 'ADMIN') redirect('/dashboard')

  const [users, businessUnits, territories] = await Promise.all([
    prisma.user.findMany({
      include: {
        bu: { select: { id: true, name: true } },
        territory: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.businessUnit.findMany({
      include: {
        territory: { select: { id: true, name: true } },
        head: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.territory.findMany({
      include: {
        _count: { select: { businessUnits: true, users: true, opportunities: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div>
      <h1 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
        Admin
      </h1>
      <AdminTabs users={users} businessUnits={businessUnits} territories={territories} />
    </div>
  )
}
