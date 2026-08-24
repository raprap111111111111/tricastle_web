// src/shared/utils/ais/types.ts

export interface AISData {
  // Header
  position?:        string
  trade_test_try?:  string
  trade_test_date?: string
  applicant_code?:  string

  // Personal
  last_name?:          string
  first_name?:         string
  middle_name?:        string
  current_address?:    string
  contact_number?:     string
  blood_type?:         string
  english_percent?:    number
  date_of_birth?:      string
  birthplace?:         string
  age?:                number
  civil_status?:       string
  height_cm?:          number
  weight_kg?:          number
  number_of_children?: number
  religion?:           string
  dominant_hand?:      string

  // Lifestyle
  is_smoking?:         boolean
  smoking_frequency?:  string
  is_drinking?:        boolean
  drinking_frequency?: string

  // Family
  family_background_notes?: string[]
  spouse_name?:             string
  spouse_work?:             string
  spouse_salary?:           string

  // Education
  vocational?:        string
  high_school?:       string
  education_remarks?: string
  year_started?:      string
  year_ended?:        string

  // Work
  present_job_title?:       string
  present_job_role?:        string
  present_job_description?: string
  work_years?:              number
  work_months?:             number
  salary_amount?:           number | string  // 👈 FIXED: Allow string for formatted numbers
  salary_unit?:             string           // 👈 FIXED: Added missing salary_unit property
  overseas_duration_years?:  number
  overseas_duration_months?: number

  // Contacts in Japan
  marucon_name?:     string
  marucon_company?:  string
  marucon_relation?: string
  marucon_batch?:    string

  non_marucon_name?:     string
  non_marucon_contact?:  string
  non_marucon_company?:  string
  non_marucon_relation?: string

  // Footer
  trainee_signature?: string
  signature_date?:    string
  ais_by?:            string
  photo?:             string

  applicant_number?: string
  status_code?:      string
}

export type BulkAISMode = 'zip' | 'merged'

export interface BulkProgress {
  current:    number
  total:      number
  applicant?: string
}

/** Shared page layout constants used across all renderer widgets */
export interface AISLayout {
  pageW:    number
  marginL:  number
  marginR:  number
  contentW: number
  photoW:   number
  photoH:   number
  infoW:    number
  rightX:   number
}

export const DEFAULT_LAYOUT: AISLayout = {
  pageW:    210,
  marginL:  10,
  marginR:  10,
  contentW: 190,   // 210 - 10 - 10
  photoW:   32,
  photoH:   38,
  infoW:    154,   // 190 - 32 - 4
  rightX:   168,   // 10 + 154 + 4
}