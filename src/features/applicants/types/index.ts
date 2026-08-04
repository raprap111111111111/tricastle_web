// src/features/applicants/types/index.ts

// ─── Enums / Literals ─────────────────────────────────────────────────────────

export type ApplicantStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'incomplete'
  | 'final_list'
  | 'rejected'

export type ApplicantGender = 'male' | 'female'

export type CivilStatus =
  | 'single'
  | 'married'
  | 'widowed'
  | 'separated'
  | 'divorced'

export type DominantHand = 'left' | 'right' | 'both'
export type BloodType = 'A' | 'B' | 'AB' | 'O'
export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export type EducationLevel =
  | 'elementary'
  | 'high_school'
  | 'senior_high'
  | 'vocational'
  | 'college'
  | 'post_graduate'

export type EducationStatus = 'graduate' | 'undergraduate' | 'ongoing'
export type TattooSize = 'small' | 'medium' | 'large'

export type ApplicantBatchStatus =
  | 'assigned'
  | 'interview_scheduled'
  | 'interview_passed'
  | 'interview_failed'
  | 'medical_pending'
  | 'medical_passed'
  | 'medical_failed'
  | 'exam_pending'
  | 'exam_passed'
  | 'exam_failed'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'deployed'

// ─── Shared / Relation Types ──────────────────────────────────────────────────

export interface StaffRef {
  id: number
  full_name: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}

// ─── Batch Summary (minimal — for relations) ──────────────────────────────────

// src/features/applicants/types/index.ts

// ─── Batch Summary (minimal — for relations) ──────────────────────────────────

export interface BatchSummary {
  id: number
  batch_number?: string | number | null
  name: string
  country?: string | null
  status?: string | null
  is_active?: boolean
  applicant_count?: number   // ← ADD THIS LINE
}

// ─── Batch Option (for filter dropdowns) ──────────────────────────────────────

export interface BatchOption {
  id: number
  name: string
  batch_number: number | string
  country: string | null
  is_active: boolean
}

// ─── Applicant Batch (direct HasMany relation) ────────────────────────────────

export interface ApplicantBatch {
  id: number
  applicant_id: number
  batch_id: number
  status: ApplicantBatchStatus

  assigned_at: string | null
  interview_date: string | null
  medical_date: string | null
  exam_date: string | null
  accepted_at: string | null
  deployed_at: string | null

  exam_score: number | null
  interview_notes: string | null
  medical_notes: string | null
  rejection_reason: string | null
  remarks: string | null

  processed_by?: StaffRef | null
  batch?: BatchSummary | null

  created_at: string
  updated_at: string
}

// ─── Main Applicant ───────────────────────────────────────────────────────────

export interface Applicant {
  id: number
  applicant_code: string

  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  full_name?: string
  email: string
  phone: string | null
  mobile: string | null
  date_of_birth: string | null
  age?: number | null
  gender: ApplicantGender | null
  civil_status: CivilStatus | null
  number_of_children: number
  nationality: string | null

  height_cm: number | null
  weight_kg: number | null
  dominant_hand: DominantHand | null
  blood_type: BloodType | null

  current_address: string | null
  permanent_address: string | null
  city: string | null
  province: string | null
  postal_code: string | null

  passport_number: string | null
  passport_expiry: string | null
  sss_number: string | null
  tin_number: string | null
  philhealth_number: string | null
  pagibig_number: string | null

  status: ApplicantStatus
  rejection_reason: string | null
  final_listed_at: string | null
  rejected_at: string | null

  quality_score: number
  quality_grade: QualityGrade

  assigned_staff_id?: number | null
  assigned_staff?: StaffRef | null
  reviewed_by?: number | null
  reviewer?: StaffRef | null
  created_by?: number | null
  creator?: StaffRef | null

  created_at: string
  updated_at: string
  deleted_at?: string | null

  lifestyle?: ApplicantLifestyle | null
  educations?: ApplicantEducation[]
  employments?: ApplicantEmployment[]
  tattoos?: ApplicantTattoo[]
  applicant_batches?: ApplicantBatch[]
}

// ─── Lifestyle ────────────────────────────────────────────────────────────────

export interface ApplicantLifestyle {
  id: number
  applicant_id: number
  is_smoking: boolean
  is_drinking_alcohol: boolean
  is_using_drugs: boolean
  was_smoking: boolean
  was_drinking_alcohol: boolean
  was_using_drugs: boolean
  smoking_frequency: string | null
  drinking_frequency: string | null
  drugs_notes: string | null
  has_medical_condition: boolean
  medical_notes: string | null
  has_allergies: boolean
  allergies_notes: string | null
  created_at: string
  updated_at: string
}

// ─── Education ────────────────────────────────────────────────────────────────

export interface ApplicantEducation {
  id: number
  applicant_id: number
  education_level: EducationLevel
  education_status: EducationStatus
  school_name: string
  course: string | null
  year_started: number | null
  year_ended: number | null
  honors: string | null
  created_at: string
  updated_at: string
}

// ─── Employment ───────────────────────────────────────────────────────────────

export interface ApplicantEmployment {
  id: number
  applicant_id: number
  company_name: string
  position: string
  industry: string | null
  job_description: string | null
  date_started: string
  date_ended: string | null
  is_current: boolean
  country: string
  city: string | null
  salary: number | null
  salary_currency: string
  reason_for_leaving: string | null
  created_at: string
  updated_at: string
}

