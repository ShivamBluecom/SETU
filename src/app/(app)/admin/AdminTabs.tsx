'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'
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
  }>
  businessUnits: Array<{
    id: string; name: string;
    territory: { id: string; name: string } | null;
    head: { id: string; name: string; email: string } | null;
    _count: { members: number };
  }>
  territories: Array<{
    id: string; name: string;
    _count: { businessUnits: number; users: number; opportunities: number };
  }>
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

export function AdminTabs({ users, businessUnits, territories }: AdminTabsProps) {
  const [tab, setTab] = useState('users')
  const [newTerritoryName, setNewTerritoryName] = useState('')
  const [newBUName, setNewBUName] = useState('')
  const { showToast } = useToast()
  const router = useRouter()

  const updateUserRole = async (userId: string, role: UserRole) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (res.ok) { showToast('Role updated', 'success'); router.refresh() }
    else showToast('Failed to update role', 'error')
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
              <tr><th>User</th><th>Email</th><th>Role</th><th>Business Unit</th><th>Territory</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar name={u.name} size="sm" />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-1)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={e => updateUserRole(u.id, e.target.value as UserRole)}
                      style={{ fontSize: '13px', padding: '4px 8px', maxWidth: '160px' }}
                    >
                      {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td>{u.bu?.name ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                  <td>{u.territory?.name ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tabs.Content>

      <Tabs.Content value="business-units">
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <input value={newBUName} onChange={e => setNewBUName(e.target.value)} placeholder="New business unit name" style={{ maxWidth: '280px' }} />
          <button className="btn-primary" onClick={createBU}>Create</button>
        </div>
        <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Territory</th><th>BU Head</th><th>Members</th></tr>
            </thead>
            <tbody>
              {businessUnits.map(bu => (
                <tr key={bu.id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-1)' }}>{bu.name}</td>
                  <td>{bu.territory?.name ?? <span style={{ color: 'var(--color-text-3)' }}>—</span>}</td>
                  <td>
                    {bu.head ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Avatar name={bu.head.name} size="sm" />
                        <span style={{ fontSize: '13px' }}>{bu.head.name}</span>
                      </div>
                    ) : <span style={{ color: 'var(--color-text-3)' }}>—</span>}
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
          <input value={newTerritoryName} onChange={e => setNewTerritoryName(e.target.value)} placeholder="New territory name" style={{ maxWidth: '280px' }} />
          <button className="btn-primary" onClick={createTerritory}>Create</button>
        </div>
        <div style={{ border: '0.5px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr><th>Territory</th><th>Business Units</th><th>Users</th><th>Opportunities</th></tr>
            </thead>
            <tbody>
              {territories.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-1)' }}>{t.name}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{t._count.businessUnits}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{t._count.users}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{t._count.opportunities}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  )
}
