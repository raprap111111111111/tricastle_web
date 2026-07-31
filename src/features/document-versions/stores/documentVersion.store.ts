// src/features/document-versions/stores/documentVersion.store.ts

import { defineStore } from 'pinia'
import { documentVersionApi } from '../api/documentVersion.api'
import type {
  DocumentVersion,
  DocumentVersionListParams,
  DocumentVersionPagination,
  CreateVersionPayload,
} from '../types'

interface State {
  versions:       DocumentVersion[]
  allVersions:    DocumentVersion[]        // ✅ ADD THIS
  currentVersion: DocumentVersion | null
  pagination:     DocumentVersionPagination
  loading:        boolean
  submitting:     boolean
  error:          string | null
  filters:        DocumentVersionListParams
}

export const useDocumentVersionStore = defineStore('documentVersion', {
  state: (): State => ({
    versions:       [],
    allVersions:    [],                    // ✅ ADD THIS
    currentVersion: null,
    pagination: {
      current_page: 1,
      per_page:     15,
      total:        0,
      last_page:    1,
      from:         null,
      to:           null,
    },
    loading:    false,
    submitting: false,
    error:      null,
    filters:    {},
  }),

  getters: {
    activeVersion: (state) =>
      state.versions.find(v => v.is_current) ?? null,

    versionsSorted: (state) =>
      [...state.versions].sort((a, b) => b.version_number - a.version_number),

    totalVersions: (state) => state.versions.length,
  },

  actions: {
    setFilters(filters: Partial<DocumentVersionListParams>) {
      this.filters = { ...this.filters, ...filters }
    },

    // ✅ ADD THIS — fetches ALL versions across all documents (for sidebar page)
    async fetchAllVersions() {
      this.loading = true
      this.error   = null
      try {
        const res = await documentVersionApi.list({
          page:     1,
          per_page: 100,
        })
        this.allVersions = res.data
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to load versions'
      } finally {
        this.loading = false
      }
    },

    async fetchVersions(documentId?: number) {
      this.loading = true
      this.error   = null

      if (documentId) this.filters.applicant_document_id = documentId

      try {
        const res = await documentVersionApi.list({
          ...this.filters,
          page:     this.pagination.current_page,
          per_page: this.pagination.per_page,
        })
        this.versions   = res.data
        this.pagination = res.pagination
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to load versions'
      } finally {
        this.loading = false
      }
    },

    async fetchVersion(id: number) {
      this.loading = true
      try {
        this.currentVersion = await documentVersionApi.show(id)
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to load version'
      } finally {
        this.loading = false
      }
    },

    async uploadNewVersion(payload: CreateVersionPayload): Promise<DocumentVersion | null> {
      this.submitting = true
      this.error      = null
      try {
        const created = await documentVersionApi.create(payload)
        this.versions = [created, ...this.versions.map(v => ({ ...v, is_current: false }))]
        return created
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Upload failed'
        throw e
      } finally {
        this.submitting = false
      }
    },

    async setAsCurrent(id: number) {
      this.submitting = true
      try {
        const { version } = await documentVersionApi.setCurrent(id)
        this.versions = this.versions.map(v => ({
          ...v,
          is_current: v.id === version.id,
        }))
        return version
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Could not set as current'
        throw e
      } finally {
        this.submitting = false
      }
    },

    async deleteVersion(id: number) {
      this.submitting = true
      try {
        await documentVersionApi.delete(id)
        this.versions    = this.versions.filter(v => v.id !== id)
        this.allVersions = this.allVersions.filter(v => v.id !== id) // ✅ also remove from allVersions
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Delete failed'
        throw e
      } finally {
        this.submitting = false
      }
    },

    reset() {
      this.$reset()
    },
  },
})