// ─── Tattoo ───────────────────────────────────────────────────────────────────

export interface ApplicantTattoo {
  id: number
  applicant_id: number
  location: string
  size: TattooSize | null
  description: string | null
  photo_path: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
}

// ─── Create / Update Payloads ─────────────────────────────────────────────────

export interface CreateApplicantPayload {
  first_name: string
  middle_name?: string | null
  last_name: string
  suffix?: string | null
  email: string
  phone?: string | null
  mobile?: string | null
  date_of_birth?: string | null
  gender?: ApplicantGender | null
  civil_status?: CivilStatus | null
  number_of_children?: number
  nationality?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  dominant_hand?: DominantHand | null
  blood_type?: BloodType | null
  current_address?: string | null
  permanent_address?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  passport_number?: string | null
  passport_expiry?: string | null
  sss_number?: string | null
  tin_number?: string | null
  philhealth_number?: string | null
  pagibig_number?: string | null
  assigned_staff_id?: number | null
}

export interface UpdateApplicantPayload extends Partial<CreateApplicantPayload> {
  status?: ApplicantStatus
  rejection_reason?: string | null
  quality_score?: number
  quality_grade?: QualityGrade
  assigned_staff_id?: number | null
}

// ─── Sub-resource Payloads ────────────────────────────────────────────────────

export interface UpsertLifestylePayload {
  applicant_id: number
  is_smoking?: boolean
  is_drinking_alcohol?: boolean
  is_using_drugs?: boolean
  was_smoking?: boolean
  was_drinking_alcohol?: boolean
  was_using_drugs?: boolean
  smoking_frequency?: string | null
  drinking_frequency?: string | null
  drugs_notes?: string | null
  has_medical_condition?: boolean
  medical_notes?: string | null
  has_allergies?: boolean
  allergies_notes?: string | null
}

export interface CreateEducationPayload {
  applicant_id: number
  education_level: EducationLevel
  education_status?: EducationStatus
  school_name: string
  course?: string | null
  year_started?: number | null
  year_ended?: number | null
  honors?: string | null
}

export type UpdateEducationPayload = Partial<Omit<CreateEducationPayload, 'applicant_id'>>

export interface CreateEmploymentPayload {
  applicant_id: number
  company_name: string
  position: string
  industry?: string | null
  job_description?: string | null
  date_started: string
  date_ended?: string | null
  is_current?: boolean
  country?: string
  city?: string | null
  salary?: number | null
  salary_currency?: string
  reason_for_leaving?: string | null
}

export type UpdateEmploymentPayload = Partial<Omit<CreateEmploymentPayload, 'applicant_id'>>

export interface CreateTattooPayload {
  applicant_id: number
  location: string
  size?: TattooSize | null
  description?: string | null
  photo_path?: string | null
  is_visible?: boolean
}

export type UpdateTattooPayload = Partial<Omit<CreateTattooPayload, 'applicant_id'>>

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface ApplicantFilters {
  search?: string
  offset?: number
  limit?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'
  status?: ApplicantStatus | ''
  exclude_statuses?: string
  gender?: ApplicantGender | ''
  civil_status?: CivilStatus | ''
  nationality?: string
  quality_grade?: QualityGrade | ''
  assigned_staff_id?: number | null
  batch_id?: number | null           // ← added for batch filtering
  passport_expiring_within_months?: number | null
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  offset: number
  limit: number
  has_more: boolean
  from?: number | null
  to?: number | null
}

export interface PaginatedResponse<T> {
  records: T[]
  total: number
  offset: number
  limit: number
  current_page: number
  last_page: number
  per_page: number
  has_more: boolean
}

export type PaginatedApplicants = PaginatedResponse<Applicant>

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────

export type DuplicateType =
  | 'email'
  | 'passport'
  | 'name_in_batch'
  | 'similar_person'

export type DuplicateSeverity = 'block' | 'warn'

export interface DuplicateMatch {
  id: number
  applicant_code: string
  full_name: string
  email: string
  created_at: string
}

export interface DuplicateItem {
  type: DuplicateType
  severity: DuplicateSeverity
  message: string
  applicant: DuplicateMatch
}

export interface DuplicateCheckResult {
  has_duplicates: boolean
  has_blockers: boolean
  duplicates: DuplicateItem[]
}

export interface DuplicateCheckPayload {
  email?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  date_of_birth?: string
  passport_number?: string
  batch_id?: number
  exclude_id?: number
}

// ─── Address Cascade ──────────────────────────────────────────────────────────

export interface PsgcRegion {
  code: string
  name: string
  regionName: string
}

export interface PsgcProvince {
  code: string
  name: string
  regionCode: string
}

export interface PsgcCity {
  code: string
  name: string
  provinceCode: string
  isCity?: boolean
  isMunicipality?: boolean
}

export interface PsgcBarangay {
  code: string
  name: string
  cityCode: string
}

// ─── Final List Folder Grouping ───────────────────────────────────────────────

export interface FinalListFolder {
  key: string
  label: string
  year: number
  month?: number
  day?: number
  count: number
  applicants: Applicant[]
  latest_date: string
}

export type FinalListGroupBy = 'day' | 'week' | 'month' | 'year'

export interface FinalListStats {
  total: number
  this_month: number
  this_week: number
  today: number
  ready_for_batch: number
}