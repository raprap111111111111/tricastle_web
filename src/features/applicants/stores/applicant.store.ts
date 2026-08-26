// src/features/applicants/stores/applicant.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applicantApi } from '../api/applicant.api'
import type {
  Applicant,
  ApplicantFilters,
  ApplicantStatus,
  CreateApplicantPayload,
  DuplicateCheckPayload,
  DuplicateCheckResult,
  DuplicateItem,
  Pagination,
  UpdateApplicantPayload,
} from '../types'

export const useApplicantStore = defineStore('applicants', () => {
  const applicants = ref<Applicant[]>([])
  const applicant = ref<Applicant | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const duplicates = ref<DuplicateItem[]>([])
  const pagination = ref<Pagination | null>(null)

  const filters = ref<ApplicantFilters>({
    offset: 0,
    limit: 10,
    search: '',
    status: '',
    exclude_statuses: '',
    order_by: 'created_at',
    order_dir: 'desc',
  })

  // ─── Helpers ────────────────────────────────────────────
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

  function replaceInList(updated: Applicant) {
    const idx = applicants.value.findIndex((a) => a.id === updated.id)
    if (idx !== -1) applicants.value.splice(idx, 1, updated)
    if (applicant.value?.id === updated.id) applicant.value = updated
  }

  // ─── Fetch ──────────────────────────────────────────────
  async function fetchApplicants() {
    loading.value = true
    clearError()
    try {
      const params = cleanParams(filters.value)
      const payload: any = await applicantApi.list(params)

      applicants.value = payload?.records ?? []

      // 🎯 Fixed: Map 'from' and 'to' so AppPagination displays correct entry counts
      pagination.value = {
        current_page: payload?.current_page ?? 1,
        last_page: payload?.last_page ?? 1,
        per_page: payload?.per_page ?? payload?.limit ?? 10,
        total: payload?.total ?? 0,
        offset: payload?.offset ?? 0,
        limit: payload?.limit ?? 10,
        has_more: payload?.has_more ?? false,
        from: payload?.from ?? null,
        to: payload?.to ?? null,
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

  // ─── Create / Update / Delete ───────────────────────────
  async function createApplicant(payload: CreateApplicantPayload) {
    submitting.value = true
    clearError()
    try {
      const created = await applicantApi.create(payload)
      applicants.value.unshift(created)
      return created
    } catch (e: any) {
      if (e?.response?.status === 422 || e?.response?.status === 409) {
        const data = e.response.data
        error.value = data?.message ?? 'Duplicate detected'
        duplicates.value = data?.duplicates ?? []
      } else {
        error.value =
          e?.response?.data?.message ?? e?.message ?? 'Failed to create applicant'
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
      replaceInList(updated)
      return updated
    } catch (e: any) {
      if (e?.response?.status === 422) {
        const data = e.response.data
        error.value = data?.message ?? 'Duplicate detected'
        duplicates.value = data?.duplicates ?? []
      } else {
        error.value =
          e?.response?.data?.message ?? e?.message ?? 'Failed to update applicant'
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

  // ═══════════════════════════════════════════════════════
  // Status Actions
  // ═══════════════════════════════════════════════════════

  async function moveToFinalList(id: number): Promise<Applicant> {
    submitting.value = true
    clearError()
    try {
      const updated = await applicantApi.moveToFinalList(id)
      replaceInList(updated)
      return updated
    } catch (e: any) {
      error.value =
        e?.response?.data?.message ?? e?.message ?? 'Failed to move to final list'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function rejectApplicant(
    id: number,
    reason: string,
  ): Promise<Applicant> {
    submitting.value = true
    clearError()
    try {
      const updated = await applicantApi.reject(id, reason)
      replaceInList(updated)
      return updated
    } catch (e: any) {
      error.value =
        e?.response?.data?.message ?? e?.message ?? 'Failed to reject applicant'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function updateStatus(
    id: number,
    status: ApplicantStatus,
    rejectionReason?: string,
  ): Promise<Applicant> {
    submitting.value = true
    clearError()
    try {
      const updated = await applicantApi.updateStatus(id, status, rejectionReason)
      replaceInList(updated)
      return updated
    } catch (e: any) {
      error.value =
        e?.response?.data?.message ?? e?.message ?? 'Failed to update status'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ─── Duplicate check ────────────────────────────────────
  async function checkDuplicates(
    payload: DuplicateCheckPayload,
  ): Promise<DuplicateCheckResult> {
    try {
      return await applicantApi.checkDuplicates(payload)
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to check duplicates'
      return {
        has_duplicates: false,
        has_blockers: false,
        has_warnings: false,
        duplicates: [],
      }
    }
  }

  function setFilters(newFilters: Partial<ApplicantFilters>) {
    const nextFilters = {
      ...filters.value,
      ...newFilters,
    }

    const limit = Number(nextFilters.limit ?? 10)
    const page = Number(nextFilters.page ?? 1)

    filters.value = {
      ...nextFilters,
      page,
      limit,
      offset: (page - 1) * limit,
    }
  }

  function setPage(page: number) {
    const limit = filters.value.limit ?? 10
    filters.value.page = page
    filters.value.offset = (page - 1) * limit
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.offset = 0
    filters.value.page = 1
  }

  function resetFilters() {
    filters.value = {
      offset: 0,
      limit: 10,
      page: 1,
      search: '',
      status: '',
      exclude_statuses: '',
      order_by: 'created_at',
      order_dir: 'desc',
    }
  }

  function clearApplicant() {
    applicant.value = null
  }

  return {
    // State
    applicants,
    applicant,
    loading,
    submitting,
    error,
    duplicates,
    pagination,
    filters,

    // Actions
    fetchApplicants,
    fetchApplicant,
    createApplicant,
    updateApplicant,
    deleteApplicant,

    // Status transitions
    moveToFinalList,
    rejectApplicant,
    updateStatus,

    // Utilities
    checkDuplicates,
    setFilters,
    setPage,
    setLimit,
    resetFilters,
    clearApplicant,
    clearError,
    replaceInList,
  }
})