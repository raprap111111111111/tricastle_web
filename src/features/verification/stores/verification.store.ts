import { defineStore } from 'pinia'
import { ref } from 'vue'
import { documentVerificationApi } from '../api/document-verification.api'
import type {
  DocumentVerification,
  VerificationFilters,
  CompleteVerificationDto,
  RejectVerificationDto,
  Pagination,
} from '../types'

export const useVerificationStore = defineStore('verification', () => {
  const verifications = ref<DocumentVerification[]>([])
  const verification = ref<DocumentVerification | null>(null)
  const pagination = ref<Pagination | null>(null)
  const loading = ref(false)
  const submitting = ref(false)

  const filters = ref<VerificationFilters>({
    search: '',
    status: '',
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_dir: 'desc',
  })

  // ─── Filter helpers ─────────────────────────────────
  function setFilters(patch: Partial<VerificationFilters>) {
    filters.value = { ...filters.value, ...patch, page: 1 }
  }

  function setPage(page: number) {
    filters.value.page = page
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.page = 1
  }

  function resetFilters() {
    filters.value = {
      search: '',
      status: '',
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_dir: 'desc',
    }
  }

  function clearVerification() {
    verification.value = null
  }

  // ─── Fetch ──────────────────────────────────────────
  async function fetchVerifications() {
    loading.value = true
    try {
      const res = await documentVerificationApi.list(filters.value)
      verifications.value = res.data
      pagination.value = res.meta ?? res.pagination ?? null
    } finally {
      loading.value = false
    }
  }

  async function fetchVerification(id: number) {
    loading.value = true
    try {
      verification.value = await documentVerificationApi.get(id)
    } finally {
      loading.value = false
    }
  }

  // ─── Actions ────────────────────────────────────────
  async function startVerification(id: number) {
    submitting.value = true
    try {
      const updated = await documentVerificationApi.start(id)
      updateInList(updated)
      verification.value = updated
      return updated
    } finally {
      submitting.value = false
    }
  }

  async function completeVerification(id: number, payload: CompleteVerificationDto) {
    submitting.value = true
    try {
      const updated = await documentVerificationApi.complete(id, payload)
      updateInList(updated)
      verification.value = updated
      return updated
    } finally {
      submitting.value = false
    }
  }

  async function approveVerification(id: number, notes?: string) {
    submitting.value = true
    try {
      const updated = await documentVerificationApi.approve(id, notes)
      updateInList(updated)
      verification.value = updated
      return updated
    } finally {
      submitting.value = false
    }
  }

  async function rejectVerification(id: number, payload: RejectVerificationDto) {
    submitting.value = true
    try {
      const updated = await documentVerificationApi.reject(id, payload)
      updateInList(updated)
      verification.value = updated
      return updated
    } finally {
      submitting.value = false
    }
  }

  function updateInList(v: DocumentVerification) {
    const idx = verifications.value.findIndex((x) => x.id === v.id)
    if (idx !== -1) verifications.value[idx] = v
  }

  return {
    verifications, verification, pagination, loading, submitting, filters,
    setFilters, setPage, setLimit, resetFilters, clearVerification,
    fetchVerifications, fetchVerification,
    startVerification, completeVerification, approveVerification, rejectVerification,
  }
})