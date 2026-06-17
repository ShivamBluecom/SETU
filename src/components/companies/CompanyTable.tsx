'use client'

import { useRouter } from 'next/navigation'
import type { CompanyWithCounts } from '@/types/api'
import { formatINR } from '@/lib/format'
import { EmptyState } from '@/components/ui/EmptyState'

interface CompanyTableProps {
  companies: CompanyWithCounts[]
}

export function CompanyTable({ companies }: CompanyTableProps) {
  const router = useRouter()

  if (companies.length === 0) {
    return <EmptyState message="Companies will appear here." />
  }

  return (
    <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Industry</th>
            <th>Territory</th>
            <th>Head Office</th>
            <th>Open Opps</th>
            <th>Pipeline Value</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company.id}
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/companies/${company.id}`)}
            >
              <td style={{ color: 'var(--color-text-1)', fontWeight: 500 }}>{company.name}</td>
              <td>{company.industry ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
              <td>{company.territory?.name ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
              <td>{company.headOffice ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  {company.openOpportunities ?? company._count.opportunities}
                </span>
              </td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  {formatINR(company.pipelineValue ?? 0)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
