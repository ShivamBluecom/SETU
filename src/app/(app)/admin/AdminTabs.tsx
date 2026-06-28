'use client'

import { useState, useRef, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Avatar } from '@/components/ui/Avatar'
import { KPICard } from '@/components/ui/KPICard'
import { BarList } from '@/components/ui/charts/BarList'
import { DonutChart } from '@/components/ui/charts/DonutChart'
import { TrendChart } from '@/components/ui/charts/TrendChart'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { formatINR, formatINRCompact } from '@/lib/format'
import {
  groupByPriority,
  groupByTerritory,
  groupByBusinessUnit,
  groupByOwner,
  monthlyTrend,
  winLossSplit,
  type AnalyticsOpportunity,
} from '@/lib/analytics'
import type { UserRole } from '@/types/enums'

const ALL_ROLES: UserRole[] = [
  'ISR', 'ACCOUNT_MANAGER', 'BU_MANAGER', 'BU_HEAD', 'TERRITORY_MANAGER', 'ADMIN',
]

const ROLE_LABELS: Record<UserRole, string> = {
  ISR: 'ISR', ACCOUNT_MANAGER: 'Account Manager', BU_MANAGER: 'BU Manager',
  BU_HEAD: 'BU Head', TERRITORY_MANAGER: 'Territory Manager', ADMIN: 'Admin',
}

const BU_TYPES = ['ISG', 'NETWORKING_AV', 'ISS', 'BC_MICROSOFT', 'CLOUD']
const BU_TYPE_LABELS: Record<string, string> = {
  ISG: 'ISG', NETWORKING_AV: 'Networking & AV', ISS: 'ISS', BC_MICROSOFT: 'BC Microsoft', CLOUD: 'Cloud',
}

interface AdminTabsProps {
  users: Array<{
    id: string; name: string; email: string; role: string; buId: string | null; territoryId: string | null;
    bu: { id: string; name: string } | null;
    territory: { id: string; name: string } | null;
    assignedBUs: Array<{ bu: { id: string; name: string } }>;
    assignedTerritories: Array<{ territory: { id: string; name: string } }>;
  }>
  businessUnits: Array<{
    id: string; name: string; buType?: string | null;
    members: { id: string; name: string; email: string }[];
    _count: { members: number };
  }>
  territories: Array<{
    id: string; name: string;
    _count: { users: number; opportunities: number };
  }>
  oemConfigs: Array<{ id: string; buType: string; name: string }>
  opportunities: AnalyticsOpportunity[]
  currentUserId: string
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '0.5px solid var(--color-border)',
  borderRadius: '8px',
  padding: '20px 24px',
}

const sectionLabelStyle: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--color-text-3)',
}

const tabTriggerStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px', fontSize: '14px',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--color-text-1)' : 'var(--color-text-3)',
  borderBottom: '2px solid',
  borderBottomColor: active ? 'var(--color-accent)' : 'transparent',
  background: 'none', border: 'none', borderBottomWidth: '2px', borderBottomStyle: 'solid',
  cursor: 'pointer', outline: 'none',
})

const selectStyle: React.CSSProperties = {
  fontSize: '13px', padding: '4px 8px', maxWidth: '160px', width: '100%',
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
  background: 'var(--color-surface-2)', color: 'var(--color-text-2)',
  border: '0.5px solid var(--color-border)',
}

