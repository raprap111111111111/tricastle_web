// src/features/companies/stores/company.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { companyApi } from '../api/company.api'
import type { Company, CompanyFilters, CompanyPayload, Pagination } from '../types'

export const useCompanyStore = defineStore('company', () => {
  const companies  = ref<Company[]>([])
  const company    = ref<Company | null>(null)
  const pagination = ref<Pagination | null>(null)
  const loading    = ref(false)
  const submitting = ref(false)
  const error      = ref<string | null>(null)

  const activeCompanies  = ref<Company[]>([])
  const loadingActive    = ref(false)
  const hasFetchedActive = ref(false)
  let activeFetchPromise: Promise<Company[]> | null = null

  const filters = ref<CompanyFilters>({
    search: '', category_id: null, prefecture: '', city: '',
    country: '', is_active: '', page: 1, limit: 15,
    order_by: 'created_at', order_dir: 'desc',
  })

  function cleanParams(obj: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    for (const key in obj) {
      if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
        cleaned[key] = obj[key]
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
    filters.value = { search: '', category_id: null, prefecture: '', city: '', country: '', is_active: '', page: 1, limit: 15, order_by: 'created_at', order_dir: 'desc' }
  }
  function clearCompany() { company.value = null }

  async function fetchCompanies() {
    // 🛡️ GUARD: Prevent infinite re-entry if already loading
    if (loading.value) return

    loading.value = true
    error.value = null
    try {
      const res = await companyApi.list(cleanParams(filters.value))
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

  async function fetchActiveCompanies(): Promise<Company[]> {
    if (hasFetchedActive.value) return activeCompanies.value
    if (activeFetchPromise) return activeFetchPromise

    loadingActive.value = true
    activeFetchPromise = (async () => {
      try {
        const res = await companyApi.list({ is_active: true, limit: 1000 } as any)
        activeCompanies.value = res.data
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
    } catch (e: any) { 
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
      hasFetchedActive.value = false
      return updated
    } catch (e: any) { 
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
      hasFetchedActive.value = false
    } catch (e: any) { 
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
      hasFetchedActive.value = false
      return updated
    } finally { 
      submitting.value = false 
    }
  }

  return {
    companies, company, activeCompanies, pagination, loading, loadingActive, submitting, error, filters,
    setFilters, setPage, setLimit, resetFilters, clearCompany,
    fetchCompanies, fetchActiveCompanies, fetchCompany,
    createCompany, updateCompany, deleteCompany, toggleStatus,
  }
})