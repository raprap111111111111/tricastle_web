// src/features/verification-mismatches/stores/verification-mismatch.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { verificationMismatchApi } from '../api/verification-mismatch.api'
import type {
  VerificationMismatch,
  VerificationMismatchListParams,
  CreateVerificationMismatchPayload,
  UpdateVerificationMismatchPayload,
  ResolvePayload,
  WaivePayload,
  EscalatePayload,
} from '../types'

function unwrapList(res: any) {
  const raw = res?.data ?? res
  const records = raw?.data ?? raw?.records ?? []
  const meta = raw?.meta ?? {
    total: raw?.total ?? records.length,
    current_page: raw?.current_page ?? 1,
    per_page: raw?.per_page ?? records.length,
  }
  return { records, meta }
}

export const useVerificationMismatchStore = defineStore(
  'verification-mismatch',
  () => {
    // ─── State ────────────────────────────────
    const records = ref<VerificationMismatch[]>([])
    const current = ref<VerificationMismatch | null>(null)
    const total = ref(0)
    const currentPage = ref(1)
    const perPage = ref(10)

    const loading = ref(false)
    const submitting = ref(false)
    const error = ref<string | null>(null)

    // ─── Getters ──────────────────────────────
    const criticalCount = computed(
      () => records.value.filter((r) => r.severity === 'critical').length,
    )
    const openCount = computed(
      () => records.value.filter((r) => r.status === 'open').length,
    )
    const resolvedCount = computed(
      () => records.value.filter((r) => r.status === 'corrected').length,
    )
    const escalatedCount = computed(
      () => records.value.filter((r) => r.status === 'escalated').length,
    )
    const waivedCount = computed(
      () => records.value.filter((r) => r.status === 'waived').length,
    )

    // ─── Actions ──────────────────────────────
    async function fetchAll(params: VerificationMismatchListParams = {}) {
      loading.value = true
      error.value = null
      try {
        const res = await verificationMismatchApi.getAll(params)
        const { records: r, meta } = unwrapList(res)
        records.value = r
        total.value = meta.total ?? 0
        currentPage.value = meta.current_page ?? 1
        perPage.value = meta.per_page ?? 10
      } catch (err: any) {
        error.value = err?.message ?? 'Failed to fetch mismatches'
        throw err
      } finally {
        loading.value = false
      }
    }

    async function fetchOne(id: number) {
      loading.value = true
      try {
        const res = await verificationMismatchApi.getOne(id)
        current.value = (res as any).data?.data ?? (res as any).data
        return current.value
      } finally {
        loading.value = false
      }
    }

    async function create(payload: CreateVerificationMismatchPayload) {
      submitting.value = true
      try {
        const res = await verificationMismatchApi.create(payload)
        const created = (res as any).data?.data ?? (res as any).data
        records.value.unshift(created)
        total.value += 1
        return created
      } finally {
        submitting.value = false
      }
    }

    async function update(id: number, payload: UpdateVerificationMismatchPayload) {
      submitting.value = true
      try {
        const res = await verificationMismatchApi.update(id, payload)
        const updated = (res as any).data?.data ?? (res as any).data
        const idx = records.value.findIndex((r) => r.id === id)
        if (idx !== -1) records.value[idx] = updated
        if (current.value?.id === id) current.value = updated
        return updated
      } finally {
        submitting.value = false
      }
    }

    async function remove(id: number) {
      submitting.value = true
      try {
        await verificationMismatchApi.delete(id)
        records.value = records.value.filter((r) => r.id !== id)
        total.value = Math.max(0, total.value - 1)
      } finally {
        submitting.value = false
      }
    }

    async function resolve(id: number, payload: ResolvePayload) {
      submitting.value = true
      try {
        const res = await verificationMismatchApi.resolve(id, payload)
        const updated = (res as any).data?.data ?? (res as any).data
        const idx = records.value.findIndex((r) => r.id === id)
        if (idx !== -1) records.value[idx] = updated
        return updated
      } finally {
        submitting.value = false
      }
    }

    async function waive(id: number, payload: WaivePayload) {
      submitting.value = true
      try {
        const res = await verificationMismatchApi.waive(id, payload)
        const updated = (res as any).data?.data ?? (res as any).data
        const idx = records.value.findIndex((r) => r.id === id)
        if (idx !== -1) records.value[idx] = updated
        return updated
      } finally {
        submitting.value = false
      }
    }

    async function escalate(id: number, payload: EscalatePayload) {
      submitting.value = true
      try {
        const res = await verificationMismatchApi.escalate(id, payload)
        const updated = (res as any).data?.data ?? (res as any).data
        const idx = records.value.findIndex((r) => r.id === id)
        if (idx !== -1) records.value[idx] = updated
        return updated
      } finally {
        submitting.value = false
      }
    }

    return {
      // State
      records,
      current,
      total,
      currentPage,
      perPage,
      loading,
      submitting,
      error,
      // Getters
      criticalCount,
      openCount,
      resolvedCount,
      escalatedCount,
      waivedCount,
      // Actions
      fetchAll,
      fetchOne,
      create,
      update,
      remove,
      resolve,
      waive,
      escalate,
    }
  },
)