import { z } from 'zod'

export const CreateContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  companyId: z.string().min(1, 'Company is required'),
  designation: z.string().min(1, 'Designation is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  personalEmail: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
  personalPhone: z.string().optional(),
  alternatePhone: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
})

export const UpdateContactSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  designation: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  personalEmail: z.string().email().optional().or(z.literal('')).transform(v => v || undefined),
  personalPhone: z.string().optional(),
  alternatePhone: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
})

export type CreateContactInput = z.infer<typeof CreateContactSchema>
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>
