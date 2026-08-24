// src/features/company-categories/stores/company-category.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { companyCategoryApi } from '../api/company-category.api'
import type { CompanyCategory, CompanyCategoryFilters, CompanyCategoryPayload, Pagination } from '../types'

export const useCompanyCategoryStore = defineStore('company-category', () => {
  const categories = ref<CompanyCategory[]>([])
  const category   = ref<CompanyCategory | null>(null)
  const pagination = ref<Pagination | null>(null)
  const loading    = ref(false)
  const submitting = ref(false)
  const error      = ref<string | null>(null)

  const activeCategories = ref<CompanyCategory[]>([])
  const hasFetchedActive = ref(false)
  let activeFetchPromise: Promise<CompanyCategory[]> | null = null

  const filters = ref<CompanyCategoryFilters>({
    search: '', is_active: '', page: 1, limit: 15, order_by: 'created_at', order_dir: 'desc',
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

  function setFilters(patch: Partial<CompanyCategoryFilters>) {
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
    filters.value = { search: '', is_active: '', page: 1, limit: 15, order_by: 'created_at', order_dir: 'desc' }
  }
  function clearCategory() { category.value = null }

  async function fetchCategories() {
    // 🛡️ GUARD: Prevent infinite re-entry if already loading
    if (loading.value) return

    loading.value = true
    error.value = null
    try {
      const res = await companyCategoryApi.list(cleanParams(filters.value))
      categories.value = res.data
      pagination.value = res.meta ?? res.pagination ?? null
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load categories'
      categories.value = []
    } finally { 
      loading.value = false 
    }
  }

  async function fetchActiveCategories(): Promise<CompanyCategory[]> {
    if (hasFetchedActive.value) return activeCategories.value
    if (activeFetchPromise) return activeFetchPromise

    activeFetchPromise = (async () => {
      try {
        const res = await companyCategoryApi.list({ is_active: true, limit: 1000 } as any)
        activeCategories.value = res.data
        hasFetchedActive.value = true
        return activeCategories.value
      } catch {
        activeCategories.value = []
        return []
      } finally {
        activeFetchPromise = null
      }
    })()

    return activeFetchPromise
  }

  async function fetchCategory(id: number) {
    if (loading.value) return
    loading.value = true
    error.value = null
    try { 
      category.value = await companyCategoryApi.get(id) 
    } catch (e: any) { 
      error.value = e?.message ?? 'Failed to load category' 
    } finally { 
      loading.value = false 
    }
  }

  async function createCategory(payload: CompanyCategoryPayload) {
    submitting.value = true
    error.value = null
    try {
      const created = await companyCategoryApi.create(payload)
      categories.value.unshift(created)
      hasFetchedActive.value = false
      return created
    } catch (e: any) { 
      throw e 
    } finally { 
      submitting.value = false 
    }
  }

  async function updateCategory(id: number, payload: Partial<CompanyCategoryPayload>) {
    submitting.value = true
    try {
      const updated = await companyCategoryApi.update(id, payload)
      const idx = categories.value.findIndex((c) => c.id === id)
      if (idx !== -1) categories.value[idx] = updated
      if (category.value?.id === id) category.value = updated
      hasFetchedActive.value = false
      return updated
    } finally { 
      submitting.value = false 
    }
  }

  async function deleteCategory(id: number) {
    submitting.value = true
    try {
      await companyCategoryApi.remove(id)
      categories.value = categories.value.filter((c) => c.id !== id)
      hasFetchedActive.value = false
    } finally { 
      submitting.value = false 
    }
  }

  async function toggleStatus(id: number) {
    submitting.value = true
    try {
      const updated = await companyCategoryApi.toggleStatus(id)
      const idx = categories.value.findIndex((c) => c.id === id)
      if (idx !== -1) categories.value[idx] = updated
      if (category.value?.id === id) category.value = updated
      hasFetchedActive.value = false
      return updated
    } finally { 
      submitting.value = false 
    }
  }

  return {
    categories, category, activeCategories, pagination, loading, submitting, error, filters,
    setFilters, setPage, setLimit, resetFilters, clearCategory,
    fetchCategories, fetchActiveCategories, fetchCategory,
    createCategory, updateCategory, deleteCategory, toggleStatus,
  }
})