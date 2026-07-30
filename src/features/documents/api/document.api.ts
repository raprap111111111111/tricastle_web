// src/features/documents/api/document.api.ts
import http from '@shared/api/http'
import type {
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from '../types'

const BASE = '/applicant-documents'

export const documentApi = {

  // ─── Folders ───────────────────────────────────────────────
  getFolders: (params?: Record<string, any>) =>
    http.get(`${BASE}/folders`, { params }).then((r) => r.data),

  getFolder: (applicantId: number) =>
    http.get(`${BASE}/${applicantId}/folder`).then((r) => r.data),

  // ─── Flat CRUD ─────────────────────────────────────────────
  getAll: (params?: Record<string, any>) =>
    http.get(BASE, { params }).then((r) => r.data),

  getOne: (id: number) =>
    http.get(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateDocumentPayload) => {
    const fd = new FormData()
    fd.append('applicant_id',     String(payload.applicant_id))
    fd.append('document_type_id', String(payload.document_type_id))
    fd.append('file',             payload.file)
    if (payload.document_date) fd.append('document_date', payload.document_date)
    if (payload.expiry_date)   fd.append('expiry_date',   payload.expiry_date)
    if (payload.priority)      fd.append('priority',      payload.priority)
    if (payload.notes)         fd.append('notes',         payload.notes)
    return http.post(BASE, fd).then((r) => r.data)
  },

  update: (id: number, payload: UpdateDocumentPayload) =>
    http.put(`${BASE}/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    http.delete(`${BASE}/${id}`).then((r) => r.data),

  verify: (id: number) =>
    http.post(`${BASE}/${id}/verify`).then((r) => r.data),

  reject: (id: number, reason?: string) =>
    http.post(`${BASE}/${id}/reject`, { reason }).then((r) => r.data),

  uploadVersion: (id: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return http.post(`${BASE}/${id}/versions`, fd).then((r) => r.data)
  },

  getDownloadUrl: (id: number): string => {
    const base = (http.defaults.baseURL ?? '').replace(/\/$/, '')
    return `${base}${BASE}/${id}/download`
  },
}