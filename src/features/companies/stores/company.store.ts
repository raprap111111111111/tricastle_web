// src/features/companies/stores/company.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { companyApi } from '../api/company.api'
import type { Company, CompanyFilters, CompanyPayload, Pagination } from '../types'

export const useCompanyStore = defineStore('company', () => {
  const companies = ref<Company[]>([])
  const company = ref<Company | null>(null)
  const pagination = ref<Pagination | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  const allCompanies = ref<Company[]>([])
  const activeCompanies = ref<Company[]>([])
  const loadingActive = ref(false)
  const hasFetchedActive = ref(false)

  let activeFetchPromise: Promise<Company[]> | null = null
  let fetchCompaniesPromise: Promise<void> | null = null

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

  // Fast O(1) lookup Map: companyMap.get(id)
  const companyMap = computed(() => {
    const map = new Map<number, Company>()
    allCompanies.value.forEach((c) => map.set(c.id, c))
    activeCompanies.value.forEach((c) => map.set(c.id, c))
    companies.value.forEach((c) => map.set(c.id, c))
    return map
  })

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

  async function fetchCompanies(force = false) {
    if (fetchCompaniesPromise && !force) return fetchCompaniesPromise
    if (loading.value && !force) return

    loading.value = true
    error.value = null

    fetchCompaniesPromise = (async () => {
      try {
        const res = await companyApi.list(filters.value)
        companies.value = res.data
        pagination.value = res.meta ?? res.pagination ?? null
      } catch (e: any) {
        error.value = e?.message ?? 'Failed to load companies'
        companies.value = []
        pagination.value = null
      } finally {
        loading.value = false
        fetchCompaniesPromise = null
      }
    })()

    return fetchCompaniesPromise
  }

  async function fetchActiveCompanies(force = false): Promise<Company[]> {
    if (hasFetchedActive.value && !force) return activeCompanies.value
    if (activeFetchPromise && !force) return activeFetchPromise

    loadingActive.value = true
    activeFetchPromise = (async () => {
      try {
        // ⚡ Pass 1 (integer) instead of boolean true to satisfy backend validation
        const records = await companyApi.listAll({ is_active: 1 as any })
        activeCompanies.value = records
        allCompanies.value = records
        hasFetchedActive.value = true
        return activeCompanies.value
      } catch {
        activeCompanies.value = []
        return []
      } finally {
        loadingActive.value = false
        activeFetchPromise = null
      }
    })()

    return activeFetchPromise
  }

  async function fetchCompany(id: number) {
    if (loading.value) return
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

  async function createCompany(payload: CompanyPayload) {
    submitting.value = true
    error.value = null
    try {
      const created = await companyApi.create(payload)
      companies.value.unshift(created)
      hasFetchedActive.value = false
      return created
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
      hasFetchedActive.value = false
      return updated
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
      hasFetchedActive.value = false
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
      hasFetchedActive.value = false
      return updated
    } finally {
      submitting.value = false
    }
  }

  return {
    companies,
    company,
    allCompanies,
    activeCompanies,
    companyMap,
    pagination,
    loading,
    loadingActive,
    submitting,
    error,
    filters,
    setFilters,
    setPage,
    setLimit,
    resetFilters,
    clearCompany,
    fetchCompanies,
    fetchActiveCompanies,
    fetchCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    toggleStatus,
  }
})