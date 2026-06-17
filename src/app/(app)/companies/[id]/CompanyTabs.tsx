'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { ContactTable } from '@/components/contacts/ContactTable'
import { NewContactModal } from '@/components/contacts/NewContactModal'
import { OpportunityRow } from '@/components/opportunities/OpportunityRow'
import { OpportunityDrawer } from '@/components/opportunities/OpportunityDrawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { OpportunityWithRelations } from '@/types/api'
import type { Contact, Company } from '@prisma/client'

interface Props {
  contacts: Array<Contact & { company: Pick<Company, 'id' | 'name'> }>
  opportunities: OpportunityWithRelations[]
  companyId: string
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--color-text-1)' : 'var(--color-text-3)',
  borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
  background: 'none',
  border: 'none',
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderBottomColor: active ? 'var(--color-accent)' : 'transparent',
  cursor: 'pointer',
  outline: 'none',
})

export function CompanyTabs({ contacts, opportunities, companyId }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState('contacts')
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Tabs.Root value={tab} onValueChange={setTab}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '0.5px solid var(--color-border)', marginBottom: '20px',
        }}>
          <Tabs.List style={{ display: 'flex', gap: '0' }}>
            <Tabs.Trigger value="contacts" style={tabStyle(tab === 'contacts')}>
              Contacts ({contacts.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="opportunities" style={tabStyle(tab === 'opportunities')}>
              Opportunities ({opportunities.length})
            </Tabs.Trigger>
          </Tabs.List>

          {tab === 'contacts' && (
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 12px' }}
              onClick={() => setContactModalOpen(true)}
            >
              <Plus size={13} /> New Contact
            </button>
          )}
        </div>

        <Tabs.Content value="contacts">
          <ContactTable contacts={contacts} showCompany={false} />
        </Tabs.Content>

        <Tabs.Content value="opportunities">
          {opportunities.length === 0 ? (
            <EmptyState message="Opportunities will appear here." />
          ) : (
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
                  {opportunities.map(opp => (
                    <OpportunityRow
                      key={opp.id}
                      opportunity={opp}
                      onClick={() => { setSelectedOppId(opp.id); setDrawerOpen(true) }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>

      <NewContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        defaultCompanyId={companyId}
        onCreated={() => router.refresh()}
      />

      <OpportunityDrawer
        opportunityId={selectedOppId}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdated={() => router.refresh()}
      />
    </>
  )
}
