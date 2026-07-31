// src/features/documents/stores/document.store.ts
import { defineStore } from 'pinia'
import { documentApi } from '../api/document.api'
import type {
  ApplicantDocument,
  CreateDocumentPayload,
  UpdateDocumentPayload,
  DocumentFilters,
  Pagination,
  DocumentStatus,
} from '../types'
import type {
  DocumentBatch,
  ApplicantFolder,
  ApplicantFolderSummary,
  FolderFilters,
  FolderPagination,
} from '../types/folders'

// ─────────────────────────────────────────────────────────────────────────────
// State Interface
// ─────────────────────────────────────────────────────────────────────────────
interface BatchFilters {
  search: string
  offset: number
  limit: number
}

interface State {
  // L1
  batches: DocumentBatch[]
  batchesFilters: BatchFilters
  batchesPagination: FolderPagination
  batchesLoading: boolean
  batchesError: string | null

  // L2
  folders: ApplicantFolderSummary[]
  foldersPagination: FolderPagination
  foldersFilters: FolderFilters
  foldersLoading: boolean
  foldersError: string | null

  // L3
  folder: ApplicantFolder | null
  folderLoading: boolean
  folderError: string | null

  // Flat docs
  documents: ApplicantDocument[]
  document: ApplicantDocument | null
  pagination: Pagination
  filters: DocumentFilters
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
  batch_id: null,
  search: '',
  offset: 0,
  limit: 15,
})

const defaultBatchFilters = (): BatchFilters => ({
  search: '',
  offset: 0,
  limit: 15,
})

const emptyFolderPagination = (): FolderPagination => ({
  total: 0,
  offset: 0,
  limit: 15,
  current_page: 1,
  last_page: 1,
  per_page: 15,
  has_more: false,
  from: 0,
  to: 0,
})

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function cleanParams(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const key in obj) {
    const val = obj[key]
    if (val === '' || val === null || val === undefined) continue
    out[key] = typeof val === 'boolean' ? (val ? 1 : 0) : val
  }
  return out
}

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

