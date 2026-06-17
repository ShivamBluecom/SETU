import { z } from 'zod'
import { OpportunityStageValues, OpportunityPriorityValues } from '@/types/enums'

export const CreateOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  value: z.coerce.number().nonnegative().default(0),
  currency: z.string().default('INR'),
  closeDate: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  stage: z.enum(OpportunityStageValues).default('PROSPECTING'),
  priority: z.enum(OpportunityPriorityValues).default('MEDIUM'),
  productService: z.string().optional(),
  companyId: z.string().min(1, 'Company is required'),
  primaryContactId: z.string().optional(),
  buId: z.string().optional(),
  buOwnerId: z.string().optional(),
  territoryId: z.string().optional(),
})

export const UpdateOpportunitySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  value: z.coerce.number().nonnegative().optional(),
  closeDate: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  stage: z.enum(OpportunityStageValues).optional(),
  priority: z.enum(OpportunityPriorityValues).optional(),
  productService: z.string().optional(),
  primaryContactId: z.string().optional(),
  buId: z.string().optional(),
  buOwnerId: z.string().optional(),
  territoryId: z.string().optional(),
  orderIndex: z.number().int().optional(),
})

export type CreateOpportunityInput = z.infer<typeof CreateOpportunitySchema>
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunitySchema>
