import { z } from 'zod';

export const rejectVerificationSchema = z.object({
  rejection_reason: z
    .string()
    .min(5, 'Reason must be at least 5 characters')
    .max(1000),
  notes: z.string().max(1000).optional(),
});

export const completeVerificationSchema = z.object({
  verification_data: z.record(z.string(), z.any()),
  notes: z.string().max(1000).optional(),
});

export const resolveMismatchSchema = z.object({
  resolution_notes: z.string().min(3, 'Resolution notes required').max(1000),
  entered_value: z.string().optional(),
});

export const waiveMismatchSchema = z.object({
  resolution_notes: z.string().min(3, 'Justification required').max(1000),
});

export const escalateMismatchSchema = z.object({
  resolution_notes: z.string().min(3, 'Escalation reason required').max(1000),
});

export type RejectVerificationInput = z.infer<typeof rejectVerificationSchema>;
export type CompleteVerificationInput = z.infer<typeof completeVerificationSchema>;
export type ResolveMismatchInput = z.infer<typeof resolveMismatchSchema>;
export type WaiveMismatchInput = z.infer<typeof waiveMismatchSchema>;
export type EscalateMismatchInput = z.infer<typeof escalateMismatchSchema>;