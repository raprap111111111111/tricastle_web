import { z } from 'zod'

// ─── Basic Info Schema ───────────────────────────────
export const basicInfoSchema = z.object({
  code: z
    .string()
    .min(1, 'Company code is required')
    .max(50, 'Max 50 characters'),
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Max 200 characters'),
  name_japanese: z.string().max(200).optional().nullable(),
  category_id: z
    .number({ required_error: 'Category is required' })
    .int()
    .positive('Please select a category'),
  is_active: z.boolean().default(true),
})

// ─── Address Schema (simple, free-text, no PSGC) ─────
export const addressSchema = z.object({
  country: z
    .string({ required_error: 'Country is required' })
    .min(1, 'Country is required')
    .max(100),

  address: z
    .string({ required_error: 'Street address is required' })
    .min(3, 'Street address is required')
    .max(500),

  city: z
    .string({ required_error: 'City is required' })
    .min(1, 'City is required')
    .max(100),

  prefecture: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .or(z.literal('')),

  postal_code: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .or(z.literal('')),
})

// ─── Contact Schema ──────────────────────────────────
export const contactSchema = z.object({
  contact_person: z.string().max(200).optional().nullable(),
  contact_email: z
    .string()
    .email('Invalid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  contact_phone: z.string().max(50).optional().nullable(),
})

// ─── Description Schema ──────────────────────────────
export const descriptionSchema = z.object({
  description: z.string().max(2000).optional().nullable(),
})

// ─── Types (inferred) ────────────────────────────────
export type BasicInfoFormValues   = z.infer<typeof basicInfoSchema>
export type AddressFormValues     = z.infer<typeof addressSchema>
export type ContactFormValues     = z.infer<typeof contactSchema>
export type DescriptionFormValues = z.infer<typeof descriptionSchema>