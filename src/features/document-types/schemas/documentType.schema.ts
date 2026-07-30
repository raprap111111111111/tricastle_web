// src/features/document-types/schemas/documentType.schema.ts
import { z } from 'zod'

export const documentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase letters, numbers, or underscores only'),
  description: z.string().nullable().optional(),
  required_fields: z.array(z.string()).nullable().optional(),
  validation_rules: z.record(z.any()).nullable().optional(),
  is_required: z.boolean().default(true),
  is_active: z.boolean().default(true),
  validity_days: z.number().min(1).nullable().optional(),
  expiry_warning_days: z.number().min(0).default(30),
  category: z.enum(['primary', 'supporting']).default('primary'),
  sort_order: z.number().min(0).default(0),
})

export type DocumentTypeFormValues = z.infer<typeof documentTypeSchema>