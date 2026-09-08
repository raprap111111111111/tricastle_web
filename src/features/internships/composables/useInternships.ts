import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { internshipApi } from '../api/internship.api'
import { useInternshipStore } from '../stores/internship.store'
import type {
  ChangeCompanyPayload,
  CreateInternshipPayload,
  GenerateMoaPayload,
  UpdateInternshipPayload,
} from '../types'

export function useInternships() {
  const store = useInternshipStore()
  const toast = useToast()
  const router = useRouter()

  async function handleCreate(payload: CreateInternshipPayload) {
    store.submitting = true
    try {
      const res = await internshipApi.create(payload)
      toast.add({ severity: 'success', summary: 'Internship created', life: 3000 })
      return res.data?.data
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Failed to create internship',
        detail: err?.response?.data?.message ?? err.message,
        life: 4000,
      })
      throw err
    } finally {
      store.submitting = false
    }
  }

  async function handleUpdate(id: number, payload: UpdateInternshipPayload) {
    store.submitting = true
    try {
      const res = await internshipApi.update(id, payload)
      toast.add({ severity: 'success', summary: 'Internship updated', life: 3000 })
      return res.data?.data
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Failed to update',
        detail: err?.response?.data?.message ?? err.message,
        life: 4000,
      })
      throw err
    } finally {
      store.submitting = false
    }
  }

  async function handleDelete(id: number) {
    store.submitting = true
    try {
      await internshipApi.destroy(id)
      toast.add({ severity: 'success', summary: 'Internship deleted', life: 3000 })
      await store.fetchInternships()
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Delete failed',
        detail: err?.response?.data?.message ?? err.message,
        life: 4000,
      })
    } finally {
      store.submitting = false
    }
  }

  async function handleChangeCompany(id: number, payload: ChangeCompanyPayload) {
    store.submitting = true
    try {
      const res = await internshipApi.changeCompany(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Company changed',
        detail: 'New internship record created.',
        life: 3500,
      })
      return res.data?.data
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Company change failed',
        detail: err?.response?.data?.message ?? err.message,
        life: 4500,
      })
      throw err
    } finally {
      store.submitting = false
    }
  }

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleChangeCompany,
    goToDetail: (id: number) =>
      router.push({ name: 'internships.show', params: { id } }),
  }
}