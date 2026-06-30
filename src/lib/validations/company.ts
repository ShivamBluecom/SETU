import { z } from 'zod'

export const CreateCompanySchema = z.object({
  name:        z.string().min(1, 'Company name is required').max(200),
  industry:    z.string().min(1, 'Industry is required'),
  territoryId: z.string().min(1, 'Territory is required'),
  address:     z.string().min(1, 'Address is required'),
  userCount:   z.coerce.number({ invalid_type_error: 'User count is required' }).int().nonnegative(),
  website:     z.string().url('Enter a valid URL (include https://)'),
  gstNumber:   z.string().max(50).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
})

export const UpdateCompanySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().optional(),
  gstNumber: z.string().max(50).optional(),
  industry: z.string().optional(),
  userCount: z.coerce.number().int().nonnegative().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  website: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  territoryId: z.string().optional(),
})

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>
