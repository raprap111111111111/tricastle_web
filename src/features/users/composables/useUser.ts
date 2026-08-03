// src/features/users/composables/useUser.ts

import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useUserStore } from '../stores/user.store'
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types'

export function useUser() {
  const store = useUserStore()
  const toast = useToast()

  // ─── Dialog State ────────────────────────────────────
  const showDeleteDialog = ref(false)
  const showRoleDialog   = ref(false)
  const selectedUser     = ref<User | null>(null)

  function openDelete(user: User) {
    selectedUser.value     = user
    showDeleteDialog.value = true
  }

  function openRoleAssign(user: User) {
    selectedUser.value   = user
    showRoleDialog.value = true
  }

  function closeAll() {
    showDeleteDialog.value = false
    showRoleDialog.value   = false
    selectedUser.value     = null
  }

  // ─── Handlers ────────────────────────────────────────
  async function handleCreate(payload: CreateUserPayload) {
    try {
      const user = await store.createUser(payload)
      toast.add({
        severity: 'success',
        summary:  'User Created',
        detail:   `${user.full_name} created successfully.`,
        life:     4000,
      })
      return user
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Create Failed',
        detail:   store.error ?? 'An unexpected error occurred.',
        life:     5000,
      })
      return null
    }
  }

  async function handleUpdate(id: number, payload: UpdateUserPayload) {
    try {
      const user = await store.updateUser(id, payload)
      toast.add({
        severity: 'success',
        summary:  'User Updated',
        detail:   `${user.full_name} updated successfully.`,
        life:     4000,
      })
      return user
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Update Failed',
        detail:   store.error ?? 'An unexpected error occurred.',
        life:     5000,
      })
      return null
    }
  }

  async function handleDelete(id: number) {
    try {
      await store.deleteUser(id)
      toast.add({
        severity: 'success',
        summary:  'User Deleted',
        detail:   'The user has been removed.',
        life:     4000,
      })
      closeAll()
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Delete Failed',
        detail:   'An unexpected error occurred.',
        life:     5000,
      })
    }
  }

  async function handleToggleActive(user: User) {
    try {
      await store.toggleActive(user.id)
      toast.add({
        severity: 'success',
        summary:  user.is_active ? 'Deactivated' : 'Activated',
        detail:   `${user.full_name} is now ${user.is_active ? 'inactive' : 'active'}.`,
        life:     3000,
      })
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Failed',
        detail:   'Could not toggle user status.',
        life:     4000,
      })
    }
  }

  async function handleAssignRoles(id: number, roles: string[]) {
    try {
      const user = await store.assignRoles(id, roles)
      toast.add({
        severity: 'success',
        summary:  'Roles Assigned',
        detail:   `Roles updated for ${user.full_name}.`,
        life:     3000,
      })
      closeAll()
      return user
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Failed',
        detail:   'Could not assign roles.',
        life:     4000,
      })
      return null
    }
  }

  return {
    store,
    // dialog state
    showDeleteDialog, showRoleDialog, selectedUser,
    // dialog helpers
    openDelete, openRoleAssign, closeAll,
    // handlers
    handleCreate, handleUpdate, handleDelete,
    handleToggleActive, handleAssignRoles,
  }
}