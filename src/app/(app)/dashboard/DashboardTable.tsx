'use client'

import { useState } from 'react'
import { OpportunityRow } from '@/components/opportunities/OpportunityRow'
import { OpportunityDrawer } from '@/components/opportunities/OpportunityDrawer'
import { EmptyState } from '@/components/ui/EmptyState'
import type { OpportunityWithRelations } from '@/types/api'

interface DashboardTableProps {
  opportunities: OpportunityWithRelations[]
}

export function DashboardTable({ opportunities }: DashboardTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const open = (id: string) => { setSelectedId(id); setDrawerOpen(true) }
  const close = () => setDrawerOpen(false)

  if (opportunities.length === 0) {
    return <EmptyState message="Opportunities will appear here." />
  }

  return (
    <>
      <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Stage</th>
              <th>Priority</th>
              <th>Owner</th>
              <th>Close Date</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <OpportunityRow key={opp.id} opportunity={opp} onClick={() => open(opp.id)} />
            ))}
          </tbody>
        </table>
      </div>

      <OpportunityDrawer
        opportunityId={selectedId}
        open={drawerOpen}
        onClose={close}
        onUpdated={() => {}}
      />
    </>
  )
}
