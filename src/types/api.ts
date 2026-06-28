import type {
  Opportunity,
  Company,
  Contact,
  User,
  BusinessUnit,
  Territory,
  Note,
  Notification,
  LineItem,
  ServiceAddon,
  OpportunityPoc,
} from '@prisma/client'
import type { UserRole, OpportunityStage } from '@/types/enums'

export type { UserRole, OpportunityStage }

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  role: UserRole
  buId: string | null          // BU_HEAD only (scalar single assignment)
  territoryId: string | null   // TERRITORY_MANAGER only (scalar single assignment)
  buIds: string[]              // ISR, BU_MANAGER (multi-BU via junction table)
  territoryIds: string[]       // ACCOUNT_MANAGER (multi-territory via junction table)
}

export type OpportunityWithRelations = Omit<Opportunity, 'stage' | 'priority'> & {
  stage: string
  priority: string
  status: string
  company: Pick<Company, 'id' | 'name' | 'industry'>
  primaryContact: Pick<Contact, 'id' | 'name' | 'designation' | 'email' | 'phone'> | null
  createdBy: Pick<User, 'id' | 'name' | 'email'>
  territory: Pick<Territory, 'id' | 'name'> | null
  notes?: NoteWithAuthor[]
  pocs?: Array<{ userId: string; user: { id: string; name: string; email: string } }>
  lineItems?: LineItemWithRelations[]
  serviceAddons?: ServiceAddon[]
  additionalContacts?: Array<{ contactId: string; contact: { id: string; name: string; designation: string | null; email: string | null } }>
  _count?: { pocs: number }
}

export type LineItemWithRelations = LineItem & {
  bu: Pick<BusinessUnit, 'id' | 'name'> & { buType?: string | null; members?: Array<{ id: string; name: string }> }
  buOwner: Pick<User, 'id' | 'name' | 'email'> | null
}

export type NoteWithAuthor = Note & {
  author: Pick<User, 'id' | 'name'>
}

export type CompanyWithCounts = Company & {
  territory: Pick<Territory, 'id' | 'name'> | null
  _count: { opportunities: number; contacts: number }
  openOpportunities?: number
  pipelineValue?: number
}

export type NotificationWithOpportunity = Notification & {
  opportunity: Opportunity & {
    company: Pick<Company, 'id' | 'name'>
  }
}

export type UserWithRelations = User & {
  bu: Pick<BusinessUnit, 'id' | 'name'> | null
  territory: Pick<Territory, 'id' | 'name'> | null
  assignedBUs: Array<{ buId: string; bu: Pick<BusinessUnit, 'id' | 'name'> }>
  assignedTerritories: Array<{ territoryId: string; territory: Pick<Territory, 'id' | 'name'> }>
}

export type KanbanColumn = {
  stage: string
  opportunities: OpportunityWithRelations[]
}
