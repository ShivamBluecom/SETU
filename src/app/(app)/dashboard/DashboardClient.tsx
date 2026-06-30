'use client'

import { useState, useMemo, useEffect } from 'react'
import { X, Maximize2 } from 'lucide-react'
import { StageBlocks } from '@/components/ui/StageBlocks'
import { BarList } from '@/components/ui/charts/BarList'
import { TrendChart } from '@/components/ui/charts/TrendChart'
import { DashboardTable } from './DashboardTable'
import { formatINRCompact } from '@/lib/format'
import type { OpportunityWithRelations } from '@/types/api'

type ModalId = 'trend' | 'priority' | 'territory' | 'bu'

interface BarRow { label: string; value: number }

interface DashboardClientProps {
  recentOpps: OpportunityWithRelations[]
  stageCounts: Record<string, number>
  trendPoints: BarRow[]
  priorityRows: BarRow[]
  territoryRows: BarRow[]
  buRows: BarRow[]
  showTerritory: boolean
  showBU: boolean
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 14px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-text-3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {children}
      <span style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
    </p>
  )
}

// ─── Clickable chart card ─────────────────────────────────────────────────────
function ChartCard({
  title,
  onExpand,
  children,
}: {
  title: string
  onExpand: () => void
  children: React.ReactNode
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="card-3d"
      style={{ padding: '22px 24px', position: 'relative' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-3)',
          }}
        >
          {title}
        </p>
        <button
          onClick={onExpand}
          title="Expand"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: hover ? 'var(--color-surface-2)' : 'transparent',
            border: '1px solid',
            borderColor: hover ? 'var(--color-border)' : 'transparent',
            borderRadius: '6px',
            padding: '4px 8px',
            cursor: 'pointer',
            color: 'var(--color-text-3)',
            fontSize: '11px',
            fontFamily: 'inherit',
            transition: 'all 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-2)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
        >
          <Maximize2 size={11} strokeWidth={2} />
          Expand
        </button>
      </div>
      {children}
    </div>
  )
}

// ─── Chart modal ──────────────────────────────────────────────────────────────
const MODAL_CONFIGS: Record<ModalId, { title: string; type: 'trend' | 'bar'; valueLabel: string }> = {
  trend:     { title: 'Pipeline Trend',           type: 'trend', valueLabel: 'Opportunities' },
  priority:  { title: 'Opportunities by Priority', type: 'bar',   valueLabel: 'Count' },
  territory: { title: 'Pipeline by Territory',     type: 'bar',   valueLabel: 'Value' },
  bu:        { title: 'Pipeline by Business Unit', type: 'bar',   valueLabel: 'Value' },
}

