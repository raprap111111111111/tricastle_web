// src/features/documents/stores/document.store.ts
import { defineStore } from 'pinia'
import { documentApi } from '../api/document.api'
import type {
  ApplicantDocument,
  CreateDocumentPayload,
  UpdateDocumentPayload,
  DocumentFilters,
  Pagination,
} from '../types'
import type {
  ApplicantFolder,
  ApplicantFolderSummary,
  FolderFilters,
  FolderPagination,
} from '../types/folders'

// ─────────────────────────────────────────────────────────────────────────────
// State Interface
// ─────────────────────────────────────────────────────────────────────────────
interface State {
  // Flat documents
  documents: ApplicantDocument[]
  document: ApplicantDocument | null
  pagination: Pagination
  filters: DocumentFilters

  // Folders — list (light)
  folders: ApplicantFolderSummary[]
  foldersPagination: FolderPagination
  foldersFilters: FolderFilters
  foldersLoading: boolean

  // Folder — detail (heavy, one at a time)
  folder: ApplicantFolder | null
  folderLoading: boolean

  loading: boolean
  submitting: boolean
  uploadProgress: number
  error: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────
const defaultFilters = (): DocumentFilters => ({
  search: '',
  applicant_id: null,
  document_type_id: null,
  status: null,
  priority: null,
  is_expired: null,
  offset: 0,
  limit: 15,
})

const defaultFolderFilters = (): FolderFilters => ({
  search: '',
  offset: 0,
  limit: 12,
})

const emptyFolderPagination = (): FolderPagination => ({
  total: 0,
  offset: 0,
  limit: 12,
  current_page: 1,
  last_page: 1,
  per_page: 12,
  has_more: false,
  from: 0,
  to: 0,
})

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Strip empty / null / undefined values before sending as query params */
function cleanParams(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const key in obj) {
    const val = obj[key]
    if (val === '' || val === null || val === undefined) continue
    out[key] = typeof val === 'boolean' ? (val ? 1 : 0) : val
  }
  return out
}

