// src/features/applicants/schemas/applicant.schema.ts

import { z } from 'zod'

// ─── Shared helpers ────────────────────────────────────────────────────────────

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
  .nullable()
  .optional()

// ─── Step 1: Personal ─────────────────────────────────────────────────────────

export const personalSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  middle_name: z.string().max(100).nullable().optional(),
  last_name: z.string().min(1, 'Last name is required').max(100),
  suffix: z.string().max(20).nullable().optional(),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  phone: z.string().max(20).nullable().optional().or(z.literal('')),
  mobile: z.string().max(20).nullable().optional().or(z.literal('')),
  date_of_birth: dateString,
  birthplace: z.string().max(150).nullable().optional(),           // AIS
  gender: z.enum(['male', 'female']).nullable().optional(),
  civil_status: z
    .enum(['single', 'married', 'widowed', 'separated', 'divorced'])
    .nullable()
    .optional(),
  religion: z.string().max(100).nullable().optional(),             // AIS
  number_of_children: z.coerce.number().int().min(0).default(0),
  nationality: z.string().max(100).nullable().optional(),
  english_proficiency_pct: z.coerce.number().int().min(0).max(100).default(0), // AIS

  // AIS Trade header (shown on print sheet)
  applied_position: z.string().max(100).nullable().optional(),     // AIS e.g. Steelman
  trade_test_try:   z.string().max(20).nullable().optional(),      // AIS e.g. 1st
  trade_test_date:  dateString,                                    // AIS
})

// ─── Step 2: Physical & Address ───────────────────────────────────────────────

export const physicalAddressSchema = z.object({
  height_cm:         z.coerce.number().positive().max(300).nullable().optional(),
  weight_kg:         z.coerce.number().positive().max(500).nullable().optional(),
  dominant_hand:     z.enum(['left', 'right', 'both']).nullable().optional(),
  blood_type:        z.enum(['A', 'B', 'AB', 'O']).nullable().optional(),
  current_address:   z.string().max(500).nullable().optional(),
  permanent_address: z.string().max(500).nullable().optional(),
  city:              z.string().max(100).nullable().optional(),
  province:          z.string().max(100).nullable().optional(),
  postal_code:       z.string().max(20).nullable().optional(),
})

// ─── Step 3: Documents ────────────────────────────────────────────────────────

export const documentsSchema = z.object({
  passport_number:   z.string().max(50).nullable().optional(),
  passport_expiry:   dateString,
  sss_number:        z.string().max(50).nullable().optional(),
  tin_number:        z.string().max(50).nullable().optional(),
  philhealth_number: z.string().max(50).nullable().optional(),
  pagibig_number:    z.string().max(50).nullable().optional(),

  id_photo_file: z.instanceof(File).nullable().optional(),
  biodata_file:  z.instanceof(File).nullable().optional(),
  biodata_notes: z.string().max(500).nullable().optional(),
})

// ─── Japan contact entry (AIS) ────────────────────────────────────────────────

export const japanContactEntrySchema = z.object({
  affiliation_type: z.enum(['marucon', 'non_marucon']),
  name:             z.string().max(150).default(''),
  batch_no:         z.string().max(50).nullable().optional(),
  company_name:     z.string().max(150).nullable().optional(),
  relation:         z.string().max(100).nullable().optional(),
  contact_number:   z.string().max(30).nullable().optional(),
})

// ─── Step 4: Japan Deployment Profile ─────────────────────────────────────────

export const deploymentSchema = z.object({
  skill_category: z
    .enum(['skilled', 'semi_skilled', 'unskilled'])
    .nullable()
    .optional(),
  trade_or_occupation: z.string().max(100).nullable().optional(),

  understands_basic_english: z.boolean().default(false),
  jlpt_level: z
    .enum(['N5', 'N4', 'N3', 'N2', 'N1'])
    .nullable()
    .optional(),

  willing_to_be_deployed:  z.boolean().default(false),
  preferred_work_location: z.string().max(100).nullable().optional(),

  previous_japan_experience: z.boolean().default(false),
  years_japan_experience:    z.coerce.number().int().min(0).max(50).default(0),

  has_titp_certificate: z.boolean().default(false),
  titp_occupation:      z.string().max(100).nullable().optional(),

  expected_salary:          z.coerce.number().min(0).nullable().optional(),
  expected_salary_currency: z.string().length(3).default('JPY'),
  current_salary:           z.coerce.number().min(0).nullable().optional(),
  current_salary_currency:  z.string().length(3).default('PHP'),

  // Japan Contacts (AIS)
  japan_contacts: z.array(japanContactEntrySchema).default([]),
})

// ─── Step 5: Family Background ────────────────────────────────────────────────

export const familySchema = z.object({
  // ─── AIS Family Background Sentences ────────────────────────────────
  living_situation:     z.string().max(500).nullable().optional(),                    // AIS
  birth_order:          z.coerce.number().int().min(1).max(20).nullable().optional(), // AIS
  siblings_count:       z.coerce.number().int().min(0).max(30).nullable().optional(), // AIS
  siblings_description: z.string().max(100).nullable().optional(),                    // AIS

  // Family — Father
  father_name:       z.string().max(150).nullable().optional(),
  father_occupation: z.string().max(100).nullable().optional(),
  father_contact:    z.string().max(30).nullable().optional(),

  // Family — Mother
  mother_name:       z.string().max(150).nullable().optional(),
  mother_occupation: z.string().max(100).nullable().optional(),
  mother_contact:    z.string().max(30).nullable().optional(),

  // Family — Spouse (+ AIS salary)
  spouse_name:        z.string().max(150).nullable().optional(),
  spouse_occupation:  z.string().max(100).nullable().optional(),
  spouse_contact:     z.string().max(30).nullable().optional(),
  spouse_salary:      z.coerce.number().min(0).nullable().optional(),                    // AIS
  spouse_salary_unit: z.enum(['per_day', 'per_month', 'per_year']).nullable().optional(),// AIS

  // Emergency Contact
  emergency_contact_name:         z.string().max(150).nullable().optional(),
  emergency_contact_relationship: z.string().max(60).nullable().optional(),
  emergency_contact_phone:        z.string().max(30).nullable().optional(),
  emergency_contact_address:      z.string().max(500).nullable().optional(),
})

