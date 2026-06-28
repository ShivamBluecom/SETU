import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getOpportunityFilter } from '@/lib/query-filters'
import { CompanyHeader } from '@/components/companies/CompanyHeader'
import { CompanyTabs } from './CompanyTabs'
import type { SessionUser } from '@/types/api'

interface Props { params: { id: string } }

export default async function CompanyDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) return null

  const user = session.user as SessionUser
  const oppFilter = getOpportunityFilter(user)

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      territory: { select: { id: true, name: true } },
      contacts: {
        include: { company: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
      },
      opportunities: {
        where: oppFilter,
        include: {
          company: { select: { id: true, name: true, industry: true } },
          primaryContact: { select: { id: true, name: true, designation: true, email: true, phone: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          territory: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!company) notFound()

  return (
    <div>
      <CompanyHeader company={company} />
      <CompanyTabs contacts={company.contacts} opportunities={company.opportunities} companyId={company.id} />
    </div>
  )
}
