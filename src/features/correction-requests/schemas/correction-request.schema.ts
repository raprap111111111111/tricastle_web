// src/features/correction-requests/schemas/correction-request.schema.ts

import { z } from 'zod'

export const createCorrectionRequestSchema = z.object({
  document_verification_id: z
    .number({ required_error: 'Document verification is required' })
    .positive(),
  applicant_document_id: z
    .number({ required_error: 'Applicant document is required' })
    .positive(),
  severity: z.enum(['low', 'moderate', 'critical']),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000),
  fields_to_correct: z.array(z.string()).optional(),
  correction_data: z.record(z.unknown()).optional(),
  justification: z.string().max(500).optional(),
  requires_approval: z.boolean().optional(),
  requires_new_document: z.boolean().optional(),
  due_date: z.string().optional(),
})

export const updateCorrectionRequestSchema = createCorrectionRequestSchema.partial()

export const approveSchema = z.object({
  notes: z.string().max(500).optional(),
})

export const rejectSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
})

export const completeSchema = z.object({
  notes: z.string().max(500).optional(),
})

export const cancelSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
})

export type CreateCorrectionRequestForm = z.infer<typeof createCorrectionRequestSchema>
export type RejectForm = z.infer<typeof rejectSchema>
export type CancelForm = z.infer<typeof cancelSchema>