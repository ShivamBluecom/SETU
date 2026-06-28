'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { OpportunityWithRelations } from '@/types/api'
import { PriorityDot } from '@/components/ui/PriorityDot'
import { formatINR, formatDate } from '@/lib/format'

interface KanbanCardProps {
  opportunity: OpportunityWithRelations
  onClick: () => void
}

export function KanbanCard({ opportunity, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: opportunity.id })

  const isDraft = opportunity.status === 'DRAFT'

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--color-bg)',
        border: `0.5px solid ${isDraft ? 'var(--color-border)' : 'var(--color-border)'}`,
        borderRadius: '6px',
        padding: '12px',
        cursor: 'pointer',
        position: 'relative',
        opacity: isDraft ? 0.75 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {isDraft && (
          <span style={{
            fontSize: '9px', fontWeight: 600, padding: '1px 5px', borderRadius: '3px',
            background: 'var(--color-surface-2)', color: 'var(--color-text-3)',
            textTransform: 'uppercase', letterSpacing: '0.05em', border: '0.5px solid var(--color-border)',
          }}>
            Draft
          </span>
        )}
        <PriorityDot priority={opportunity.priority} />
      </div>

      <p
        style={{
          margin: '0 0 4px',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--color-text-1)',
          paddingRight: isDraft ? '60px' : '16px',
          lineHeight: 1.3,
        }}
      >
        {opportunity.title}
      </p>

      <p
        style={{
          margin: '0 0 8px',
          fontSize: '13px',
          color: 'var(--color-text-2)',
        }}
      >
        {opportunity.company.name}
      </p>

      {opportunity.primaryContact && (
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--color-text-3)' }}>
          {opportunity.primaryContact.name}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-1)',
          }}
        >
          {formatINR(opportunity.value)}
        </span>
        {opportunity.closeDate && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
            {formatDate(opportunity.closeDate)}
          </span>
        )}
      </div>
    </div>
  )
}
