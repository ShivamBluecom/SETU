'use client'

import { useRouter } from 'next/navigation'
import { OpportunityRow } from '@/components/opportunities/OpportunityRow'
import { EmptyState } from '@/components/ui/EmptyState'
import type { OpportunityWithRelations } from '@/types/api'

interface DashboardTableProps {
  opportunities: OpportunityWithRelations[]
}

export function DashboardTable({ opportunities }: DashboardTableProps) {
  const router = useRouter()

  if (opportunities.length === 0) {
    return <EmptyState message="Opportunities will appear here." />
  }

  return (
    <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Stage</th>
            <th>Priority</th>
            <th>Created By</th>
            <th>Close Date</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => (
            <OpportunityRow key={opp.id} opportunity={opp} onClick={() => router.push(`/opportunities?open=${opp.id}`)} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
