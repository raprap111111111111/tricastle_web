import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { permissionApi } from '../api/permission.api'
import type {
  Permission,
  CreatePermissionPayload,
  UpdatePermissionPayload,
  ListPermissionsParams,
} from '../types'

export const usePermissionStore = defineStore('permission', () => {
  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────
  const permissions        = ref<Permission[]>([])
  const groupedPermissions = ref<Record<string, Permission[]>>({})
  const selectedPermission = ref<Permission | null>(null)

  const loading    = ref(false)
  const submitting = ref(false)
  const error      = ref<string | null>(null)

  // Pagination meta
  const pagination = ref({
    current_page: 1,
    per_page:     10,
    total:        0,
    last_page:    1,
  })

  // ─────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────
  const totalPermissions = computed(() => pagination.value.total)

  const moduleNames = computed(() =>
    Object.keys(groupedPermissions.value).sort()
  )

  const totalModules = computed(() => moduleNames.value.length)

  const getPermissionById = computed(() =>
    (id: number) => permissions.value.find((p) => p.id === id) ?? null
  )

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────

  async function fetchPermissions(params: ListPermissionsParams = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await permissionApi.getAll(params)
      permissions.value = res.data.data
      pagination.value  = {
        current_page: res.data.current_page,
        per_page:     res.data.per_page,
        total:        res.data.total,
        last_page:    res.data.last_page,
      }
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to fetch permissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGrouped() {
    loading.value = true
    error.value   = null
    try {
      const res = await permissionApi.getGrouped()
      groupedPermissions.value = res.data
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to fetch grouped permissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchPermission(id: number) {
    loading.value = true
    error.value   = null
    try {
      const res              = await permissionApi.getById(id)
      selectedPermission.value = res.data

      const index = permissions.value.findIndex((p) => p.id === id)
      if (index !== -1) permissions.value[index] = res.data

      return res.data
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to fetch permission'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPermission(payload: CreatePermissionPayload) {
    submitting.value = true
    error.value      = null
    try {
      const res = await permissionApi.create(payload)
      permissions.value.push(res.data)
      pagination.value.total += 1
      return res.data
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to create permission'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function updatePermission(id: number, payload: UpdatePermissionPayload) {
    submitting.value = true
    error.value      = null
    try {
      const res   = await permissionApi.update(id, payload)
      const index = permissions.value.findIndex((p) => p.id === id)
      if (index !== -1) permissions.value[index] = res.data
      if (selectedPermission.value?.id === id) selectedPermission.value = res.data
      return res.data
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to update permission'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function deletePermission(id: number) {
    submitting.value = true
    error.value      = null
    try {
      await permissionApi.remove(id)
      permissions.value = permissions.value.filter((p) => p.id !== id)
      pagination.value.total = Math.max(0, pagination.value.total - 1)
      if (selectedPermission.value?.id === id) selectedPermission.value = null
    } catch (err: any) {
      error.value = err?.message ?? 'Failed to delete permission'
      throw err
    } finally {
      submitting.value = false
    }
  }

  function setSelectedPermission(permission: Permission | null) {
    selectedPermission.value = permission
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    permissions,
    groupedPermissions,
    selectedPermission,
    loading,
    submitting,
    error,
    pagination,
    // Getters
    totalPermissions,
    moduleNames,
    totalModules,
    getPermissionById,
    // Actions
    fetchPermissions,
    fetchGrouped,
    fetchPermission,
    createPermission,
    updatePermission,
    deletePermission,
    setSelectedPermission,
    clearError,
  }
})