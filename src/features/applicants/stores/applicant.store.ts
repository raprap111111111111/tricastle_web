import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applicantApi } from '../api/applicant.api'
import type {
  Applicant,
  ApplicantFilters,
  CreateApplicantPayload,
  DuplicateCheckPayload,
  DuplicateCheckResult,
  DuplicateItem,
  Pagination,
  UpdateApplicantPayload,
} from '../types'

export const useApplicantStore = defineStore('applicants', () => {
  const applicants  = ref<Applicant[]>([])
  const applicant   = ref<Applicant | null>(null)
  const loading     = ref(false)
  const submitting  = ref(false)
  const error       = ref<string | null>(null)
  const duplicates  = ref<DuplicateItem[]>([])
  const pagination  = ref<Pagination | null>(null)

  const filters = ref<ApplicantFilters>({
    offset: 0,
    limit: 10,
    search: '',
    status: '',
    order_by: 'created_at',
    order_dir: 'desc',
  })

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

  function clearError() {
    error.value = null
    duplicates.value = []
  }

  async function fetchApplicants() {
    loading.value = true
    clearError()
    try {
      const params = cleanParams(filters.value)
      const payload: any = await applicantApi.list(params)

      applicants.value = payload?.records ?? []
      pagination.value = {
        current_page: payload?.current_page ?? 1,
        last_page:    payload?.last_page ?? 1,
        per_page:     payload?.per_page ?? payload?.limit ?? 10,
        total:        payload?.total ?? 0,
        offset:       payload?.offset ?? 0,
        limit:        payload?.limit ?? 10,
        has_more:     payload?.has_more ?? false,
      }
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load applicants'
      applicants.value = []
      pagination.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchApplicant(id: number) {
    loading.value = true
    clearError()
    try {
      applicant.value = await applicantApi.get(id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load applicant'
    } finally {
      loading.value = false
    }
  }

  async function createApplicant(payload: CreateApplicantPayload) {
    submitting.value = true
    clearError()
    try {
      const created = await applicantApi.create(payload)
      // Optimistically add to top of list
      applicants.value.unshift(created)
      return created
    } catch (e: any) {
      // ─── Extract duplicate info from 422 response ─────
      if (e?.response?.status === 422) {
        const data = e.response.data
        error.value = data?.message ?? 'Duplicate detected'
        duplicates.value = data?.duplicates ?? []
      } else {
        error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to create applicant'
      }
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function updateApplicant(id: number, payload: UpdateApplicantPayload) {
    submitting.value = true
    clearError()
    try {
      const updated = await applicantApi.update(id, payload)
      const index = applicants.value.findIndex((a) => a.id === id)
      if (index !== -1) applicants.value[index] = updated
      applicant.value = updated
      return updated
    } catch (e: any) {
      if (e?.response?.status === 422) {
        const data = e.response.data
        error.value = data?.message ?? 'Duplicate detected'
        duplicates.value = data?.duplicates ?? []
      } else {
        error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to update applicant'
      }
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function deleteApplicant(id: number) {
    submitting.value = true
    clearError()
    try {
      await applicantApi.remove(id)
      applicants.value = applicants.value.filter((a) => a.id !== id)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to delete applicant'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ─── NEW: Duplicate check ───────────────────────────────
  async function checkDuplicates(
    payload: DuplicateCheckPayload,
  ): Promise<DuplicateCheckResult> {
    try {
      return await applicantApi.checkDuplicates(payload)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to check duplicates'
      return { has_duplicates: false, has_blockers: false, duplicates: [] }
    }
  }

  function setFilters(newFilters: Partial<ApplicantFilters>) {
    filters.value = { ...filters.value, ...newFilters, offset: 0 }
  }

  function setPage(page: number) {
    const limit = filters.value.limit ?? 10
    filters.value.offset = (page - 1) * limit
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.offset = 0
  }

  function resetFilters() {
    filters.value = {
      offset: 0,
      limit: 10,
      search: '',
      status: '',
      order_by: 'created_at',
      order_dir: 'desc',
    }
  }

  function clearApplicant() {
    applicant.value = null
  }

  return {
    applicants,
    applicant,
    loading,
    submitting,
    error,
    duplicates,
    pagination,
    filters,
    fetchApplicants,
    fetchApplicant,
    createApplicant,
    updateApplicant,
    deleteApplicant,
    checkDuplicates,
    setFilters,
    setPage,
    setLimit,
    resetFilters,
    clearApplicant,
    clearError,
  }
})