/** Build a normalised FolderPagination from whatever the backend returns */
function buildFolderPagination(raw: any, fallbackLimit: number): FolderPagination {
  const total = Number(raw?.total ?? 0)
  const offset = Number(raw?.offset ?? 0)
  const perPage = Number(raw?.limit ?? raw?.per_page ?? fallbackLimit)

  const current_page = perPage > 0 ? Math.floor(offset / perPage) + 1 : 1
  const last_page = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1
  const from = total > 0 ? offset + 1 : 0
  const to = Math.min(offset + perPage, total)

  return {
    total,
    offset,
    limit: perPage,
    per_page: perPage,
    current_page,
    last_page,
    has_more: raw?.has_more ?? (offset + perPage < total),
    from,
    to,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useDocumentStore = defineStore('document', {
  state: (): State => ({
    // flat documents
    documents: [],
    document: null,
    pagination: { page: 1, limit: 15, total: 0 },
    filters: defaultFilters(),

    // folder list
    folders: [],
    foldersPagination: emptyFolderPagination(),
    foldersFilters: defaultFolderFilters(),
    foldersLoading: false,

    // folder detail
    folder: null,
    folderLoading: false,

    loading: false,
    submitting: false,
    uploadProgress: 0,
    error: null,
  }),

  actions: {

    // ═══════════════════════════════════════════════════════════════════════
    // FOLDER LIST
    // ═══════════════════════════════════════════════════════════════════════

    async fetchFolders() {
      this.foldersLoading = true
      this.error = null
      try {
        const params = cleanParams({ ...this.foldersFilters })
        const raw: any = await documentApi.getFolders(params)

        console.log('[fetchFolders] raw result:', raw)

        // api layer already unwraps r.data.data → so raw = { records, total, ... }
        this.folders = raw?.records ?? []
        this.foldersPagination = buildFolderPagination(raw, this.foldersFilters.limit)
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to load folders.'
        this.folders = []
        this.foldersPagination = emptyFolderPagination()
      } finally {
        this.foldersLoading = false
      }
    },

    setFoldersSearch(search: string) {
      this.foldersFilters = { ...this.foldersFilters, search, offset: 0 }
    },

    setFoldersPage(page: number) {
      this.foldersFilters.offset = (page - 1) * this.foldersFilters.limit
    },

    setFoldersLimit(limit: number) {
      this.foldersFilters.limit = limit
      this.foldersFilters.offset = 0
    },

    resetFoldersFilters() {
      this.foldersFilters = defaultFolderFilters()
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FOLDER DETAIL
    // ═══════════════════════════════════════════════════════════════════════

    async fetchFolder(applicantId: number) {
      this.folderLoading = true
      this.folder = null   // clear stale data immediately
      this.error = null
      try {
        const result = await documentApi.getFolder(applicantId)

        console.log('[fetchFolder] raw result:', result)

        // api layer already unwraps r.data.data → result = { applicant_id, documents, ... }
        this.folder = result
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to load folder.'
        this.folder = null
      } finally {
        this.folderLoading = false
      }
    },

    clearFolder() {
      this.folder = null
      this.folderLoading = false
      this.error = null
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FLAT DOCUMENTS
    // ═══════════════════════════════════════════════════════════════════════

    async fetchDocuments() {
      this.loading = true
      this.error = null
      try {
        const params = cleanParams({ ...this.filters })
        const raw: any = await documentApi.getAll(params)

        console.log('[fetchDocuments] raw result:', raw)

        // api layer already unwraps r.data.data → raw = { records, total, ... }
        this.documents = raw?.records ?? raw?.data ?? []
        this.pagination.total = raw?.total ?? 0
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to load documents.'
        this.documents = []
      } finally {
        this.loading = false
      }
    },

    async fetchDocument(id: number) {
      this.loading = true
      this.document = null
      this.error = null
      try {
        this.document = await documentApi.getOne(id)
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to load document.'
      } finally {
        this.loading = false
      }
    },

    clearDocument() {
      this.document = null
    },

    setPage(page: number) {
      this.pagination.page = page
      this.filters.offset = (page - 1) * this.pagination.limit
    },

    setLimit(limit: number) {
      this.pagination.limit = limit
      this.pagination.page = 1
      this.filters.limit = limit
      this.filters.offset = 0
    },

    setFilters(f: Partial<DocumentFilters>) {
      this.filters = { ...this.filters, ...f, offset: 0 }
      this.pagination.page = 1
    },

    resetFilters() {
      this.filters = defaultFilters()
      this.pagination.page = 1
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CREATE / UPDATE / DELETE
    // ═══════════════════════════════════════════════════════════════════════

    async createDocument(payload: CreateDocumentPayload) {
      this.submitting = true
      this.uploadProgress = 0
      this.error = null
      try {
        const created: ApplicantDocument = await documentApi.create(payload)
        return created
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to create document.'
        throw e
      } finally {
        this.submitting = false
        this.uploadProgress = 0
      }
    },

    async updateDocument(id: number, payload: UpdateDocumentPayload) {
      this.submitting = true
      this.error = null
      try {
        const updated: ApplicantDocument = await documentApi.update(id, payload)
        this.document = updated
        return updated
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to update document.'
        throw e
      } finally {
        this.submitting = false
      }
    },

    async deleteDocument(id: number) {
      this.submitting = true
      this.error = null
      try {
        await documentApi.delete(id)

        // Remove from flat list
        this.documents = this.documents.filter((d) => d.id !== id)

        // ✅ Fix: folder uses `groups` not `documents`
        if (this.folder) {
          this.folder = {
            ...this.folder,
            groups: this.folder.groups.map((group) => ({
              ...group,
              versions: group.versions.filter((v) => v.id !== id),
            })).filter((group) => group.versions.length > 0),
          }
        }

      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to delete document.'
        throw e
      } finally {
        this.submitting = false
      }
    },
    // ═══════════════════════════════════════════════════════════════════════
    // VERIFY / REJECT
    // ═══════════════════════════════════════════════════════════════════════

    async verify(id: number) {
      this.submitting = true
      this.error = null
      try {
        const updated: ApplicantDocument = await documentApi.verify(id)
        this.document = updated

        // ✅ Fix: folder uses `groups[].versions[]` not `documents[]`
        if (this.folder) {
          this.folder = {
            ...this.folder,
            groups: this.folder.groups.map((group) => ({
              ...group,
              versions: group.versions.map((v) =>
                v.id === id ? { ...v, ...updated } : v
              ),
            })),
          }
        }

        return updated
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to verify document.'
        throw e
      } finally {
        this.submitting = false
      }
    },

    async reject(id: number, reason: string) {
      this.submitting = true
      this.error = null
      try {
        const updated: ApplicantDocument = await documentApi.reject(id, reason)
        this.document = updated

        // ✅ Fix: folder uses `groups[].versions[]` not `documents[]`
        if (this.folder) {
          this.folder = {
            ...this.folder,
            groups: this.folder.groups.map((group) => ({
              ...group,
              versions: group.versions.map((v) =>
                v.id === id ? { ...v, ...updated } : v
              ),
            })),
          }
        }

        return updated
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to reject document.'
        throw e
      } finally {
        this.submitting = false
      }
    },
  },
})