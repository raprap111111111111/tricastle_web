import { z } from 'zod'

export const companyCategorySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name is too long'),

  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9-]+$/i, 'Slug can only contain letters, numbers, and hyphens')
    .nullable()
    .optional(),

  description: z.string().max(5000).nullable().optional(),

  is_active: z.boolean().optional().default(true),
})

export type CompanyCategoryFormValues = z.infer<typeof companyCategorySchema>