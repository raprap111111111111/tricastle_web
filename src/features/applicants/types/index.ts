// ─── Enums / Literals ─────────────────────────────────────

export type ApplicantStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'incomplete'

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
  | 'applied'
  | 'shortlisted'
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

// ─── Shared / Relation Types ──────────────────────────────

export interface StaffRef {
  id: number
  name: string
}

// ─── Main Applicant ───────────────────────────────────────

export interface Applicant {
  id: number
  applicant_code: string

  // Personal
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

  // Physical
  height_cm: number | null
  weight_kg: number | null
  dominant_hand: DominantHand | null
  blood_type: BloodType | null

  // Address
  current_address: string | null
  permanent_address: string | null
  city: string | null
  province: string | null
  postal_code: string | null

  // Documents
  passport_number: string | null
  passport_expiry: string | null
  sss_number: string | null
  tin_number: string | null
  philhealth_number: string | null
  pagibig_number: string | null

  // Status
  status: ApplicantStatus
  quality_score: number
  quality_grade: QualityGrade

  // Staff (both id + relation object from backend)
  assigned_staff_id?: number | null
  assigned_staff?: StaffRef | null
  created_by?: number | null
  creator?: StaffRef | null

  // Timestamps
  created_at: string
  updated_at: string

  // Relations (loaded via whenLoaded on backend)
  lifestyle?: ApplicantLifestyle | null
  educations?: ApplicantEducation[]
  employments?: ApplicantEmployment[]
  tattoos?: ApplicantTattoo[]
  batches?: ApplicantBatch[]
}

// ─── Lifestyle ────────────────────────────────────────────

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

// ─── Education ────────────────────────────────────────────

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

// ─── Employment ───────────────────────────────────────────

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

// ─── Tattoo ───────────────────────────────────────────────

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

// ─── Applicant Batch ──────────────────────────────────────

export interface ApplicantBatch {
  id: number
  applicant_id: number
  batch_id: number
  status: ApplicantBatchStatus
  applied_at: string
  interview_date: string | null
  medical_date: string | null
  exam_date: string | null
  accepted_at: string | null
  deployed_at: string | null
  exam_score: number | null
  interview_notes: string | null
  medical_notes: string | null
  rejection_reason: string | null
  processed_by: number | null
  created_at: string
  updated_at: string
}

// ─── Batch Assignment (for create payload) ────────────────

export interface BatchAssignmentPayload {
  batch_id: number
  batch_status?: ApplicantBatchStatus
}


// ─── Create / Update Payloads ─────────────────────────────

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
  status?: ApplicantStatus
}

export type UpdateApplicantPayload = Partial<CreateApplicantPayload>

// ─── Lifestyle Payload ────────────────────────────────────

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

// ─── Education Payloads ───────────────────────────────────

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

export type UpdateEducationPayload = Partial<
  Omit<CreateEducationPayload, 'applicant_id'>
>

// ─── Employment Payloads ──────────────────────────────────

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

export type UpdateEmploymentPayload = Partial<
  Omit<CreateEmploymentPayload, 'applicant_id'>
>

// ─── Tattoo Payloads ─────────────────────────────────────

export interface CreateTattooPayload {
  applicant_id: number
  location: string
  size?: TattooSize | null
  description?: string | null
  photo_path?: string | null
  is_visible?: boolean
}

export type UpdateTattooPayload = Partial<
  Omit<CreateTattooPayload, 'applicant_id'>
>

// ─── Filters ──────────────────────────────────────────────

export interface ApplicantFilters {
  search?: string
  offset?: number
  limit?: number
  order_by?: string
  order_dir?: 'asc' | 'desc'
  status?: ApplicantStatus | ''
  assigned_staff_id?: number | null
}

// ─── Pagination ───────────────────────────────────────────

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

// Add these to your existing types file

// ─── Duplicate Detection ──────────────────────────────────

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

// ─── Address Cascade ──────────────────────────────────────

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