function ChartModal({
  id,
  rows,
  onClose,
}: {
  id: ModalId
  rows: BarRow[]
  onClose: () => void
}) {
  const cfg = MODAL_CONFIGS[id]
  const isMonetary = id === 'territory' || id === 'bu'
  const formatValue = isMonetary ? formatINRCompact : (v: number) => String(v)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fade-in-up 180ms ease forwards',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card-3d"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '28px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text-1)',
              letterSpacing: '-0.01em',
            }}
          >
            {cfg.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              color: 'var(--color-text-2)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Chart */}
        <div style={{ marginBottom: '28px' }}>
          {cfg.type === 'trend' ? (
            <TrendChart points={rows} height={160} />
          ) : (
            <BarList rows={rows} formatValue={formatValue} />
          )}
        </div>

        {/* Data table */}
        <div
          style={{
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>{cfg.type === 'trend' ? 'Month' : 'Name'}</th>
                <th style={{ textAlign: 'right' }}>{cfg.valueLabel}</th>
                {rows.length > 0 && (
                  <th style={{ textAlign: 'right' }}>Share</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const total = rows.reduce((s, x) => s + x.value, 0)
                const pct = total > 0 ? Math.round((r.value / total) * 100) : 0
                return (
                  <tr key={r.label}>
                    <td style={{ color: 'var(--color-text-1)', fontWeight: i === 0 ? 500 : 400 }}>
                      {r.label}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500 }}>
                      {formatValue(r.value)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <div
                          style={{
                            width: '60px',
                            height: '6px',
                            background: 'var(--color-surface-2)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: 'var(--gradient-brand)',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-3)', width: '32px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────
export function DashboardClient({
  recentOpps,
  stageCounts,
  trendPoints,
  priorityRows,
  territoryRows,
  buRows,
  showTerritory,
  showBU,
}: DashboardClientProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<ModalId | null>(null)

  const handleStageClick = (stage: string) => {
    setSelectedStage(prev => (prev === stage ? null : stage))
  }

  const filteredOpps = useMemo(() => {
    if (!selectedStage) return recentOpps
    return recentOpps.filter(o => o.stage === selectedStage)
  }, [recentOpps, selectedStage])

  const modalRows: Record<ModalId, BarRow[]> = {
    trend:     trendPoints,
    priority:  priorityRows,
    territory: territoryRows,
    bu:        buRows,
  }

  const stageLabel = selectedStage
    ? selectedStage.charAt(0) + selectedStage.slice(1).toLowerCase()
    : null

  return (
    <>
      {/* Recent Opportunities */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>
          Recent Opportunities
          {stageLabel && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '20px',
                background: 'var(--color-accent-bg)',
                color: 'var(--color-accent-text)',
                letterSpacing: 0,
                textTransform: 'none',
              }}
            >
              {stageLabel} · {filteredOpps.length} of {recentOpps.length}
            </span>
          )}
        </SectionLabel>
        <div className="card-3d" style={{ overflow: 'hidden', padding: 0 }}>
          <DashboardTable opportunities={filteredOpps} />
        </div>
      </div>

      {/* Stage Distribution — click to filter table above */}
      <div style={{ marginBottom: '28px' }}>
        <SectionLabel>
          Stage Distribution
          {selectedStage && (
            <button
              onClick={() => setSelectedStage(null)}
              style={{
                fontSize: '11px',
                color: 'var(--color-text-3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                letterSpacing: 0,
                textTransform: 'none',
              }}
            >
              <X size={10} /> Clear filter
            </button>
          )}
        </SectionLabel>
        <p style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--color-text-3)' }}>
          Click a stage to filter the table above
        </p>
        <StageBlocks
          counts={stageCounts}
          selectedStage={selectedStage}
          onStageClick={handleStageClick}
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <ChartCard title="Pipeline Trend (6 mo)" onExpand={() => setActiveModal('trend')}>
          <TrendChart points={trendPoints} />
        </ChartCard>
        <ChartCard title="By Priority" onExpand={() => setActiveModal('priority')}>
          <BarList rows={priorityRows} formatValue={v => String(v)} />
        </ChartCard>
      </div>

      {/* Territory / BU row */}
      {(showTerritory && territoryRows.length > 0) || (showBU && buRows.length > 0) ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              showTerritory && territoryRows.length > 0 && showBU && buRows.length > 0
                ? 'repeat(2, 1fr)'
                : '1fr',
            gap: '16px',
          }}
        >
          {showTerritory && territoryRows.length > 0 && (
            <ChartCard title="By Territory" onExpand={() => setActiveModal('territory')}>
              <BarList rows={territoryRows} formatValue={formatINRCompact} />
            </ChartCard>
          )}
          {showBU && buRows.length > 0 && (
            <ChartCard title="By Business Unit" onExpand={() => setActiveModal('bu')}>
              <BarList rows={buRows} formatValue={formatINRCompact} />
            </ChartCard>
          )}
        </div>
      ) : null}

      {/* Chart modal */}
      {activeModal && (
        <ChartModal
          id={activeModal}
          rows={modalRows[activeModal]}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  )
}
