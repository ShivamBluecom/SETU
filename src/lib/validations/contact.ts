import { z } from 'zod'

export const CreateContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  companyId: z.string().min(1, 'Company is required'),
  designation: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
  phone: z.string().optional(),
})

export type CreateContactInput = z.infer<typeof CreateContactSchema>
