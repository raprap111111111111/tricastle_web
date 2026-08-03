// src/features/users/stores/user.store.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '../api/user.api'
import type {
  User,
  UserFilters,
  Pagination,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types'

const DEFAULT_FILTERS: UserFilters = {
  offset:    0,
  limit:     10,
  order_by:  'created_at',
  order_dir: 'desc',
}

export const useUserStore = defineStore('user', () => {
  // ─── State ───────────────────────────────────────────
  const users        = ref<User[]>([])
  const selected     = ref<User | null>(null)
  const pagination   = ref<Pagination | null>(null)
  const filters      = ref<UserFilters>({ ...DEFAULT_FILTERS })
  const loading      = ref(false)
  const submitting   = ref(false)
  const error        = ref<string | null>(null)

  // ─── Computed ────────────────────────────────────────
  const totalUsers    = computed(() => pagination.value?.total ?? 0)
  const activeCount   = computed(() => users.value.filter(u =>  u.is_active).length)
  const inactiveCount = computed(() => users.value.filter(u => !u.is_active).length)
  const lockedCount   = computed(() => users.value.filter(u =>  u.is_locked).length)

  // ─── Actions ─────────────────────────────────────────
  async function fetchUsers() {
    loading.value = true
    error.value   = null
    try {
      const res = await userApi.getAll(filters.value)
      const d   = res.data

      users.value = d.records
      pagination.value = {
        total:        d.total,
        offset:       d.offset,
        limit:        d.limit,
        per_page:     d.per_page,
        current_page: d.current_page,
        last_page:    d.last_page,
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to load users.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(id: number) {
    loading.value = true
    try {
      const res = await userApi.getOne(id)
      selected.value = res.data
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload: CreateUserPayload) {
    submitting.value = true
    error.value      = null
    try {
      const res = await userApi.create(payload)
      users.value.unshift(res.data)
      if (pagination.value) pagination.value.total++
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to create user.'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function updateUser(id: number, payload: UpdateUserPayload) {
    submitting.value = true
    error.value      = null
    try {
      const res = await userApi.update(id, payload)
      updateInList(res.data)
      selected.value = res.data
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to update user.'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function deleteUser(id: number) {
    submitting.value = true
    try {
      await userApi.delete(id)
      users.value = users.value.filter(u => u.id !== id)
      if (pagination.value) pagination.value.total--
    } finally {
      submitting.value = false
    }
  }

  async function toggleActive(id: number) {
    submitting.value = true
    try {
      const res = await userApi.toggleActive(id)
      updateInList(res.data)
      return res.data
    } finally {
      submitting.value = false
    }
  }

  async function assignRoles(id: number, roles: string[]) {
    submitting.value = true
    try {
      const res = await userApi.assignRoles(id, roles)
      updateInList(res.data)
      return res.data
    } finally {
      submitting.value = false
    }
  }

  // ─── Helpers ─────────────────────────────────────────
  function updateInList(updated: User) {
    const idx = users.value.findIndex(u => u.id === updated.id)
    if (idx !== -1) users.value[idx] = updated
  }

  function setFilters(incoming: Partial<UserFilters>) {
    filters.value = { ...filters.value, ...incoming, offset: 0 }
    fetchUsers()
  }

  function resetFilters() {
    filters.value = { ...DEFAULT_FILTERS }
    fetchUsers()
  }

  function setPage(page: number) {
    filters.value.offset = (page - 1) * filters.value.limit
    fetchUsers()
  }

  function setLimit(limit: number) {
    filters.value = { ...filters.value, limit, offset: 0 }
    fetchUsers()
  }

  return {
    // state
    users, selected, pagination, filters, loading, submitting, error,
    // computed
    totalUsers, activeCount, inactiveCount, lockedCount,
    // actions
    fetchUsers, fetchUser,
    createUser, updateUser, deleteUser,
    toggleActive, assignRoles,
    setFilters, resetFilters, setPage, setLimit,
  }
})