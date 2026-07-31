// src/features/document-versions/api/documentVersion.api.ts

import http from '@shared/api/http'
import type {
  DocumentVersion,
  DocumentVersionListParams,
  DocumentVersionListResponse,
  CreateVersionPayload,
  SetCurrentVersionResponse,
} from '../types'

// ✅ FIXED: match the endpoint the frontend actually calls
const BASE = '/document-versions'

export const documentVersionApi = {

  async list(params: DocumentVersionListParams): Promise<DocumentVersionListResponse> {
    const { data } = await http.get(BASE, { params })

    // Backend returns: { success, message, data: { records, total, current_page, ... } }
    // The http interceptor may unwrap `data` — support both shapes
    const payload = data?.data ?? data

    return {
      data: payload?.records ?? payload?.data ?? [],
      pagination: {
        current_page: payload?.current_page ?? 1,
        per_page:     payload?.per_page     ?? 15,
        total:        payload?.total        ?? 0,
        last_page:    payload?.last_page    ?? 1,
        from:         payload?.offset       ?? null,
        to:           null,
      },
    }
  },

  async show(id: number): Promise<DocumentVersion> {
    const { data } = await http.get(`${BASE}/${id}`)
    return data?.data ?? data
  },

  async create(payload: CreateVersionPayload): Promise<DocumentVersion> {
    const formData = new FormData()
    formData.append('applicant_document_id', String(payload.applicant_document_id))
    formData.append('file', payload.file)
    formData.append('change_reason', payload.change_reason)

    const { data } = await http.post(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data?.data ?? data
  },

  async setCurrent(id: number): Promise<SetCurrentVersionResponse> {
    const { data } = await http.post(`${BASE}/${id}/set-current`)
    return data?.data ?? data
  },

  async delete(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },
}