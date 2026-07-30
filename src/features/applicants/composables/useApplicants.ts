import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useApplicantStore } from '../stores/applicant.store'
import type { CreateApplicantPayload, UpdateApplicantPayload } from '../types'

export function useApplicants() {
  const store  = useApplicantStore()
  const router = useRouter()
  const toast  = useToast()

  async function handleCreate(payload: CreateApplicantPayload) {
    try {
      const created = await store.createApplicant(payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Applicant created successfully',
        life: 3000,
      })
      await store.fetchApplicants()
      // Return the created applicant so wizard can continue with sub-data
      return created
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: store.error ?? 'Something went wrong',
        life: 4000,
      })
      throw new Error(store.error ?? 'Create failed')
    }
  }

  async function handleUpdate(id: number, payload: UpdateApplicantPayload) {
    try {
      await store.updateApplicant(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Applicant updated successfully',
        life: 3000,
      })
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: store.error ?? 'Something went wrong',
        life: 4000,
      })
      throw new Error(store.error ?? 'Update failed')
    }
  }

  async function handleDelete(id: number) {
    try {
      await store.deleteApplicant(id)
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Applicant deleted successfully',
        life: 3000,
      })
      await store.fetchApplicants()
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: store.error ?? 'Something went wrong',
        life: 4000,
      })
    }
  }

  function navigateToIndex() {
    router.push({ name: 'applicants.index' })
  }

  return {
    store,
    handleCreate,
    handleUpdate,
    handleDelete,
    navigateToIndex,
  }
}