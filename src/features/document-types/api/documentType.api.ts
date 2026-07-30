// src/features/document-types/api/documentType.api.ts
import http from '@shared/api/http'
import type {
  DocumentType,
  CreateDocumentTypePayload,
  UpdateDocumentTypePayload,
} from '../types'

const BASE = '/document-types'

export const documentTypeApi = {
  getAll: async (params?: Record<string, any>) => {
    const { data } = await http.get(BASE, { params })
    return data
  },

  getOne: async (id: number) => {
    const { data } = await http.get<DocumentType>(`${BASE}/${id}`)
    return data
  },

  create: async (payload: CreateDocumentTypePayload) => {
    const { data } = await http.post<DocumentType>(BASE, payload)
    return data
  },

  update: async (id: number, payload: UpdateDocumentTypePayload) => {
    const { data } = await http.patch<DocumentType>(`${BASE}/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    await http.delete(`${BASE}/${id}`)
  },

  toggleActive: async (id: number, is_active: boolean) => {
    const { data } = await http.patch<DocumentType>(`${BASE}/${id}`, { is_active })
    return data
  },
}