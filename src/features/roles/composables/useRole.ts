// src/features/roles/composables/useRole.ts
import { useToast } from 'primevue/usetoast'
import { useRoleStore } from '../stores/role.store'
import type { CreateRolePayload, UpdateRolePayload, Role } from '../types'

export function useRole() {
  const store = useRoleStore()
  const toast = useToast()

  // ─────────────────────────────────────────────
  // List
  // ─────────────────────────────────────────────
  async function loadRoles(): Promise<void> {
    try {
      await store.fetchRoles()
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load roles',
        life: 4000,
      })
    }
  }

  // ─────────────────────────────────────────────
  // Create
  // ─────────────────────────────────────────────
  async function handleCreate(payload: CreateRolePayload): Promise<Role | null> {
    try {
      const role = await store.createRole(payload)
      toast.add({
        severity: 'success',
        summary: 'Role Created',
        detail: `"${role.name}" has been created successfully.`,
        life: 4000,
      })
      return role
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to create role'
      toast.add({
        severity: 'error',
        summary: 'Create Failed',
        detail: message,
        life: 5000,
      })
      return null
    }
  }

  // ─────────────────────────────────────────────
  // Update
  // ─────────────────────────────────────────────
  async function handleUpdate(id: number, payload: UpdateRolePayload): Promise<Role | null> {
    try {
      const role = await store.updateRole(id, payload)
      toast.add({
        severity: 'success',
        summary: 'Role Updated',
        detail: `"${role.name}" has been updated successfully.`,
        life: 4000,
      })
      return role
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to update role'
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: message,
        life: 5000,
      })
      return null
    }
  }

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────
  async function handleDelete(role: Role): Promise<boolean> {
    if (!role?.id) {
      toast.add({
        severity: 'error',
        summary: 'Invalid role',
        detail: 'Cannot delete - role data is missing',
        life: 4000,
      })
      return false
    }

    try {
      await store.deleteRole(role.id)
      toast.add({
        severity: 'success',
        summary: 'Role Deleted',
        detail: `"${role.name}" has been deleted successfully.`,
        life: 4000,
      })
      return true
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? 'Failed to delete role'
      toast.add({
        severity: 'error',
        summary: 'Delete Failed',
        detail: message,
        life: 5000,
      })
      return false
    }
  }

  return {
    store,
    loadRoles,
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}