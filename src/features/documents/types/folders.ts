// src/features/documents/types/folders.ts
import type { DocumentStatus, DocumentPriority } from './index'

// ─── Level 1 — Batch ───────────────────────────────────────────────────────
export interface DocumentBatch {
  id:                          number
  name:                        string
  code:                        string
  applicants_with_docs_count:  number
  has_pending:                 boolean
  created_at:                  string | null
}

// ─── Level 2 — Light summary (folders grid) ───────────────────────────────
export interface ApplicantFolderSummary {
  applicant_id:    number
  applicant_code:  string
  applicant_name:  string
  applicant_email: string | null
  total_types:     number
  total_documents: number
  has_pending:     boolean
  latest_upload:   string | null   // ← was missing
}

// ─── Level 3 — Full detail (folder detail page) ───────────────────────────
export interface FolderVersion {
  id:            number
  version:       number
  file_name:     string
  file_size:     number | null
  mime_type:     string | null
  status:        DocumentStatus
  priority:      DocumentPriority
  document_date: string | null
  expiry_date:   string | null
  is_expired:    boolean
  is_current:    boolean
  uploaded_at:   string
}

export interface DocumentGroup {
  document_type_id:   number
  document_type_name: string
  document_type_code: string
  total_versions:     number
  latest_status:      DocumentStatus
  latest_version:     number
  versions:           FolderVersion[]
}

export interface ApplicantFolder extends ApplicantFolderSummary {
  groups: DocumentGroup[]
}

// ─── Filters ──────────────────────────────────────────────────────────────
export interface FolderFilters {
  batch_id: number | null    // ← was missing
  search:   string
  offset:   number
  limit:    number
}

// ─── Pagination ───────────────────────────────────────────────────────────
export interface FolderPagination {
  total:        number
  offset:       number
  limit:        number
  current_page: number
  last_page:    number
  per_page:     number
  has_more:     boolean
  from:         number
  to:           number
}