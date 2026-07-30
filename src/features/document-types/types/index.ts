// src/features/document-types/types/index.ts

export type DocumentTypeCategory = 'primary' | 'supporting'
export type OrderDir = 'asc' | 'desc'

export type DocumentTypeOrderBy =
  | 'id'
  | 'name'
  | 'code'
  | 'category'
  | 'sort_order'
  | 'validity_days'
  | 'created_at'
  | 'updated_at'

export interface DocumentType {
  id: number
  name: string
  code: string
  description: string | null
  required_fields: string[] | null
  validation_rules: Record<string, any> | null
  is_required: boolean
  is_active: boolean
  validity_days: number | null
  expiry_warning_days: number
  category: DocumentTypeCategory
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  documents_count?: number
}

// Matches GetAllDocumentTypeRequest exactly
export interface DocumentTypeFilters {
  search:        string
  offset:        number
  limit:         number
  order_by:      DocumentTypeOrderBy
  order_dir:     OrderDir
  category:      DocumentTypeCategory | null
  is_active:     boolean | null
  is_required:   boolean | null
  active_only:   boolean | null
  required_only: boolean | null
}

export interface CreateDocumentTypePayload {
  name:                string
  code:                string
  description?:        string | null
  required_fields?:    string[] | null
  validation_rules?:   Record<string, any> | null
  is_required?:        boolean
  is_active?:          boolean
  validity_days?:      number | null
  expiry_warning_days?: number
  category:            DocumentTypeCategory
  sort_order?:         number
}

export type UpdateDocumentTypePayload = Partial<CreateDocumentTypePayload>

/**
 * Offset-based pagination returned by the backend.
 * Matches whatever your API resource returns.
 */
export interface Pagination {
  total:    number
  offset:   number
  limit:    number
  has_more: boolean
  /** Derived helpers — populated by the store from offset/limit */
  current_page: number
  last_page:    number
  per_page:     number
  /** Convenience: 1-based index of first record on this page */
  from: number
  /** Convenience: 1-based index of last record on this page */
  to:   number
}