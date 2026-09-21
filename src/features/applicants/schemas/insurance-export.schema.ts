import { z } from 'zod'

export const insuranceApplicantOverrideSchema = z.object({
  id: z.number(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  passport_number: z.string().min(1, 'Passport number is required'),
  occupation: z.string().min(1, 'Occupation / Trade is required'),
  foreign_employer: z.string().min(1, 'Foreign employer is required'),
  country_destination: z.string().min(1, 'Country destination is required'),
  contract_duration_months: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Contract duration must be a positive number',
    }),
})

export const insuranceExportPayloadSchema = z.object({
  departure_date: z.string().min(1, 'Departure date is required'),
  applicants: z
    .array(insuranceApplicantOverrideSchema)
    .min(1, 'At least one applicant must be selected'),
})

export type InsuranceExportPayloadInput = z.infer<typeof insuranceExportPayloadSchema>