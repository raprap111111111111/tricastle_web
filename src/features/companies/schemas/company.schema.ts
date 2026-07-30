import { z } from 'zod'

export const companySchema = z.object({
  code: z
    .string({ required_error: 'Company code is required' })
    .min(2, 'Code must be at least 2 characters')
    .max(100, 'Code is too long'),

  name: z
    .string({ required_error: 'Company name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long'),

  name_japanese: z.string().max(255).nullable().optional(),

  category_id: z
    .number({ required_error: 'Category is required' })
    .int()
    .positive(),

  address:     z.string().max(1000).nullable().optional(),
  city:        z.string().max(100).nullable().optional(),
  prefecture:  z.string().max(100).nullable().optional(),
  postal_code: z.string().max(20).nullable().optional(),
  country:     z.string().max(100).nullable().optional().default('Japan'),

  contact_person: z.string().max(255).nullable().optional(),
  contact_email:  z.string().email('Invalid email').max(255).nullable().optional().or(z.literal('')),
  contact_phone:  z.string().max(50).nullable().optional(),

  description: z.string().max(5000).nullable().optional(),

  is_active: z.boolean().optional().default(true),
})

export type CompanyFormValues = z.infer<typeof companySchema>