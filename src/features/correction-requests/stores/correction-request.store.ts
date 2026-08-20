// src/features/correction-requests/stores/correction-request.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { correctionRequestApi } from '../api/correction-request.api'
import type {
  CorrectionRequest,
  CreateCorrectionRequestPayload,
  UpdateCorrectionRequestPayload,
  ApprovePayload,
  RejectPayload,
  CompletePayload,
  CancelPayload,
  CorrectionRequestListParams,
} from '../types'

export const useCorrectionRequestStore = defineStore('correctionRequest', () => {
  const records = ref<CorrectionRequest[]>([])
  const current = ref<CorrectionRequest | null>(null)
  const total = ref(0)
  const loading = ref(false)
  const submitting = ref(false)

  async function fetchAll(params?: CorrectionRequestListParams) {
    loading.value = true
    try {
      const res = await correctionRequestApi.getAll(params)
      const data = res.data?.data
      records.value = data?.records ?? []
      total.value = data?.total ?? 0
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    loading.value = true
    try {
      const res = await correctionRequestApi.getOne(id)
      current.value = res.data?.data ?? null
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreateCorrectionRequestPayload) {
    submitting.value = true
    try {
      const res = await correctionRequestApi.create(payload)
      const created = res.data?.data
      if (created) records.value.unshift(created)
      return created
    } finally {
      submitting.value = false
    }
  }

  async function update(id: number, payload: UpdateCorrectionRequestPayload) {
    submitting.value = true
    try {
      const res = await correctionRequestApi.update(id, payload)
      const updated = res.data?.data
      if (updated) {
        const idx = records.value.findIndex((r) => r.id === id)
        if (idx !== -1) records.value[idx] = updated
        if (current.value?.id === id) current.value = updated
      }
      return updated
    } finally {
      submitting.value = false
    }
  }

  async function remove(id: number) {
    submitting.value = true
    try {
      await correctionRequestApi.delete(id)
      records.value = records.value.filter((r) => r.id !== id)
      if (current.value?.id === id) current.value = null
    } finally {
      submitting.value = false
    }
  }

  async function approve(id: number, payload: ApprovePayload) {
    submitting.value = true
    try {
      const res = await correctionRequestApi.approve(id, payload)
      return patchRecord(id, res.data?.data)
    } finally {
      submitting.value = false
    }
  }

  async function reject(id: number, payload: RejectPayload) {
    submitting.value = true
    try {
      const res = await correctionRequestApi.reject(id, payload)
      return patchRecord(id, res.data?.data)
    } finally {
      submitting.value = false
    }
  }

  async function complete(id: number, payload: CompletePayload) {
    submitting.value = true
    try {
      const res = await correctionRequestApi.complete(id, payload)
      return patchRecord(id, res.data?.data)
    } finally {
      submitting.value = false
    }
  }

  async function cancel(id: number, payload: CancelPayload) {
    submitting.value = true
    try {
      const res = await correctionRequestApi.cancel(id, payload)
      return patchRecord(id, res.data?.data)
    } finally {
      submitting.value = false
    }
  }

  function patchRecord(
    id: number,
    updated: CorrectionRequest | undefined,
  ): CorrectionRequest | undefined {
    if (!updated) return
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx !== -1) records.value[idx] = updated
    if (current.value?.id === id) current.value = updated
    return updated
  }

  function reset() {
    records.value = []
    current.value = null
    total.value = 0
    loading.value = false
    submitting.value = false
  }

  return {
    records,
    current,
    total,
    loading,
    submitting,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    approve,
    reject,
    complete,
    cancel,
    reset,
  }
})