function buildBatchPagination(total: number, filters: BatchFilters): FolderPagination {
  const perPage = filters.limit
  const offset = filters.offset
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
    has_more: offset + perPage < total,
    from,
    to,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useDocumentStore = defineStore('document', {
  state: (): State => ({
    // L1
    batches: [],
    batchesFilters: defaultBatchFilters(),
    batchesPagination: emptyFolderPagination(),
    batchesLoading: false,
    batchesError: null,

    // L2
    folders: [],
    foldersPagination: emptyFolderPagination(),
    foldersFilters: defaultFolderFilters(),
    foldersLoading: false,
    foldersError: null,

    // L3
    folder: null,
    folderLoading: false,
    folderError: null,

    // flat docs
    documents: [],
    document: null,
    pagination: { page: 1, limit: 15, total: 0 },
    filters: defaultFilters(),
    loading: false,
    submitting: false,
    uploadProgress: 0,
    error: null,
  }),

  actions: {

    // ═══════════════════════════════════════════════════════════════════════
    // LEVEL 1 — BATCHES
    // ═══════════════════════════════════════════════════════════════════════

    async fetchBatches(search?: string) {
      this.batchesLoading = true
      this.batchesError = null

      if (search !== undefined) {
        this.batchesFilters.search = search
        this.batchesFilters.offset = 0
      }

      try {
        const params = cleanParams({ ...this.batchesFilters })
        const raw = await documentApi.getBatches(params) as any

        if (Array.isArray(raw)) {
          this.batches = raw
          this.batchesPagination = buildBatchPagination(raw.length, this.batchesFilters)
        } else {
          this.batches = raw?.records ?? raw?.data ?? []
          this.batchesPagination = buildFolderPagination(raw, this.batchesFilters.limit)
        }
      } catch (e: any) {
        this.batchesError = e?.response?.data?.message ?? 'Failed to load batches.'
        this.batches = []
        this.batchesPagination = emptyFolderPagination()
      } finally {
        this.batchesLoading = false
      }
    },

    setBatchesSearch(search: string) {
      this.batchesFilters = { ...this.batchesFilters, search, offset: 0 }
    },

    setBatchesPage(page: number) {
      this.batchesFilters.offset = (page - 1) * this.batchesFilters.limit
    },

    setBatchesLimit(limit: number) {
      this.batchesFilters.limit = limit
      this.batchesFilters.offset = 0
    },

    resetBatchesFilters() {
      this.batchesFilters = defaultBatchFilters()
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LEVEL 2 — FOLDER LIST
    // ═══════════════════════════════════════════════════════════════════════

    async fetchFolders() {
      this.foldersLoading = true
      this.foldersError = null
      try {
        const params = cleanParams({ ...this.foldersFilters })
        const raw = await documentApi.getFolders(params)

        this.folders = raw?.records ?? []
        this.foldersPagination = buildFolderPagination(raw, this.foldersFilters.limit)
      } catch (e: any) {
        this.foldersError = e?.response?.data?.message ?? 'Failed to load folders.'
        this.folders = []
        this.foldersPagination = emptyFolderPagination()
      } finally {
        this.foldersLoading = false
      }
    },

    setBatchFilter(batchId: number | null) {
      this.foldersFilters = {
        ...this.foldersFilters,
        batch_id: batchId,
        offset: 0,
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
    // LEVEL 3 — FOLDER DETAIL
    // ═══════════════════════════════════════════════════════════════════════

    async fetchFolder(applicantId: number) {
      this.folderLoading = true
      this.folder = null
      this.folderError = null
      try {
        const result = await documentApi.getFolder(applicantId)
        this.folder = result
      } catch (e: any) {
        this.folderError = e?.response?.data?.message ?? 'Failed to load folder.'
        this.folder = null
      } finally {
        this.folderLoading = false
      }
    },

    clearFolder() {
      this.folder = null
      this.folderLoading = false
      this.folderError = null
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FLAT DOCUMENTS
    // ═══════════════════════════════════════════════════════════════════════

    async fetchDocuments() {
      this.loading = true
      this.error = null
      try {
        const params = cleanParams({ ...this.filters })
        const raw = await documentApi.getAll(params)
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

    clearDocument() { this.document = null },

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
        this.documents = this.documents.filter((d) => d.id !== id)

        if (this.folder) {
          this.folder = {
            ...this.folder,
            groups: this.folder.groups
              .map((group) => ({
                ...group,
                versions: group.versions.filter((v) => v.id !== id),
              }))
              .filter((group) => group.versions.length > 0),
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

        if (this.folder) {
          this.folder = {
            ...this.folder,
            groups: this.folder.groups.map((group) => ({
              ...group,
              versions: group.versions.map((v) =>
                v.id === id ? { ...v, ...updated } : v,
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

        if (this.folder) {
          this.folder = {
            ...this.folder,
            groups: this.folder.groups.map((group) => ({
              ...group,
              versions: group.versions.map((v) =>
                v.id === id ? { ...v, ...updated } : v,
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

    // ═══════════════════════════════════════════════════════════════════════
    // UPDATE STATUS (generic)
    // ═══════════════════════════════════════════════════════════════════════

    async updateDocumentStatus(
      id: number,
      status: DocumentStatus,
      rejectionReason?: string | null,
      notes?: string | null,
    ) {
      this.submitting = true
      this.error = null
      try {
        const updated = await documentApi.updateStatus(id, {
          status,
          rejection_reason: rejectionReason ?? null,
          notes: notes ?? null,
        })

        // 1. Update flat documents list (if loaded)
        const idx = this.documents.findIndex((d) => d.id === id)
        if (idx !== -1) this.documents[idx] = updated

        // 2. Update single document (if loaded)
        if (this.document?.id === id) this.document = updated

        // 3. Update folder nested structure
        if (this.folder) {
          const currentFolder = this.folder
          const nextGroups = currentFolder.groups.map((group) => {
            const versions = group.versions.map((v) =>
              v.id === id ? { ...v, status: updated.status as any } : v,
            )
            const current = versions.find((v) => v.is_current) ?? versions[0]
            return {
              ...group,
              versions,
              latest_status: (current?.status ?? group.latest_status) as any,
            }
          })

          this.folder = {
            ...currentFolder,
            groups: nextGroups,
          }
        }

        return updated
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to update document status.'
        throw e
      } finally {
        this.submitting = false
      }
    },
  },
})