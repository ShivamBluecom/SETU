'use client'

import { useState, useRef, useEffect } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { UserRole } from '@/types/enums'

const ALL_ROLES: UserRole[] = [
  'ISR', 'ACCOUNT_MANAGER', 'BU_MANAGER', 'BU_HEAD', 'TERRITORY_MANAGER', 'ADMIN',
]

const ROLE_LABELS: Record<UserRole, string> = {
  ISR: 'ISR', ACCOUNT_MANAGER: 'Account Manager', BU_MANAGER: 'BU Manager',
  BU_HEAD: 'BU Head', TERRITORY_MANAGER: 'Territory Manager', ADMIN: 'Admin',
}

interface AdminTabsProps {
  users: Array<{
    id: string; name: string; email: string; role: string; buId: string | null; territoryId: string | null;
    bu: { id: string; name: string } | null;
    territory: { id: string; name: string } | null;
    managedCompanies: { id: string; name: string }[];
  }>
  businessUnits: Array<{
    id: string; name: string;
    members: { id: string; name: string; email: string }[];
    _count: { members: number };
  }>
  territories: Array<{
    id: string; name: string;
    _count: { users: number; opportunities: number };
  }>
  companies: Array<{ id: string; name: string; accountManagerId: string | null }>
  currentUserId: string
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

export function AdminTabs({ users, businessUnits, territories, companies, currentUserId }: AdminTabsProps) {
  const [tab, setTab] = useState('users')
  const [newTerritoryName, setNewTerritoryName] = useState('')
  const [newBUName, setNewBUName] = useState('')
  const [editingTerritoryId, setEditingTerritoryId] = useState<string | null>(null)
  const [editingTerritoryName, setEditingTerritoryName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (editingTerritoryId) editInputRef.current?.focus()
  }, [editingTerritoryId])

  const patchUser = async (userId: string, data: Record<string, unknown>, label: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) { showToast(`${label} updated`, 'success'); router.refresh() }
    else showToast(`Failed to update ${label.toLowerCase()}`, 'error')
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
    const res = await fetch('/api/business-units', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBUName }),
    })
    if (res.ok) { showToast('Business unit created', 'success'); setNewBUName(''); router.refresh() }
    else showToast('Failed', 'error')
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
                <th>Company (AM)</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const role = u.role as UserRole
                const showBU = ['ISR', 'BU_MANAGER', 'BU_HEAD'].includes(role)
                const blurBU = role === 'TERRITORY_MANAGER'
                const showTerritory = ['ISR', 'BU_MANAGER', 'TERRITORY_MANAGER'].includes(role)
                const blurTerritory = role === 'BU_HEAD'
                const showCompany = role === 'ACCOUNT_MANAGER'

                // Companies not yet assigned to any AM, or assigned to this user
                const availableCompanies = companies.filter(
                  c => c.accountManagerId === null || c.accountManagerId === u.id
                )

                const assignCompany = async (companyId: string) => {
                  const res = await fetch(`/api/companies/${companyId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountManagerId: u.id }),
                  })
                  if (res.ok) { showToast('Company assigned', 'success'); router.refresh() }
                  else showToast('Failed to assign company', 'error')
                }

                const unassignCompany = async (companyId: string) => {
                  const res = await fetch(`/api/companies/${companyId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountManagerId: null }),
                  })
                  if (res.ok) { showToast('Company unassigned', 'success'); router.refresh() }
                  else showToast('Failed to unassign company', 'error')
                }

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
                      {showBU ? (
                        <select
                          value={u.buId ?? ''}
                          onChange={e => patchUser(u.id, { buId: e.target.value || null }, 'Business unit')}
                          style={selectStyle}
                        >
                          <option value="">— None —</option>
                          {businessUnits.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      ) : (
                        <span style={{ opacity: blurBU ? 0.35 : 1, fontSize: '13px', color: 'var(--color-text-3)' }}>
                          {blurBU ? '—' : ''}
                        </span>
                      )}
                    </td>
                    <td>
                      {showTerritory ? (
                        <select
                          value={u.territoryId ?? ''}
                          onChange={e => patchUser(u.id, { territoryId: e.target.value || null }, 'Territory')}
                          style={selectStyle}
                        >
                          <option value="">— None —</option>
                          {territories.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      ) : (
                        <span style={{ opacity: blurTerritory ? 0.35 : 1, fontSize: '13px', color: 'var(--color-text-3)' }}>
                          {blurTerritory ? '—' : ''}
                        </span>
                      )}
                    </td>
                    <td>
                      {showCompany ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', maxWidth: '260px' }}>
                          {u.managedCompanies.map(c => (
                            <span key={c.id} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                              background: 'var(--color-surface-2)', color: 'var(--color-text-2)',
                              border: '0.5px solid var(--color-border)',
                            }}>
                              {c.name}
                              <button
                                onClick={() => unassignCompany(c.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)', padding: '0', lineHeight: 1, fontSize: '12px' }}
                                title="Unassign"
                              >×</button>
                            </span>
                          ))}
                          {availableCompanies.filter(c => !u.managedCompanies.find(m => m.id === c.id)).length > 0 && (
                            <select
                              value=""
                              onChange={e => { if (e.target.value) assignCompany(e.target.value) }}
                              style={{ ...selectStyle, fontSize: '11px', maxWidth: '120px' }}
                            >
                              <option value="">+ Add</option>
                              {availableCompanies
                                .filter(c => !u.managedCompanies.find(m => m.id === c.id))
                                .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                              }
                            </select>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--color-text-3)' }}></span>
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
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <input value={newBUName} onChange={e => setNewBUName(e.target.value)} placeholder="New business unit name"
            style={{ maxWidth: '280px' }}
            onKeyDown={e => e.key === 'Enter' && createBU()}
          />
          <button className="btn-primary" onClick={createBU}>Create</button>
        </div>
        <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr><th>Name</th><th>BU Head</th><th>Total Members</th></tr>
            </thead>
            <tbody>
              {businessUnits.map(bu => (
                <tr key={bu.id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-1)' }}>{bu.name}</td>
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
                          <span style={{ fontSize: '13px', color: 'var(--color-danger)' }}>Delete "{t.name}"?</span>
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
    </Tabs.Root>
  )
}
