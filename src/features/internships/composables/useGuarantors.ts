import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { guarantorApi } from '../api/guarantor.api'
import type { ApplicantGuarantor, SyncGuarantorsPayload } from '../types'

export function useGuarantors() {
  const toast = useToast()
  const loading = ref(false)
  const saving = ref(false)

  async function fetch(applicantId: number): Promise<ApplicantGuarantor[]> {
    loading.value = true
    try {
      const res: any = await guarantorApi.list(applicantId)
      // 🎯 Robust unwrapping: Handles both raw Axios and unwrapped responses
      const body = res?.data?.data ?? res?.data ?? res
      const array = Array.isArray(body) ? body : (body?.data ?? [])
      return array as ApplicantGuarantor[]
    } catch (err) {
      console.error('[useGuarantors] Fetch error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function sync(applicantId: number, payload: SyncGuarantorsPayload) {
    saving.value = true
    try {
      const res: any = await guarantorApi.sync(applicantId, payload)
      const body = res?.data?.data ?? res?.data ?? res
      const array = Array.isArray(body) ? body : (body?.data ?? [])

      toast.add({
        severity: 'success',
        summary: 'Guarantors Saved',
        detail: 'Guarantor records updated successfully.',
        life: 3000,
      })
      return array as ApplicantGuarantor[]
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors
      const errorMsg = validationErrors
        ? Object.values(validationErrors).flat().join(' ')
        : err?.response?.data?.message ?? err.message

      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: errorMsg || 'Could not save guarantors.',
        life: 5000,
      })
      throw err
    } finally {
      saving.value = false
    }
  }

  return { fetch, sync, loading, saving }
}