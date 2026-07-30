import { useToast } from 'primevue/usetoast'
import { useCompanyCategoryStore } from '../stores/company-category.store'
import type { CompanyCategoryPayload } from '../types'

export function useCompanyCategories() {
  const store = useCompanyCategoryStore()
  const toast = useToast()

  async function handleCreate(payload: CompanyCategoryPayload) {
    try {
      const created = await store.createCategory(payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Category "${created.name}" created.`,
        life: 3000,
      })
      return created
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to create category.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleUpdate(id: number, payload: Partial<CompanyCategoryPayload>) {
    try {
      const updated = await store.updateCategory(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Category "${updated.name}" updated.`,
        life: 3000,
      })
      return updated
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to update category.',
        life: 4000,
      })
      throw e
    }
  }

  async function handleDelete(id: number) {
    try {
      await store.deleteCategory(id)
      toast.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Category deleted successfully.',
        life: 3000,
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e?.response?.data?.message ?? 'Failed to delete category.',
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
        detail: `Category is now ${updated.is_active ? 'active' : 'inactive'}.`,
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

  return { handleCreate, handleUpdate, handleDelete, handleToggleStatus }
}