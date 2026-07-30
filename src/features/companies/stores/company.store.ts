import { defineStore } from 'pinia'
import { ref } from 'vue'
import { companyApi } from '../api/company.api'
import type {
  Company,
  CompanyFilters,
  CompanyPayload,
  Pagination,
} from '../types'

export const useCompanyStore = defineStore('company', () => {
  const companies  = ref<Company[]>([])
  const company    = ref<Company | null>(null)
  const pagination = ref<Pagination | null>(null)
  const loading    = ref(false)
  const submitting = ref(false)
  const error      = ref<string | null>(null)

  const filters = ref<CompanyFilters>({
    search: '',
    category_id: null,
    prefecture: '',
    city: '',
    country: '',
    is_active: '',
    page: 1,
    limit: 15,
    order_by: 'created_at',
    order_dir: 'desc',
  })

  // ─── Helpers ──────────────────────────────────────────
  function cleanParams(obj: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    for (const key in obj) {
      const val = obj[key]
      if (val !== '' && val !== null && val !== undefined) {
        cleaned[key] = val
      }
    }
    return cleaned
  }

  function setFilters(patch: Partial<CompanyFilters>) {
    filters.value = { ...filters.value, ...patch, page: 1, offset: 0 }
  }

  function setPage(page: number) {
    filters.value.page = page
    filters.value.offset = (page - 1) * (filters.value.limit ?? 15)
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.page = 1
    filters.value.offset = 0
  }

  function resetFilters() {
    filters.value = {
      search: '',
      category_id: null,
      prefecture: '',
      city: '',
      country: '',
      is_active: '',
      page: 1,
      limit: 15,
      order_by: 'created_at',
      order_dir: 'desc',
    }
  }

  function clearCompany() {
    company.value = null
  }

  // ─── Fetch ────────────────────────────────────────────
  async function fetchCompanies() {
    loading.value = true
    error.value = null
    try {
      const params = cleanParams(filters.value)
      const res = await companyApi.list(params)
      companies.value = res.data
      pagination.value = res.meta ?? res.pagination ?? null
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load companies'
      companies.value = []
      pagination.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchCompany(id: number) {
    loading.value = true
    error.value = null
    try {
      company.value = await companyApi.get(id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load company'
    } finally {
      loading.value = false
    }
  }

  // ─── CRUD ─────────────────────────────────────────────
  async function createCompany(payload: CompanyPayload) {
    submitting.value = true
    error.value = null
    try {
      const created = await companyApi.create(payload)
      companies.value.unshift(created)
      return created
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to create company'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function updateCompany(id: number, payload: Partial<CompanyPayload>) {
    submitting.value = true
    error.value = null
    try {
      const updated = await companyApi.update(id, payload)
      const idx = companies.value.findIndex((c) => c.id === id)
      if (idx !== -1) companies.value[idx] = updated
      if (company.value?.id === id) company.value = updated
      return updated
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to update company'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function deleteCompany(id: number) {
    submitting.value = true
    error.value = null
    try {
      await companyApi.remove(id)
      companies.value = companies.value.filter((c) => c.id !== id)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to delete company'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function toggleStatus(id: number) {
    submitting.value = true
    try {
      const updated = await companyApi.toggleStatus(id)
      const idx = companies.value.findIndex((c) => c.id === id)
      if (idx !== -1) companies.value[idx] = updated
      if (company.value?.id === id) company.value = updated
      return updated
    } finally {
      submitting.value = false
    }
  }

  return {
    // state
    companies, company, pagination, loading, submitting, error, filters,
    // filter helpers
    setFilters, setPage, setLimit, resetFilters, clearCompany,
    // actions
    fetchCompanies, fetchCompany, createCompany, updateCompany, deleteCompany, toggleStatus,
  }
})