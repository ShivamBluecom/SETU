import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CompanyTable } from '@/components/companies/CompanyTable'
import { NewCompanyButton } from './NewCompanyButton'
import { BulkImportButton } from '@/components/companies/BulkImportButton'
import type { CompanyWithCounts } from '@/types/api'

export default async function CompaniesPage() {
  const session = await auth()
  if (!session) return null

  const companies = await prisma.company.findMany({
    include: {
      territory: { select: { id: true, name: true } },
      _count: { select: { opportunities: true, contacts: true } },
      opportunities: {
        where: { stage: { notIn: ['WON', 'LOST'] } },
        select: { value: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const enriched: CompanyWithCounts[] = companies.map(c => ({
    ...c,
    openOpportunities: c.opportunities.length,
    pipelineValue: c.opportunities.reduce((sum, o) => sum + Number(o.value), 0),
  }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)' }}>
          Companies
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <BulkImportButton />
          <NewCompanyButton />
        </div>
      </div>
      <CompanyTable companies={enriched} />
    </div>
  )
}
