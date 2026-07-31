// src/features/documents/api/document.api.ts

import http from '@shared/api/http'
import type {
  ApplicantDocument,
  CreateDocumentPayload,
  UpdateDocumentPayload,
  DocumentStatus,
} from '../types'
import type {
  DocumentBatch,
  ApplicantFolder,
} from '../types/folders'

const BASE = '/applicant-documents'

function unwrap<T>(res: any): T {
  const body = res?.data !== undefined && res?.status !== undefined ? res.data : res
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data as T
  }
  return body as T
}

export const documentApi = {

  // ── Level 1 — Batches ──────────────────────────────────────────────────
  async getBatches(params?: { search?: string }): Promise<DocumentBatch[]> {
    const res  = await http.get(`${BASE}/batches`, { params })
    const data = unwrap<DocumentBatch[]>(res)
    return Array.isArray(data) ? data : []
  },

  // ── Level 2 — Folder list ──────────────────────────────────────────────
  async getFolders(params?: Record<string, any>): Promise<any> {
    const res = await http.get(`${BASE}/folders`, { params })
    return unwrap<any>(res)
  },

  // ── Level 3 — Single folder ────────────────────────────────────────────
  async getFolder(applicantId: number): Promise<ApplicantFolder> {
    const res = await http.get(`${BASE}/${applicantId}/folder`)
    return unwrap<ApplicantFolder>(res)
  },

  // ── Flat document list ─────────────────────────────────────────────────
  async getAll(params?: Record<string, any>): Promise<any> {
    const res = await http.get(BASE, { params })
    return unwrap<any>(res)
  },

  // ── Single document ────────────────────────────────────────────────────
  async getOne(id: number): Promise<ApplicantDocument> {
    const res = await http.get(`${BASE}/${id}`)
    return unwrap<ApplicantDocument>(res)
  },

  // ── Create (multipart) ─────────────────────────────────────────────────
  async create(payload: CreateDocumentPayload): Promise<ApplicantDocument> {
    const form = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        form.append(key, value as any)
      }
    })
    const res = await http.post(BASE, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrap<ApplicantDocument>(res)
  },

  // ── Update ─────────────────────────────────────────────────────────────
  async update(id: number, payload: UpdateDocumentPayload): Promise<ApplicantDocument> {
    const res = await http.put(`${BASE}/${id}`, payload)
    return unwrap<ApplicantDocument>(res)
  },

  // ── Delete ─────────────────────────────────────────────────────────────
  async delete(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`)
  },

  // ── Verify ─────────────────────────────────────────────────────────────
  async verify(id: number): Promise<ApplicantDocument> {
    const res = await http.post(`${BASE}/${id}/verify`)
    return unwrap<ApplicantDocument>(res)
  },

  // ── Reject ─────────────────────────────────────────────────────────────
  async reject(id: number, reason: string): Promise<ApplicantDocument> {
    const res = await http.post(`${BASE}/${id}/reject`, {
      rejection_reason: reason,
    })
    return unwrap<ApplicantDocument>(res)
  },

  // ── Update Status (generic) ────────────────────────────────────────────
  async updateStatus(
    id: number,
    payload: {
      status: DocumentStatus
      rejection_reason?: string | null
      notes?: string | null
    }
  ): Promise<ApplicantDocument> {
    const res = await http.patch(`${BASE}/${id}/status`, payload)
    return unwrap<ApplicantDocument>(res)
  },

  // ── Upload new version (multipart) ─────────────────────────────────────
  async uploadVersion(id: number, file: File): Promise<ApplicantDocument> {
    const form = new FormData()
    form.append('file', file)

    const res = await http.post(`${BASE}/${id}/versions`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrap<ApplicantDocument>(res)
  },

  // ── Download URL (sync helper) ─────────────────────────────────────────
  getDownloadUrl(id: number): string {
    const base = (http.defaults?.baseURL ?? '').replace(/\/+$/, '')
    return `${base}${BASE}/${id}/download`
  },

  // ── Preview URL (sync helper) ──────────────────────────────────────────
  getPreviewUrl(id: number): string {
    const base = (http.defaults?.baseURL ?? '').replace(/\/+$/, '')
    return `${base}${BASE}/${id}/preview`
  },
}