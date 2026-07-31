// src/features/document-versions/types/index.ts

export interface DocumentVersionUser {
  id:    number
  name:  string
  email: string
}

export interface DocumentVersion {
  id:                    number
  applicant_document_id: number
  version_number:        number
  file_path:             string
  file_name:             string
  file_size:             number | null
  mime_type:             string | null
  extracted_data:        Record<string, unknown> | null
  change_reason:         string | null
  uploaded_by:           number | null
  uploader:              DocumentVersionUser | null
  is_current:            boolean
  created_at:            string
  updated_at:            string

  // ✅ ADD THESE — optional because they only come from the global list endpoint
  applicant_name?:     string
  applicant_code?:     string
  document_type_name?: string
  document_type_id?:   number
}

export interface DocumentVersionListParams {
  applicant_document_id?: number
  uploaded_by?:           number
  page?:                  number
  per_page?:              number
  sort_by?:               'version_number' | 'created_at'
  sort_dir?:              'asc' | 'desc'
}

export interface DocumentVersionPagination {
  current_page:  number
  per_page:      number
  total:         number
  last_page:     number
  from:          number | null
  to:            number | null
}

export interface DocumentVersionListResponse {
  data:       DocumentVersion[]
  pagination: DocumentVersionPagination
}

export interface CreateVersionPayload {
  applicant_document_id: number
  file:                  File
  change_reason:         string
}

export interface SetCurrentVersionResponse {
  message: string
  version: DocumentVersion
}