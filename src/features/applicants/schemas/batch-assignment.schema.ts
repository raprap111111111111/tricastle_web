import { z } from 'zod'

// ─── Batch Assignment Schema ──────────────────────────────

export const batchAssignmentSchema = z
  .object({
    batch_id: z
      .number({ invalid_type_error: 'Please select a batch' })
      .int()
      .positive()
      .nullable()
      .optional(),
    batch_status: z
      .enum([
        'applied',
        'shortlisted',
        'interview_scheduled',
        'interview_passed',
        'interview_failed',
        'medical_pending',
        'medical_passed',
        'medical_failed',
        'exam_pending',
        'exam_passed',
        'exam_failed',
        'accepted',
        'rejected',
        'withdrawn',
        'deployed',
      ])
      .nullable()
      .optional()
      .default('applied'),
  })
  .refine(
    (data) => !data.batch_id || (data.batch_id && data.batch_status),
    {
      message: 'Status is required when assigning a batch',
      path: ['batch_status'],
    },
  )

export type BatchAssignmentValues = z.infer<typeof batchAssignmentSchema>