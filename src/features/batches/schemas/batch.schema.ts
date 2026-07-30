import { z } from 'zod'

export const batchStatusSchema = z.enum([
  'draft',
  'ongoing',
  'deployed',
  'completed',
  'cancelled',
])

export const batchSchema = z.object({
  batch_number: z
    .number({ required_error: 'Batch number is required' })
    .int()
    .min(1, 'Batch number must be at least 1'),

  name: z
    .string({ required_error: 'Batch name is required' })
    .min(2, 'Batch name must be at least 2 characters')
    .max(255, 'Batch name is too long'),

  country: z.string().max(100).nullable().optional(),

  deployment_date: z.string().nullable().optional(),

  status: batchStatusSchema.optional(),

  is_active: z.boolean().optional().default(false),   // ← NEW

  description: z.string().max(5000).nullable().optional(),
})

export type BatchFormValues = z.infer<typeof batchSchema>