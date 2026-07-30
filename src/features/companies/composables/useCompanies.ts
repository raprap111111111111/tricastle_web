import { useToast } from 'primevue/usetoast'
import { useCompanyStore } from '../stores/company.store'
import type { CompanyPayload } from '../types'

export function useCompanies() {
  const store = useCompanyStore()
  const toast = useToast()

  async function handleCreate(payload: CompanyPayload) {
    try {
      const created = await store.createCompany(payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Company "${created.name}" created successfully.`,
        life: 3000,
      })
      return created
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to create company.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleUpdate(id: number, payload: Partial<CompanyPayload>) {
    try {
      const updated = await store.updateCompany(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Company "${updated.name}" updated successfully.`,
        life: 3000,
      })
      return updated
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to update company.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleDelete(id: number) {
    try {
      await store.deleteCompany(id)
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Company deleted successfully.',
        life: 3000,
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to delete company.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleToggleStatus(id: number) {
    try {
      const updated = await store.toggleStatus(id)
      toast.add({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Company is now ${updated.is_active ? 'active' : 'inactive'}.`,
        life: 3000,
      })
      return updated
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to toggle status.',
        life: 4000,
      })
      throw e
    }
  }

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
  }
}