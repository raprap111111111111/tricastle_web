// src/features/profile-updates/stores/profile-update.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { profileUpdateApi } from '../api/profile-update.api'
import type { ProfileUpdate, ProfileUpdateFilters } from '../types'

export const useProfileUpdateStore = defineStore('profileUpdates', () => {
  const updates = ref<ProfileUpdate[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<ProfileUpdateFilters & { limit?: number }>({
    status: 'pending',
    page: 1,
    limit: 15,
  })

  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
    offset: 0,
    has_more: false,
  })

  function clearError() {
    error.value = null
  }

  async function fetchUpdates() {
    loading.value = true
    clearError()
    try {
      const response: any = await profileUpdateApi.list(filters.value)

      // Handle repository array / paginated wrapper ({ records: [...], ... } or { data: [...], ... })
      const list: any[] = Array.isArray(response)
        ? response
        : (response.records ?? response.data ?? [])

      updates.value = list.map((row) => {
        const applicant = row.applicant ?? {}
        const fullName =
          applicant.full_name ||
          row.applicant_name ||
          [applicant.first_name, applicant.middle_name, applicant.last_name]
            .filter(Boolean)
            .join(' ') ||
          '—'

        return {
          ...row,
          applicant_code:
            row.applicant_code ??
            applicant.applicant_code ??
            '—',
          applicant_name: fullName,
          proposed_payload: row.proposed_payload ?? {},
          reviewer_name:
            row.reviewer?.name ||
            row.reviewer?.full_name ||
            [row.reviewer?.first_name, row.reviewer?.last_name].filter(Boolean).join(' ') ||
            null,
        } as ProfileUpdate
      })

      const total = response.total ?? list.length
      const perPage = response.per_page ?? response.limit ?? filters.value.limit ?? 15
      const currentPage = response.current_page ?? filters.value.page ?? 1
      const lastPage = response.last_page ?? Math.max(1, Math.ceil(total / perPage))

      pagination.value = {
        total,
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        offset: response.offset ?? (currentPage - 1) * perPage,
        has_more: response.has_more ?? currentPage < lastPage,
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? e?.message ?? 'Failed to load requests'
      updates.value = []
    } finally {
      loading.value = false
    }
  }

  function setStatusFilter(status: 'pending' | 'approved' | 'declined') {
    filters.value.status = status
    filters.value.page = 1
    fetchUpdates()
  }

  function setPage(page: number) {
    filters.value.page = page
    fetchUpdates()
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.page = 1
    fetchUpdates()
  }

  return {
    updates,
    loading,
    submitting,
    error,
    filters,
    pagination,
    fetchUpdates,
    setStatusFilter,
    setPage,
    setLimit,
  }
})