export function AdminTabs({ users, businessUnits, territories, oemConfigs, opportunities, currentUserId }: AdminTabsProps) {
  const [tab, setTab] = useState('users')
  const [newTerritoryName, setNewTerritoryName] = useState('')
  const [newBUName, setNewBUName] = useState('')
  const [newBUType, setNewBUType] = useState('')
  const [editingTerritoryId, setEditingTerritoryId] = useState<string | null>(null)
  const [editingTerritoryName, setEditingTerritoryName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [newOemBuType, setNewOemBuType] = useState('ISG')
  const [newOemName, setNewOemName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (editingTerritoryId) editInputRef.current?.focus()
  }, [editingTerritoryId])

  const openOpps = opportunities.filter(o => o.stage !== 'WON' && o.stage !== 'LOST')
  const totalPipelineValue = openOpps.reduce((sum, o) => sum + Number(o.value), 0)
  const wonCount = opportunities.filter(o => o.stage === 'WON').length
  const winRate = opportunities.length > 0 ? Math.round((wonCount / opportunities.length) * 100) : 0
  const avgDealSize = opportunities.length > 0
    ? opportunities.reduce((sum, o) => sum + Number(o.value), 0) / opportunities.length
    : 0
  const splits = winLossSplit(opportunities)
  const businessUnitRows = groupByBusinessUnit(opportunities)
  const territoryRows = groupByTerritory(opportunities)
  const ownerRows = groupByOwner(opportunities)
  const trendPoints = monthlyTrend(opportunities, 12)
  const priorityRows = groupByPriority(opportunities).map(r => ({ label: r.label, value: r.count }))

  const oemByBU = BU_TYPES.reduce((acc, bt) => {
    acc[bt] = oemConfigs.filter(c => c.buType === bt)
    return acc
  }, {} as Record<string, typeof oemConfigs>)

  const patchUser = async (userId: string, data: Record<string, unknown>, label: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) { showToast(`${label} updated`, 'success'); router.refresh() }
    else showToast(`Failed to update ${label.toLowerCase()}`, 'error')
  }

  const addUserBU = async (userId: string, buId: string) => {
    const res = await fetch(`/api/users/${userId}/business-units`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buId }),
    })
    if (res.ok) { showToast('Business unit assigned', 'success'); router.refresh() }
    else showToast('Failed to assign business unit', 'error')
  }

  const removeUserBU = async (userId: string, buId: string) => {
    const res = await fetch(`/api/users/${userId}/business-units`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buId }),
    })
    if (res.ok) { showToast('Business unit removed', 'success'); router.refresh() }
    else showToast('Failed to remove business unit', 'error')
  }

  const addUserTerritory = async (userId: string, territoryId: string) => {
    const res = await fetch(`/api/users/${userId}/territories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ territoryId }),
    })
    if (res.ok) { showToast('Territory assigned', 'success'); router.refresh() }
    else showToast('Failed to assign territory', 'error')
  }

  const removeUserTerritory = async (userId: string, territoryId: string) => {
    const res = await fetch(`/api/users/${userId}/territories`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ territoryId }),
    })
    if (res.ok) { showToast('Territory removed', 'success'); router.refresh() }
    else showToast('Failed to remove territory', 'error')
  }

  const createTerritory = async () => {
    if (!newTerritoryName.trim()) return
    const res = await fetch('/api/territories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTerritoryName }),
    })
    if (res.ok) { showToast('Territory created', 'success'); setNewTerritoryName(''); router.refresh() }
    else showToast('Failed', 'error')
  }

  const createBU = async () => {
    if (!newBUName.trim()) return
    const body: Record<string, unknown> = { name: newBUName }
    if (newBUType) body.buType = newBUType
    const res = await fetch('/api/business-units', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) { showToast('Business unit created', 'success'); setNewBUName(''); setNewBUType(''); router.refresh() }
    else showToast('Failed', 'error')
  }

  const createOemConfig = async () => {
    if (!newOemName.trim()) return
    const res = await fetch('/api/oem-configs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buType: newOemBuType, name: newOemName }),
    })
    if (res.ok) { showToast('OEM config added', 'success'); setNewOemName(''); router.refresh() }
    else showToast('Failed to add OEM config', 'error')
  }

  const deleteOemConfig = async (id: string) => {
    const res = await fetch(`/api/oem-configs/${id}`, { method: 'DELETE' })
    if (res.ok) { showToast('OEM config deleted', 'success'); router.refresh() }
    else showToast('Failed to delete OEM config', 'error')
  }

  const startEditTerritory = (id: string, currentName: string) => {
    setEditingTerritoryId(id)
    setEditingTerritoryName(currentName)
    setConfirmDeleteId(null)
  }

  const saveEditTerritory = async (id: string) => {
    const name = editingTerritoryName.trim()
    if (!name) return
    const res = await fetch(`/api/territories/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      showToast('Territory renamed', 'success')
      setEditingTerritoryId(null)
      router.refresh()
    } else {
      const err = await res.json()
      showToast(err.error ?? 'Failed to rename', 'error')
    }
  }

  const deleteTerritory = async (id: string) => {
    const res = await fetch(`/api/territories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('Territory deleted', 'success')
      setConfirmDeleteId(null)
      router.refresh()
    } else {
      const err = await res.json()
      showToast(err.error ?? 'Failed to delete', 'error')
      setConfirmDeleteId(null)
    }
  }

  return (
    <Tabs.Root value={tab} onValueChange={setTab}>
      <div style={{ borderBottom: '0.5px solid var(--color-border)', marginBottom: '20px' }}>
        <Tabs.List style={{ display: 'flex' }}>
          <Tabs.Trigger value="users" style={tabTriggerStyle(tab === 'users')}>Users ({users.length})</Tabs.Trigger>
          <Tabs.Trigger value="business-units" style={tabTriggerStyle(tab === 'business-units')}>Business Units ({businessUnits.length})</Tabs.Trigger>
          <Tabs.Trigger value="territories" style={tabTriggerStyle(tab === 'territories')}>Territories ({territories.length})</Tabs.Trigger>
          <Tabs.Trigger value="oem-configs" style={tabTriggerStyle(tab === 'oem-configs')}>OEM Config ({oemConfigs.length})</Tabs.Trigger>
          <Tabs.Trigger value="analytics" style={tabTriggerStyle(tab === 'analytics')}>Analytics</Tabs.Trigger>
        </Tabs.List>
      </div>

      <Tabs.Content value="users">
        <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Business Unit</th>
                <th>Territory</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const role = u.role as UserRole
                const showBUChips = role === 'ISR' || role === 'BU_MANAGER'
                const showBUSelect = role === 'BU_HEAD'
                const showTerritorySelect = role === 'TERRITORY_MANAGER'
                const showTerritoryChips = role === 'ACCOUNT_MANAGER'

                const unassignedBUs = businessUnits.filter(b => !u.assignedBUs.find(a => a.bu.id === b.id))
                const unassignedTerritories = territories.filter(t => !u.assignedTerritories.find(a => a.territory.id === t.id))

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-1)' }}>
                            {u.name}
                            {u.id === currentUserId && (
                              <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--color-accent)', fontWeight: 400 }}>you</span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => patchUser(u.id, { role: e.target.value }, 'Role')}
                        style={selectStyle}
                      >
                        {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    </td>
                    <td>
                      {showBUChips ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', maxWidth: '280px' }}>
                          {u.assignedBUs.map(a => (
                            <span key={a.bu.id} style={chipStyle}>
                              {a.bu.name}
                              <button
                                onClick={() => removeUserBU(u.id, a.bu.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '0', lineHeight: 1, fontSize: '12px' }}
                                title="Remove"
                              >×</button>
                            </span>
                          ))}
                          {unassignedBUs.length > 0 && (
                            <select
                              value=""
                              onChange={e => { if (e.target.value) addUserBU(u.id, e.target.value) }}
                              style={{ ...selectStyle, fontSize: '11px', maxWidth: '120px' }}
                            >
                              <option value="">+ Add BU</option>
                              {unassignedBUs.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          )}
                        </div>
                      ) : showBUSelect ? (
                        <select
                          value={u.buId ?? ''}
                          onChange={e => patchUser(u.id, { buId: e.target.value || null }, 'Business unit')}
                          style={selectStyle}
                        >
                          <option value="">— None —</option>
                          {businessUnits.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {showTerritoryChips ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', maxWidth: '280px' }}>
                          {u.assignedTerritories.map(a => (
                            <span key={a.territory.id} style={chipStyle}>
                              {a.territory.name}
                              <button
                                onClick={() => removeUserTerritory(u.id, a.territory.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '0', lineHeight: 1, fontSize: '12px' }}
                                title="Remove"
                              >×</button>
                            </span>
                          ))}
                          {unassignedTerritories.length > 0 && (
                            <select
                              value=""
                              onChange={e => { if (e.target.value) addUserTerritory(u.id, e.target.value) }}
                              style={{ ...selectStyle, fontSize: '11px', maxWidth: '140px' }}
                            >
                              <option value="">+ Add Territory</option>
                              {unassignedTerritories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                      ) : showTerritorySelect ? (
                        <select
                          value={u.territoryId ?? ''}
                          onChange={e => patchUser(u.id, { territoryId: e.target.value || null }, 'Territory')}
                          style={selectStyle}
                        >
                          <option value="">— None —</option>
                          {territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--color-text-3)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Tabs.Content>

      <Tabs.Content value="business-units">
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input value={newBUName} onChange={e => setNewBUName(e.target.value)} placeholder="New business unit name"
            style={{ maxWidth: '240px' }}
            onKeyDown={e => e.key === 'Enter' && createBU()}
          />
          <select value={newBUType} onChange={e => setNewBUType(e.target.value)} style={{ ...selectStyle, maxWidth: '160px' }}>
            <option value="">No type</option>
            {BU_TYPES.map(bt => <option key={bt} value={bt}>{BU_TYPE_LABELS[bt]}</option>)}
          </select>
          <button className="btn-primary" onClick={createBU}>Create</button>
        </div>
        <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Type</th><th>BU Head</th><th>Total Members</th></tr>
            </thead>
            <tbody>
              {businessUnits.map(bu => (
                <tr key={bu.id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-1)' }}>{bu.name}</td>
                  <td>
                    {bu.buType ? (
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '3px', background: 'var(--color-surface-2)', color: 'var(--color-text-2)', border: '0.5px solid var(--color-border)' }}>
                        {BU_TYPE_LABELS[bu.buType] ?? bu.buType}
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-3)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {bu.members[0] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Avatar name={bu.members[0].name} size="sm" />
                        <span style={{ fontSize: '13px' }}>{bu.members[0].name}</span>
                      </div>
                    ) : <span style={{ color: 'var(--color-text-3)', fontSize: '13px' }}>No head assigned</span>}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{bu._count.members}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tabs.Content>

      <Tabs.Content value="territories">
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <input value={newTerritoryName} onChange={e => setNewTerritoryName(e.target.value)} placeholder="New territory name"
            style={{ maxWidth: '280px' }}
            onKeyDown={e => e.key === 'Enter' && createTerritory()}
          />
          <button className="btn-primary" onClick={createTerritory}>Create</button>
        </div>
        <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr><th>Territory</th><th>Users</th><th>Opportunities</th><th style={{ width: '80px' }}></th></tr>
            </thead>
            <tbody>
              {territories.map(t => {
                const canDelete = t._count.users === 0 && t._count.opportunities === 0
                const isEditing = editingTerritoryId === t.id
                const isConfirming = confirmDeleteId === t.id
                return (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-text-1)' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            ref={editInputRef}
                            value={editingTerritoryName}
                            onChange={e => setEditingTerritoryName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEditTerritory(t.id)
                              if (e.key === 'Escape') setEditingTerritoryId(null)
                            }}
                            style={{ fontSize: '13px', padding: '4px 8px', maxWidth: '200px' }}
                          />
                          <button onClick={() => saveEditTerritory(t.id)} title="Save" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', padding: '2px' }}>
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingTerritoryId(null)} title="Cancel" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '2px' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : isConfirming ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--color-danger)' }}>Delete &ldquo;{t.name}&rdquo;?</span>
                          <button onClick={() => deleteTerritory(t.id)} style={{ fontSize: '12px', padding: '3px 10px', background: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Yes, delete
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} style={{ fontSize: '12px', padding: '3px 10px', background: 'var(--color-surface-2)', color: 'var(--color-text-2)', border: '0.5px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        t.name
                      )}
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{t._count.users}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{t._count.opportunities}</span></td>
                    <td>
                      {!isEditing && !isConfirming && (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => startEditTerritory(t.id, t.name)}
                            title="Rename"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '4px', borderRadius: '4px' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-1)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => canDelete ? setConfirmDeleteId(t.id) : showToast('Cannot delete: territory has linked users or opportunities', 'error')}
                            title={canDelete ? 'Delete' : 'Cannot delete: has linked records'}
                            style={{ background: 'none', border: 'none', cursor: canDelete ? 'pointer' : 'not-allowed', color: canDelete ? 'var(--color-text-3)' : 'var(--color-border)', padding: '4px', borderRadius: '4px' }}
                            onMouseEnter={e => { if (canDelete) e.currentTarget.style.color = 'var(--color-danger)' }}
                            onMouseLeave={e => { if (canDelete) e.currentTarget.style.color = 'var(--color-text-3)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Tabs.Content>

      <Tabs.Content value="oem-configs">
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <p style={{ ...sectionLabelStyle, marginBottom: '12px' }}>Add OEM Config</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={newOemBuType}
              onChange={e => setNewOemBuType(e.target.value)}
              style={{ ...selectStyle, maxWidth: '180px' }}
            >
              {BU_TYPES.map(bt => <option key={bt} value={bt}>{BU_TYPE_LABELS[bt]}</option>)}
            </select>
            <input
              value={newOemName}
              onChange={e => setNewOemName(e.target.value)}
              placeholder="OEM / vendor name"
              style={{ maxWidth: '240px' }}
              onKeyDown={e => e.key === 'Enter' && createOemConfig()}
            />
            <button className="btn-primary" onClick={createOemConfig}>Add</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {BU_TYPES.map(bt => (
            <div key={bt} style={cardStyle}>
              <p style={sectionLabelStyle}>{BU_TYPE_LABELS[bt]}</p>
              {oemByBU[bt].length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--color-text-3)', margin: 0 }}>No configs yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {oemByBU[bt].map((cfg, i) => (
                    <div
                      key={cfg.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: i < oemByBU[bt].length - 1 ? '0.5px solid var(--color-border)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: 'var(--color-text-1)' }}>{cfg.name}</span>
                      <button
                        onClick={() => deleteOemConfig(cfg.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '2px 4px', borderRadius: '4px', display: 'flex' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Tabs.Content>

      <Tabs.Content value="analytics">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <KPICard title="Total Pipeline" value={formatINR(totalPipelineValue)} subtitle={`${openOpps.length} open opportunities`} valueColor="accent" />
          <KPICard title="Open Opportunities" value={String(openOpps.length)} subtitle="Excluding Won & Lost" />
          <KPICard title="Win Rate" value={`${winRate}%`} subtitle={`${wonCount} won of ${opportunities.length} total`} />
          <KPICard title="Avg Deal Size" value={formatINR(avgDealSize)} subtitle="Across all opportunities" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div style={cardStyle}>
            <p style={sectionLabelStyle}>Won / Lost / Open</p>
            <DonutChart
              segments={[
                { label: 'Won', value: splits.won, color: 'var(--color-accent)' },
                { label: 'Lost', value: splits.lost, color: 'var(--color-danger)' },
                { label: 'Open', value: splits.open, color: 'var(--color-surface-2)' },
              ]}
            />
          </div>
          <div style={cardStyle}>
            <p style={sectionLabelStyle}>Opportunities Created (12 mo)</p>
            <TrendChart points={trendPoints.map(p => ({ label: p.label, value: p.count }))} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div style={cardStyle}>
            <p style={sectionLabelStyle}>Pipeline by Business Unit</p>
            <BarList rows={businessUnitRows} formatValue={formatINRCompact} />
          </div>
          <div style={cardStyle}>
            <p style={sectionLabelStyle}>Pipeline by Territory</p>
            <BarList rows={territoryRows} formatValue={formatINRCompact} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={cardStyle}>
            <p style={sectionLabelStyle}>Top Owners by Pipeline</p>
            <BarList rows={ownerRows} formatValue={formatINRCompact} />
          </div>
          <div style={cardStyle}>
            <p style={sectionLabelStyle}>By Priority</p>
            <BarList rows={priorityRows} formatValue={v => String(v)} />
          </div>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  )
}
