import type {
  Opportunity,
  Company,
  Contact,
  User,
  BusinessUnit,
  Territory,
  Note,
  Notification,
} from '@prisma/client'
import type { UserRole, OpportunityStage } from '@/types/enums'

export type { UserRole, OpportunityStage }

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  role: UserRole
  buId: string | null
  territoryId: string | null
}

// Prisma returns `string` for stage/priority since SQL Server doesn't support enums.
// We use `string` here and rely on Zod validation at API boundaries.
export type OpportunityWithRelations = Omit<Opportunity, 'stage' | 'priority'> & {
  stage: string
  priority: string
  company: Pick<Company, 'id' | 'name' | 'industry'>
  primaryContact: Pick<Contact, 'id' | 'name' | 'designation' | 'email' | 'phone'> | null
  createdBy: Pick<User, 'id' | 'name' | 'email'>
  buOwner: Pick<User, 'id' | 'name' | 'email'> | null
  bu: Pick<BusinessUnit, 'id' | 'name'> | null
  territory: Pick<Territory, 'id' | 'name'> | null
  notes?: NoteWithAuthor[]
  shares?: Array<{ userId: string; user: { id: string; name: string; email: string } }>
  _count?: { shares: number }
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
}

export type KanbanColumn = {
  stage: string
  opportunities: OpportunityWithRelations[]
}
