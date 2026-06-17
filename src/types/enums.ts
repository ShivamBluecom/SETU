// Application-level enum definitions. SQL Server does not support Prisma native enums,
// so these are stored as NVarChar(50) strings with application-layer validation.

export const UserRoleValues = [
  'ISR',
  'ACCOUNT_MANAGER',
  'BU_MANAGER',
  'BU_HEAD',
  'TERRITORY_MANAGER',
  'ADMIN',
] as const

export type UserRole = (typeof UserRoleValues)[number]

export const OpportunityStageValues = [
  'PROSPECTING',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
] as const

export type OpportunityStage = (typeof OpportunityStageValues)[number]

export const OpportunityPriorityValues = ['LOW', 'MEDIUM', 'HIGH'] as const

export type OpportunityPriority = (typeof OpportunityPriorityValues)[number]
