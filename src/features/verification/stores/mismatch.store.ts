import { defineStore } from 'pinia'
import { ref } from 'vue'
import { verificationMismatchApi } from '../api/verification-mismatch.api'
import type {
  VerificationMismatch,
  ResolveMismatchDto,
  WaiveMismatchDto,
  EscalateMismatchDto,
} from '../types'

export const useMismatchStore = defineStore('verification-mismatch', () => {
  const items = ref<VerificationMismatch[]>([])
  const submitting = ref(false)

  async function fetchByVerification(verificationId: number) {
    const res = await verificationMismatchApi.list({
      document_verification_id: verificationId,
      limit: 100,
      sort_by: 'created_at',
      sort_dir: 'asc',
    })
    items.value = res.data
    return items.value
  }

  async function resolve(id: number, payload: ResolveMismatchDto) {
    submitting.value = true
    try {
      const updated = await verificationMismatchApi.resolve(id, payload)
      replaceLocal(updated)
      return updated
    } finally {
      submitting.value = false
    }
  }

  async function waive(id: number, payload: WaiveMismatchDto) {
    submitting.value = true
    try {
      const updated = await verificationMismatchApi.waive(id, payload)
      replaceLocal(updated)
      return updated
    } finally {
      submitting.value = false
    }
  }

  async function escalate(id: number, payload: EscalateMismatchDto) {
    submitting.value = true
    try {
      const updated = await verificationMismatchApi.escalate(id, payload)
      replaceLocal(updated)
      return updated
    } finally {
      submitting.value = false
    }
  }

  function replaceLocal(m: VerificationMismatch) {
    if (!m?.id) return
    const idx = items.value.findIndex((i) => i.id === m.id)
    if (idx !== -1) items.value[idx] = m
  }

  return { items, submitting, fetchByVerification, resolve, waive, escalate }
})