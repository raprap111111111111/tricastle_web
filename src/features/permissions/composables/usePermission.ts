import { useToast } from 'primevue/usetoast'
import { usePermissionStore } from '../stores/permission.store'
import type {
  CreatePermissionPayload,
  UpdatePermissionPayload,
  ListPermissionsParams,
  Permission,
} from '../types'

export function usePermission() {
  const store = usePermissionStore()
  const toast = useToast()

  async function loadPermissions(params: ListPermissionsParams = {}) {
    try {
      await store.fetchPermissions(params)
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Error',
        detail:   'Failed to load permissions',
        life:     4000,
      })
    }
  }

  async function loadGrouped() {
    try {
      await store.fetchGrouped()
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Error',
        detail:   'Failed to load grouped permissions',
        life:     4000,
      })
    }
  }

  async function handleCreate(payload: CreatePermissionPayload): Promise<Permission | null> {
    try {
      const permission = await store.createPermission(payload)
      toast.add({
        severity: 'success',
        summary:  'Permission Created',
        detail:   `"${permission.name}" has been created successfully.`,
        life:     4000,
      })
      return permission
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to create permission'
      toast.add({
        severity: 'error',
        summary:  'Create Failed',
        detail:   message,
        life:     5000,
      })
      return null
    }
  }

  async function handleUpdate(id: number, payload: UpdatePermissionPayload): Promise<Permission | null> {
    try {
      const permission = await store.updatePermission(id, payload)
      toast.add({
        severity: 'success',
        summary:  'Permission Updated',
        detail:   `"${permission.name}" has been updated successfully.`,
        life:     4000,
      })
      return permission
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to update permission'
      toast.add({
        severity: 'error',
        summary:  'Update Failed',
        detail:   message,
        life:     5000,
      })
      return null
    }
  }

  async function handleDelete(permission: Permission): Promise<boolean> {
    try {
      await store.deletePermission(permission.id)
      toast.add({
        severity: 'success',
        summary:  'Permission Deleted',
        detail:   `"${permission.name}" has been deleted successfully.`,
        life:     4000,
      })
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to delete permission'
      toast.add({
        severity: 'error',
        summary:  'Delete Failed',
        detail:   message,
        life:     5000,
      })
      return false
    }
  }

  return {
    store,
    loadPermissions,
    loadGrouped,
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}