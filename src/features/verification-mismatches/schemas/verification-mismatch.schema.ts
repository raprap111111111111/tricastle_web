// src/features/verification-mismatches/schemas/verification-mismatch.schema.ts
import { z } from 'zod'

export const resolveSchema = z.object({
  resolution_notes: z
    .string()
    .min(10, 'Please provide detailed resolution notes (min 10 chars)')
    .max(1000),
})

export const waiveSchema = z.object({
  resolution_notes: z
    .string()
    .min(10, 'Please provide waiver justification (min 10 chars)')
    .max(1000),
})

export const escalateSchema = z.object({
  resolution_notes: z
    .string()
    .min(10, 'Please explain escalation reason (min 10 chars)')
    .max(1000),
})

export type ResolveInput = z.infer<typeof resolveSchema>
export type WaiveInput = z.infer<typeof waiveSchema>
export type EscalateInput = z.infer<typeof escalateSchema>