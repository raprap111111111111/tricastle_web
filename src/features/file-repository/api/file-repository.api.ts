// src/features/file-repository/api/file-repository.api.ts

import { http } from '@shared/api/http'
import type { FileRepositoryFilters, FileRepositoryListResponse, FileRepository } from '../types'

const BASE = '/file-repository'

function buildParams(filters: Partial<FileRepositoryFilters>): Record<string, any> {
  const params: Record<string, any> = {}

  if (filters.search)        params.search        = filters.search
  if (filters.disk)          params.disk          = filters.disk
  if (filters.mime_type)     params.mime_type     = filters.mime_type
  if (filters.uploaded_by)   params.uploaded_by   = filters.uploaded_by
  if (filters.offset != null) params.offset       = filters.offset
  if (filters.limit != null)  params.limit        = filters.limit
  if (filters.order_by)      params.order_by      = filters.order_by
  if (filters.order_dir)     params.order_dir     = filters.order_dir

  // booleans — only send when explicitly set
  if (filters.is_encrypted  != null) params.is_encrypted  = filters.is_encrypted  ? 1 : 0
  if (filters.unused_only   != null) params.unused_only   = filters.unused_only   ? 1 : 0
  if (filters.encrypted_only != null) params.encrypted_only = filters.encrypted_only ? 1 : 0
  if (filters.min_size != null)       params.min_size      = filters.min_size
  if (filters.max_size != null)       params.max_size      = filters.max_size

  return params
}

export const fileRepositoryApi = {
  /**
   * Paginated list with filters
   */
  getAll(filters: Partial<FileRepositoryFilters>) {
    return http.get<{ success: boolean; message: string; data: FileRepositoryListResponse }>(
      BASE,
      { params: buildParams(filters) }
    )
  },

  /**
   * Single file record
   */
  getOne(id: number) {
    return http.get<{ success: boolean; message: string; data: FileRepository }>(
      `${BASE}/${id}`
    )
  },

  /**
   * Upload a file via multipart/form-data
   */
  upload(
    file: File,
    extra?: Record<string, any>,
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ) {
    const form = new FormData()
    form.append('file', file)

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (value != null) form.append(key, String(value))
      })
    }

    return http.post<{ success: boolean; message: string; data: FileRepository }>(
      BASE,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      }
    )
  },

  /**
   * Soft delete
   */
  delete(id: number) {
    return http.delete<{ success: boolean; message: string; data: null }>(
      `${BASE}/${id}`
    )
  },

  /**
   * Permanent purge
   */
  purge(id: number) {
    return http.delete<{ success: boolean; message: string; data: null }>(
      `${BASE}/${id}/purge`
    )
  },
}