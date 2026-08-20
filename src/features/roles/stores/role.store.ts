// src/features/roles/stores/role.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { roleApi } from '../api/role.api'
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
  SyncPermissionsPayload,
  RoleFilters,
  Pagination,
} from '../types'

const defaultFilters = (): RoleFilters => ({
  search: '',
  is_system: null,
  guard_name: null,
  offset: 0,
  limit: 10,
  order_by: 'name',
  order_dir: 'asc',
})

function cleanParams(obj: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (val === '' || val === null || val === undefined) continue
    out[key] = typeof val === 'boolean' ? (val ? 1 : 0) : val
  }
  return out
}

export const useRoleStore = defineStore('role', () => {
  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────
  const roles = ref<Role[]>([])
  const selectedRole = ref<Role | null>(null)
  const permissions = ref<Permission[]>([])
  const pagination = ref<Pagination | null>(null)
  const filters = ref<RoleFilters>(defaultFilters())
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  // ─────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────
  const totalRoles = computed(
    () => pagination.value?.total ?? roles.value.length,
  )

  const systemRoles = computed(() =>
    roles.value.filter((r) => r.is_system),
  )

  const editableRoles = computed(() =>
    roles.value.filter((r) => !r.is_system),
  )

  const getRoleById = computed(
    () => (id: number) => roles.value.find((r) => r.id === id) ?? null,
  )

  // ─────────────────────────────────────────────
  // Filters / pagination
  // ─────────────────────────────────────────────
  function setFilters(partial: Partial<RoleFilters>) {
    filters.value = {
      ...filters.value,
      ...partial,
      offset: partial.offset ?? 0,
    }
  }

  function resetFilters() {
    filters.value = defaultFilters()
  }

  function setPage(page: number) {
    const limit = filters.value.limit || 10
    filters.value.offset = (page - 1) * limit
  }

  function setLimit(limit: number) {
    filters.value.limit = limit
    filters.value.offset = 0
  }

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────
  async function fetchRoles() {
    loading.value = true
    error.value = null
    try {
      const params = cleanParams({ ...filters.value })
      const res: any = await roleApi.getAll(params)

      // Support both { data: Role[] } and paginated { records, total, ... }
      const body = res?.data ?? res
      roles.value = body?.records ?? body?.data ?? (Array.isArray(body) ? body : [])

      if (body?.total !== undefined) {
        const total = Number(body.total)
        const offset = Number(body.offset ?? filters.value.offset)
        const limit = Number(body.limit ?? body.per_page ?? filters.value.limit)
        pagination.value = {
          total,
          offset,
          limit,
          per_page: limit,
          current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
          last_page: limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1,
          from: total > 0 ? offset + 1 : 0,
          to: Math.min(offset + limit, total),
        }
      } else {
        pagination.value = null
      }
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch roles'
      roles.value = []
      pagination.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRole(id: number) {
    loading.value = true
    error.value = null
    try {
      const res: any = await roleApi.getById(id)
      const data = res?.data ?? res
      selectedRole.value = data

      const index = roles.value.findIndex((r) => r.id === id)
      if (index !== -1) roles.value[index] = data

      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch role'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createRole(payload: CreateRolePayload) {
    submitting.value = true
    error.value = null
    try {
      const res: any = await roleApi.create(payload)
      const data = res?.data ?? res
      await fetchRoles() // refresh list with current filters
      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to create role'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function updateRole(id: number, payload: UpdateRolePayload) {
    submitting.value = true
    error.value = null
    try {
      const res: any = await roleApi.update(id, payload)
      const data = res?.data ?? res
      const index = roles.value.findIndex((r) => r.id === id)
      if (index !== -1) roles.value[index] = data
      if (selectedRole.value?.id === id) selectedRole.value = data
      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to update role'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function deleteRole(id: number) {
    submitting.value = true
    error.value = null
    try {
      await roleApi.remove(id)
      roles.value = roles.value.filter((r) => r.id !== id)
      if (selectedRole.value?.id === id) selectedRole.value = null
      if (pagination.value) {
        pagination.value.total = Math.max(0, pagination.value.total - 1)
      }
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to delete role'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function syncPermissions(id: number, payload: SyncPermissionsPayload) {
    submitting.value = true
    error.value = null
    try {
      const res: any = await roleApi.syncPermissions(id, payload)
      const data = res?.data ?? res
      const index = roles.value.findIndex((r) => r.id === id)
      if (index !== -1) roles.value[index] = data
      if (selectedRole.value?.id === id) selectedRole.value = data
      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to sync permissions'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function fetchPermissions(id: number) {
    loading.value = true
    error.value = null
    try {
      const res: any = await roleApi.getPermissions(id)
      const data = res?.data ?? res
      permissions.value = data?.permissions ?? data ?? []
      return data
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch permissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setSelectedRole(role: Role | null) {
    selectedRole.value = role
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    roles,
    selectedRole,
    permissions,
    pagination,
    filters,
    loading,
    submitting,
    error,
    // Getters
    totalRoles,
    systemRoles,
    editableRoles,
    getRoleById,
    // Filters
    setFilters,
    resetFilters,
    setPage,
    setLimit,
    // Actions
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
    syncPermissions,
    fetchPermissions,
    setSelectedRole,
    clearError,
  }
})