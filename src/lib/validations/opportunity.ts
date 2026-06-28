import { z } from 'zod'
import { OpportunityStageValues, OpportunityPriorityValues } from '@/types/enums'

export const CreateOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  closeDate: z.string().optional().transform(v => v || undefined),
  stage: z.enum(OpportunityStageValues).default('PROSPECTING'),
  priority: z.enum(OpportunityPriorityValues).default('MEDIUM'),
  status: z.enum(['DRAFT', 'CREATED']).default('DRAFT'),
  companyId: z.string().min(1, 'Company is required'),
  primaryContactId: z.string().optional(),
  territoryId: z.string().optional(),
})

export const UpdateOpportunitySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  closeDate: z.string().optional().transform(v => v || undefined),
  stage: z.enum(OpportunityStageValues).optional(),
  priority: z.enum(OpportunityPriorityValues).optional(),
  status: z.enum(['DRAFT', 'CREATED']).optional(),
  primaryContactId: z.string().nullable().optional(),
  territoryId: z.string().nullable().optional(),
  orderIndex: z.number().int().optional(),
})

export const CreateLineItemSchema = z.object({
  buId: z.string().min(1, 'BU is required'),
  quantity: z.coerce.number().positive().nullable().optional(),
  unitPrice: z.coerce.number().nonnegative().nullable().optional(),
  totalValue: z.coerce.number().nonnegative().default(0),
  details: z.string().optional(), // JSON string of BU-specific fields
})

export const UpdateLineItemSchema = z.object({
  buOwnerId: z.string().nullable().optional(),
  quantity: z.coerce.number().positive().nullable().optional(),
  unitPrice: z.coerce.number().nonnegative().nullable().optional(),
  totalValue: z.coerce.number().nonnegative().optional(),
  details: z.string().optional(),
})

export const CreateServiceAddonSchema = z.object({
  type: z.enum(['MANAGED', 'IMPLEMENTATION']),
  description: z.string().optional(),
  value: z.coerce.number().nonnegative().default(0),
})

export const UpdateServiceAddonSchema = z.object({
  description: z.string().optional(),
  value: z.coerce.number().nonnegative().optional(),
})

export type CreateOpportunityInput = z.infer<typeof CreateOpportunitySchema>
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunitySchema>
export type CreateLineItemInput = z.infer<typeof CreateLineItemSchema>
export type UpdateLineItemInput = z.infer<typeof UpdateLineItemSchema>
export type CreateServiceAddonInput = z.infer<typeof CreateServiceAddonSchema>
