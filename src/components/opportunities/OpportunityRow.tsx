import type { OpportunityWithRelations } from '@/types/api'
import { StageBadge } from '@/components/ui/StageBadge'
import { PriorityDot } from '@/components/ui/PriorityDot'
import { Avatar } from '@/components/ui/Avatar'
import { formatINR, formatDate } from '@/lib/format'

interface OpportunityRowProps {
  opportunity: OpportunityWithRelations
  onClick: () => void
}

export function OpportunityRow({ opportunity, onClick }: OpportunityRowProps) {
  return (
    <tr style={{ cursor: 'pointer' }} onClick={onClick}>
      <td style={{ color: 'var(--color-text-1)', fontWeight: 500, fontSize: '14px' }}>
        {opportunity.title}
      </td>
      <td>{opportunity.company.name}</td>
      <td>
        <StageBadge stage={opportunity.stage} />
      </td>
      <td>
        <PriorityDot priority={opportunity.priority} />
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Avatar name={opportunity.createdBy.name} size="sm" />
          <span style={{ fontSize: '13px' }}>{opportunity.createdBy.name}</span>
        </div>
      </td>
      <td>
        <span style={{ color: 'var(--color-text-2)', fontSize: '13px' }}>
          {formatDate(opportunity.closeDate)}
        </span>
      </td>
      <td>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>
          {formatINR(opportunity.value)}
        </span>
      </td>
    </tr>
  )
}
