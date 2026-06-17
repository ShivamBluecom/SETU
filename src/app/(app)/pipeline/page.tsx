'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { KanbanCard } from '@/components/opportunities/KanbanCard'
import { OpportunityDrawer } from '@/components/opportunities/OpportunityDrawer'
import { NewOpportunityModal } from '@/components/opportunities/NewOpportunityModal'
import { useToast } from '@/contexts/ToastContext'
import type { OpportunityWithRelations } from '@/types/api'
import type { OpportunityStage } from '@/types/enums'

const STAGES: { stage: OpportunityStage; label: string }[] = [
  { stage: 'PROSPECTING', label: 'Prospecting' },
  { stage: 'QUALIFIED', label: 'Qualified' },
  { stage: 'PROPOSAL', label: 'Proposal' },
  { stage: 'NEGOTIATION', label: 'Negotiation' },
  { stage: 'WON', label: 'Won' },
  { stage: 'LOST', label: 'Lost' },
]

const COLUMN_HEADER_STYLES: Partial<Record<OpportunityStage, React.CSSProperties>> = {
  WON: { background: 'var(--color-accent-bg)', color: 'var(--color-accent-text)' },
  LOST: { background: '#FEF2F2', color: 'var(--color-danger)' },
}

export default function PipelinePage() {
  const { showToast } = useToast()
  const [opps, setOpps] = useState<OpportunityWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newModalStage, setNewModalStage] = useState<OpportunityStage | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/opportunities')
      const data = await res.json()
      setOpps(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const byStage = (stage: string) =>
    opps.filter(o => o.stage === stage).sort((a, b) => a.orderIndex - b.orderIndex)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeOpp = opps.find(o => o.id === active.id)
    const overOpp = opps.find(o => o.id === over.id)

    if (!activeOpp || !overOpp) return
    if (activeOpp.stage !== overOpp.stage) return

    const stageOpps = byStage(activeOpp.stage)
    const oldIdx = stageOpps.findIndex(o => o.id === active.id)
    const newIdx = stageOpps.findIndex(o => o.id === over.id)
    const reordered = arrayMove(stageOpps, oldIdx, newIdx)

    const updated = opps.map(o => {
      const idx = reordered.findIndex(r => r.id === o.id)
      return idx >= 0 ? { ...o, orderIndex: idx } : o
    })
    setOpps(updated)

    try {
      await fetch(`/api/opportunities/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIndex: newIdx }),
      })
    } catch {
      showToast('Failed to save order', 'error')
      load()
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 600, color: 'var(--color-text-1)', flexShrink: 0 }}>
        Pipeline
      </h1>

      {loading ? (
        <p style={{ color: 'var(--color-text-3)', fontSize: '13px' }}>Loading…</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              flex: 1,
              paddingBottom: '8px',
            }}
          >
            {STAGES.map(({ stage, label }) => {
              const cards = byStage(stage)
              const headerStyle = COLUMN_HEADER_STYLES[stage] ?? {
                background: 'var(--color-surface-2)',
                color: 'var(--color-text-2)',
              }

              return (
                <div
                  key={stage}
                  style={{
                    width: '260px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    border: '0.5px solid var(--color-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Column header */}
                  <div
                    style={{
                      ...headerStyle,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em' }}>
                      {label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          opacity: 0.7,
                        }}
                      >
                        {cards.length}
                      </span>
                      <button
                        onClick={() => setNewModalStage(stage)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: 'rgba(0,0,0,0.1)',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'inherit',
                        }}
                        title={`New ${label} opportunity`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Cards */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '8px',
                      background: 'var(--color-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      minHeight: '100px',
                    }}
                  >
                    <SortableContext
                      items={cards.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {cards.map(opp => (
                        <KanbanCard
                          key={opp.id}
                          opportunity={opp}
                          onClick={() => { setSelectedId(opp.id); setDrawerOpen(true) }}
                        />
                      ))}
                    </SortableContext>
                    {cards.length === 0 && (
                      <p style={{ fontSize: '12px', color: 'var(--color-text-3)', textAlign: 'center', padding: '16px 0' }}>
                        No opportunities
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </DndContext>
      )}

      <OpportunityDrawer
        opportunityId={selectedId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdated={load}
      />

      {newModalStage && (
        <NewOpportunityModal
          open={true}
          onOpenChange={(o) => { if (!o) setNewModalStage(null) }}
          defaultStage={newModalStage}
          onCreated={load}
        />
      )}
    </div>
  )
}
