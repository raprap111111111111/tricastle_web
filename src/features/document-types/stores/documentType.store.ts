// src/features/document-types/stores/documentType.store.ts
import { defineStore } from 'pinia'
import { documentTypeApi } from '../api/documentType.api'
import type {
  DocumentType,
  CreateDocumentTypePayload,
  UpdateDocumentTypePayload,
  DocumentTypeFilters,
  Pagination,
} from '../types'

interface State {
  types:      DocumentType[]
  type:       DocumentType | null
  pagination: Pagination | null
  filters:    DocumentTypeFilters
  loading:    boolean
  submitting: boolean
  error:      string | null
}

const defaultFilters = (): DocumentTypeFilters => ({
  search:        '',
  offset:        0,
  limit:         10,
  order_by:      'sort_order',
  order_dir:     'asc',
  category:      null,
  is_active:     null,
  is_required:   null,
  active_only:   null,
  required_only: null,
})

/**
 * Strip empty values AND normalize booleans to 1/0.
 *
 * Why 1/0?
 *   Laravel's `boolean` validation rule accepts: true, false, 1, 0, "1", "0"
 *   It REJECTS the strings "true" / "false".
 *   Axios serializes JS booleans as "true"/"false" in query strings by default,
 *   which trips Laravel validation with:
 *     "The active only field must be true or false."
 *
 * Sending 1/0 sidesteps the problem for every client.
 */
function cleanParams(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const key in obj) {
    const val = obj[key]

    // Skip truly empty values (but keep false, 0, and empty arrays)
    if (val === '' || val === null || val === undefined) continue

    if (typeof val === 'boolean') {
      out[key] = val ? 1 : 0
    } else {
      out[key] = val
    }
  }
  return out
}

/**
 * Build a fully-typed Pagination from a raw API response body.
 * All derived fields (current_page, last_page, from, to) are computed
 * here so the rest of the app never has to guess the shape.
 */
function buildPagination(raw: any, fallbackLimit: number): Pagination {
  const total   = Number(raw?.total  ?? 0)
  const offset  = Number(raw?.offset ?? 0)
  const perPage = Number(raw?.limit  ?? raw?.per_page ?? fallbackLimit)

  const current_page = perPage > 0 ? Math.floor(offset / perPage) + 1 : 1
  const last_page    = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1
  const from         = total > 0 ? offset + 1 : 0
  const to           = Math.min(offset + perPage, total)

  return {
    total,
    offset,
    limit:    perPage,
    per_page: perPage,
    has_more: raw?.has_more ?? (offset + perPage < total),
    current_page,
    last_page,
    from,
    to,
  }
}

export const useDocumentTypeStore = defineStore('documentTypes', {
  state: (): State => ({
    types:      [],
    type:       null,
    pagination: null,
    filters:    defaultFilters(),
    loading:    false,
    submitting: false,
    error:      null,
  }),

  getters: {
    activeTypes:     (s) => s.types.filter((t) => t.is_active),
    primaryTypes:    (s) => s.types.filter((t) => t.category === 'primary'),
    supportingTypes: (s) => s.types.filter((t) => t.category === 'supporting'),
    typeById:        (s) => (id: number)   => s.types.find((t) => t.id === id) ?? null,
    typeByCode:      (s) => (code: string) => s.types.find((t) => t.code === code) ?? null,
  },

  actions: {
    // ─── Pagination ──────────────────────────────────────────────────────────
    setPage(page: number) {
      this.filters.offset = (page - 1) * (this.filters.limit ?? 10)
    },
    setLimit(limit: number) {
      this.filters.limit  = limit
      this.filters.offset = 0
    },

    // ─── Filters ─────────────────────────────────────────────────────────────
    setFilters(f: Partial<DocumentTypeFilters>) {
      this.filters = { ...this.filters, ...f, offset: 0 }
    },
    resetFilters() {
      this.filters = defaultFilters()
    },
    setOrder(
      order_by:  DocumentTypeFilters['order_by'],
      order_dir: DocumentTypeFilters['order_dir'],
    ) {
      this.filters.order_by  = order_by
      this.filters.order_dir = order_dir
      this.filters.offset    = 0
    },

    // ─── Fetch list ──────────────────────────────────────────────────────────
    async fetchTypes() {
      this.loading = true
      this.error   = null
      try {
        const params   = cleanParams({ ...this.filters })
        const raw: any = await documentTypeApi.getAll(params)

        this.types      = raw?.data ?? raw?.records ?? []
        this.pagination = buildPagination(raw, this.filters.limit)
      } catch (e: any) {
        this.error      = e?.response?.data?.message ?? 'Failed to load document types.'
        this.types      = []
        this.pagination = null
      } finally {
        this.loading = false
      }
    },

    // ─── Fetch single ────────────────────────────────────────────────────────
    async fetchType(id: number) {
      this.loading = true
      this.error   = null
      try {
        const raw: any = await documentTypeApi.getOne(id)
        this.type = raw?.data ?? raw
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to load document type.'
        throw e
      } finally {
        this.loading = false
      }
    },

    clearType() {
      this.type = null
    },

    // ─── Create ──────────────────────────────────────────────────────────────
    async createType(payload: CreateDocumentTypePayload) {
      this.submitting = true
      this.error      = null
      try {
        const raw: any              = await documentTypeApi.create(payload)
        const created: DocumentType = raw?.data ?? raw

        this.types.unshift(created)

        if (this.pagination) {
          this.pagination = buildPagination(
            { ...this.pagination, total: this.pagination.total + 1 },
            this.filters.limit,
          )
        }
        return created
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to create document type.'
        throw e
      } finally {
        this.submitting = false
      }
    },

    // ─── Update ──────────────────────────────────────────────────────────────
    async updateType(id: number, payload: UpdateDocumentTypePayload) {
      this.submitting = true
      this.error      = null
      try {
        const raw: any              = await documentTypeApi.update(id, payload)
        const updated: DocumentType = raw?.data ?? raw

        const idx = this.types.findIndex((t) => t.id === id)
        if (idx !== -1) this.types[idx] = updated
        if (this.type?.id === id) this.type = updated

        return updated
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to update document type.'
        throw e
      } finally {
        this.submitting = false
      }
    },

    // ─── Delete ──────────────────────────────────────────────────────────────
    async deleteType(id: number) {
      this.submitting = true
      this.error      = null
      try {
        await documentTypeApi.delete(id)
        this.types = this.types.filter((t) => t.id !== id)

        if (this.pagination) {
          const newTotal = Math.max(0, this.pagination.total - 1)

          const isLastOnPage = this.types.length === 0 && this.filters.offset > 0
          if (isLastOnPage) {
            this.setPage(Math.max(1, Math.ceil(newTotal / this.filters.limit)))
            await this.fetchTypes()
            return
          }

          this.pagination = buildPagination(
            { ...this.pagination, total: newTotal },
            this.filters.limit,
          )
        }
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to delete document type.'
        throw e
      } finally {
        this.submitting = false
      }
    },

    // ─── Toggle active ───────────────────────────────────────────────────────
    async toggleActive(id: number, is_active: boolean) {
      this.submitting = true
      this.error      = null
      try {
        const raw: any              = await documentTypeApi.toggleActive(id, is_active)
        const updated: DocumentType = raw?.data ?? raw

        const idx = this.types.findIndex((t) => t.id === id)
        if (idx !== -1) this.types[idx] = updated
        if (this.type?.id === id) this.type = updated

        return updated
      } catch (e: any) {
        this.error = e?.response?.data?.message ?? 'Failed to toggle document type.'
        throw e
      } finally {
        this.submitting = false
      }
    },
  },
})