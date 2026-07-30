// src/features/documents/types/index.ts

export type DocumentStatus =
  | 'uploaded'
  | 'pending_verification'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'requires_correction'

export type DocumentPriority = 'low' | 'normal' | 'high' | 'urgent'

// ─── Document Type ─────────────────────────────────────────
export interface DocumentType {
  id:                  number
  name:                string
  code:                string
  description:         string | null
  required_fields:     string[] | null
  validation_rules:    Record<string, any> | null
  is_required:         boolean
  is_active:           boolean
  validity_days:       number | null
  expiry_warning_days: number
  category:            'primary' | 'supporting'
  sort_order:          number
  created_at:          string
  updated_at:          string
}

// ─── File Repository ───────────────────────────────────────
export interface FileRepositoryEntry {
  id:            number
  file_hash:     string
  file_path:     string
  original_name: string
  mime_type:     string
  file_size:     number
  uploaded_by:   number | null
  created_at:    string
}

// ─── Applicant (light shape returned as a relation) ────────
export interface ApplicantSummary {
  id:              number
  applicant_code:  string
  first_name:      string
  middle_name?:    string | null
  last_name:       string
  suffix?:         string | null
  email?:          string | null
}

// ─── Applicant Document (main entity) ──────────────────────
export interface ApplicantDocument {
  id:                 number
  applicant_id:       number
  document_type_id:   number
  file_repository_id: number | null

  // File info
  file_path:  string
  file_name:  string
  file_type:  string | null
  file_size:  number | null
  mime_type:  string | null
  file_hash:  string | null

  // OCR
  extracted_data: Record<string, any> | null
  validated_data: Record<string, any> | null
  ocr_confidence: number | null

  // Status
  status:          DocumentStatus
  document_date:   string | null
  expiry_date:     string | null
  is_expired:      boolean
  expiry_notified: boolean

  // Versioning
  version:            number
  is_current_version: boolean

  // Verification
  last_verified_at: string | null
  last_verified_by: number | null

  // Rejection
  rejection_reason: string | null
  rejected_by:      number | null
  rejected_at:      string | null

  // Meta
  uploaded_by: number | null
  metadata:    Record<string, any> | null
  notes:       string | null
  priority:    DocumentPriority

  created_at: string
  updated_at: string

  // Relations (whenLoaded)
  applicant?:     ApplicantSummary
  document_type?: DocumentType
  uploader?:      { id: number; name: string }
  verifier?:      { id: number; name: string }
  versions?:      DocumentVersion[]
}

// ─── Document Version ──────────────────────────────────────
export interface DocumentVersion {
  id:                    number
  applicant_document_id: number
  version_number:        number
  file_path:             string
  file_name:             string
  file_size:             number | null
  is_current:            boolean
  uploaded_by:           number | null
  created_at:            string
}

// ─── Filters ───────────────────────────────────────────────
export interface DocumentFilters {
  search:           string
  applicant_id:     number | null
  document_type_id: number | null
  status:           DocumentStatus | null
  priority:         DocumentPriority | null
  is_expired:       boolean | null
  offset:           number
  limit:            number
}

// ─── Payloads ──────────────────────────────────────────────
export interface CreateDocumentPayload {
  applicant_id:     number
  document_type_id: number
  file:             File
  document_date?:   string | null
  expiry_date?:     string | null
  priority?:        DocumentPriority
  notes?:           string | null
}

export interface UpdateDocumentPayload {
  document_type_id?: number
  document_date?:    string | null
  expiry_date?:      string | null
  status?:           DocumentStatus
  priority?:         DocumentPriority
  notes?:            string | null
  rejection_reason?: string | null
}

// ─── Pagination ────────────────────────────────────────────
export interface Pagination {
  page:  number
  limit: number
  total: number
}