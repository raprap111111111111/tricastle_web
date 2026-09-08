import { defineStore } from 'pinia'
import { internshipApi } from '../api/internship.api'
import type { Internship, InternshipFilters, Pagination } from '../types'

interface State {
  internships: Internship[]
  internship: Internship | null
  pagination: Pagination | null
  filters: InternshipFilters
  loading: boolean
  submitting: boolean
  error: string | null
}

const defaultFilters: InternshipFilters = {
  search: '',
  status: '',
  program_type: '',
  only_current: false,
  page: 1,
  limit: 15,
  offset: 0,
  sort_by: 'created_at',
  sort_direction: 'desc',
}

export const useInternshipStore = defineStore('internship', {
  state: (): State => ({
    internships: [],
    internship: null,
    pagination: null,
    filters: { ...defaultFilters },
    loading: false,
    submitting: false,
    error: null,
  }),

  actions: {
    setFilters(f: Partial<InternshipFilters>) {
      this.filters = { ...this.filters, ...f }
    },
    resetFilters() {
      this.filters = { ...defaultFilters }
    },
    setPage(page: number) {
      this.filters.page = page
      this.filters.offset = (page - 1) * (this.filters.limit ?? 15)
    },
    setLimit(limit: number) {
      this.filters.limit = limit
      this.filters.page = 1
      this.filters.offset = 0
    },
    clearInternship() {
      this.internship = null
    },

    async fetchInternships() {
      this.loading = true
      this.error = null
      try {
        const res = await internshipApi.list(this.filters)
        const body = res.data?.data ?? res.data
        const records = (body as any)?.data ?? (body as any)?.records ?? []
        const meta = (body as any)?.meta ?? (body as any)?.pagination ?? null
        this.internships = records
        this.pagination = meta
      } catch (err: any) {
        this.error = err?.response?.data?.message ?? err.message
        this.internships = []
      } finally {
        this.loading = false
      }
    },

    async fetchInternship(id: number) {
      this.loading = true
      this.error = null
      try {
        const res = await internshipApi.show(id)
        this.internship = res.data?.data ?? (res.data as any)
      } catch (err: any) {
        this.error = err?.response?.data?.message ?? err.message
        this.internship = null
      } finally {
        this.loading = false
      }
    },
  },
})