// ─── Step 6: Lifestyle ────────────────────────────────────────────────────────

export const lifestyleSchema = z.object({
  is_smoking:           z.boolean().default(false),
  is_drinking_alcohol:  z.boolean().default(false),
  is_using_drugs:       z.boolean().default(false),
  was_smoking:          z.boolean().default(false),
  was_drinking_alcohol: z.boolean().default(false),
  was_using_drugs:      z.boolean().default(false),
  smoking_frequency:    z.string().max(100).nullable().optional(),
  drinking_frequency:   z.string().max(100).nullable().optional(),
  drugs_notes:          z.string().max(500).nullable().optional(),
  has_medical_condition: z.boolean().default(false),
  medical_notes:         z.string().max(500).nullable().optional(),
  has_allergies:         z.boolean().default(false),
  allergies_notes:       z.string().max(500).nullable().optional(),
})

// ─── Step 7: Education ────────────────────────────────────────────────────────

export const educationEntrySchema = z.object({
  id: z.number().optional(),
  education_level: z.enum([
    'elementary',
    'high_school',
    'senior_high',
    'vocational',
    'college',
    'post_graduate',
  ]),
  education_status: z
    .enum(['graduate', 'undergraduate', 'ongoing'])
    .default('graduate'),
  school_name:  z.string().min(1, 'School name is required').max(200),
  course:       z.string().max(200).nullable().optional(),
  year_started: z.coerce.number().int().min(1950).max(2100).nullable().optional(),
  year_ended:   z.coerce.number().int().min(1950).max(2100).nullable().optional(),
  honors:       z.string().max(200).nullable().optional(),
  remarks:      z.string().max(500).nullable().optional(), // AIS
})

export const educationSchema = z.object({
  educations: z.array(educationEntrySchema).default([]),
})

// ─── Step 8: Employment ───────────────────────────────────────────────────────

export const employmentEntrySchema = z.object({
  id:              z.number().optional(),
  company_name:    z.string().min(1, 'Company name is required').max(200),
  position:        z.string().min(1, 'Position is required').max(200),
  industry:        z.string().max(100).nullable().optional(),
  job_description: z.string().max(1000).nullable().optional(),
  date_started:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required'),
  date_ended: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .nullable()
    .optional(),
  is_current:         z.boolean().default(false),
  country:            z.string().max(100).default('Philippines'),
  city:               z.string().max(100).nullable().optional(),
  is_overseas:        z.boolean().default(false),                          // AIS
  salary:             z.coerce.number().min(0).nullable().optional(),
  salary_currency:    z.string().max(3).default('PHP'),
  salary_unit:        z.enum(['per_day', 'per_month', 'per_year']).nullable().optional(), // AIS
  reason_for_leaving: z.string().max(500).nullable().optional(),
})

export const employmentSchema = z.object({
  employments: z.array(employmentEntrySchema).default([]),
})

// ─── Step 9: Tattoos ──────────────────────────────────────────────────────────

export const tattooEntrySchema = z.object({
  id:          z.number().optional(),
  location:    z.string().min(1, 'Location is required').max(100),
  size:        z.enum(['small', 'medium', 'large']).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  photo_path:  z.string().nullable().optional(),
  is_visible:  z.boolean().default(true),
})

export const tattooSchema = z.object({
  tattoos: z.array(tattooEntrySchema).default([]),
})

// ─── Legacy: Batch Assignment ─────────────────────────────────────────────────

export const batchAssignmentSchema = z.object({
  batch_id: z.number().int().positive().nullable().optional(),
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
    .optional(),
})

// ─── Combined Full Schema ─────────────────────────────────────────────────────

export const fullApplicantSchema = personalSchema
  .merge(physicalAddressSchema)
  .merge(documentsSchema)
  .merge(deploymentSchema)
  .merge(familySchema)

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type PersonalFormValues        = z.infer<typeof personalSchema>
export type PhysicalAddressFormValues = z.infer<typeof physicalAddressSchema>
export type DocumentsFormValues       = z.infer<typeof documentsSchema>
export type DeploymentFormValues      = z.infer<typeof deploymentSchema>
export type FamilyFormValues          = z.infer<typeof familySchema>
export type LifestyleFormValues       = z.infer<typeof lifestyleSchema>
export type EducationEntryValues      = z.infer<typeof educationEntrySchema>
export type EducationFormValues       = z.infer<typeof educationSchema>
export type EmploymentEntryValues     = z.infer<typeof employmentEntrySchema>
export type EmploymentFormValues      = z.infer<typeof employmentSchema>
export type TattooEntryValues         = z.infer<typeof tattooEntrySchema>
export type TattooFormValues          = z.infer<typeof tattooSchema>
export type BatchAssignmentValues     = z.infer<typeof batchAssignmentSchema>
export type FullApplicantFormValues   = z.infer<typeof fullApplicantSchema>
export type JapanContactEntryValues   = z.infer<typeof japanContactEntrySchema>