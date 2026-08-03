// src/features/file-repository/types/index.ts

export interface FileRepository {
  id: number
  file_hash: string
  file_path: string
  original_name: string
  mime_type: string
  file_size: number
  disk: 'local' | 's3' | 'public'
  storage_driver: string
  reference_count: number
  metadata: Record<string, any> | null
  is_encrypted: boolean
  uploaded_by: number | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  uploader?: { id: number; name: string } | null
}

export interface FileRepositoryFilters {
  search?: string
  disk?: string | null
  mime_type?: string | null
  is_encrypted?: boolean | null
  uploaded_by?: number | null
  unused_only?: boolean | null
  encrypted_only?: boolean | null
  min_size?: number | null
  max_size?: number | null
  offset: number
  limit: number
  order_by?: string
  order_dir?: 'asc' | 'desc'
}

export interface Pagination {
  total: number
  offset: number
  limit: number
  per_page: number
  current_page: number
  last_page: number
  from?: number
  to?: number
}

export interface FileRepositoryListResponse {
  records: FileRepository[]
  total: number
  offset: number
  limit: number
  current_page: number
  last_page: number
  per_page: number
}

export type DiskType = 'local' | 's3' | 'public'

export const DISK_OPTIONS: { label: string; value: DiskType }[] = [
  { label: 'Local', value: 'local' },
  { label: 'S3', value: 's3' },
  { label: 'Public', value: 'public' },
]

export const MIME_PRESETS: { label: string; value: string }[] = [
  { label: 'PDF', value: 'application/pdf' },
  { label: 'Images', value: 'image/' },
  { label: 'Word (.docx)', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { label: 'Excel (.xlsx)', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { label: 'ZIP', value: 'application/zip' },
]

export const ORDER_BY_OPTIONS: { label: string; value: string }[] = [
  { label: 'Upload Date', value: 'created_at' },
  { label: 'File Name', value: 'original_name' },
  { label: 'File Size', value: 'file_size' },
  { label: 'MIME Type', value: 'mime_type' },
  { label: 'Disk', value: 'disk' },
  { label: 'References', value: 'reference_count' },
]