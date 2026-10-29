// src/features/profile-updates/types/index.ts

export type ProfileUpdateStatus = 'pending' | 'approved' | 'declined'

export interface ProfileUpdateReviewer {
  id: number
  name?: string
  full_name?: string
  first_name?: string
  last_name?: string
}

export interface ProfileUpdateApplicant {
  id: number
  first_name?: string
  middle_name?: string
  last_name?: string
  full_name?: string
  applicant_code?: string
  city?: string
  province?: string
  mobile?: string
  passport_number?: string
  status?: string
}

export interface ProfileUpdate {
  id: number
  applicant_id: number
  applicant_code?: string | null
  applicant_name?: string | null
  reviewer_name?: string | null
  proposed_payload: Record<string, any>
  current_applicant_data?: Record<string, any> | null
  status: ProfileUpdateStatus
  decline_reason?: string | null
  reviewed_by?: number | null
  reviewed_at?: string | null
  reviewer?: ProfileUpdateReviewer | null
  applicant?: ProfileUpdateApplicant | null
  created_at: string
  updated_at?: string
}

export interface ProfileUpdateFilters {
  status?: ProfileUpdateStatus | ''
  search?: string
  page?: number
  limit?: number
  offset?: number
}

// Supports both BaseRepository response ({ records, total, ... }) and standard Laravel Resource ({ data, meta })
export interface PaginatedProfileUpdates {
  records?: ProfileUpdate[]
  data?: ProfileUpdate[]
  total?: number
  current_page?: number
  last_page?: number
  per_page?: number
  limit?: number
  offset?: number
  has_more?: boolean
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}