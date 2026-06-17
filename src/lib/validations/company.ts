import { z } from 'zod'

export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  headOffice: z.string().optional(),
  territoryId: z.string().optional(),
})

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>
