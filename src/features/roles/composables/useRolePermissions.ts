// src/features/roles/composables/useRolePermissions.ts
import { ref, computed, reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRoleStore } from '../stores/role.store'
import { permissionApi } from '@/features/permissions/api/permission.api'
import type { Permission, Role } from '../types'

const allPermissions = ref<Permission[]>([])
/** canonical permission name → checked */
const checkedMap = reactive<Record<string, boolean>>({})
const loadingAll = ref(false)

function permissionKey(name: string | null | undefined): string {
  return String(name ?? '').trim().toLowerCase()
}

function clearCheckedMap() {
  for (const key of Object.keys(checkedMap)) {
    delete checkedMap[key]
  }
}

export function useRolePermissions() {
  const store = useRoleStore()
  const toast = useToast()

  const selectedPermissions = computed(() =>
    allPermissions.value
      .filter((p) => checkedMap[permissionKey(p.name)])
      .map((p) => p.name),
  )

  const groupedPermissions = computed<Record<string, Permission[]>>(() => {
    const groups: Record<string, Permission[]> = {}
    for (const perm of allPermissions.value) {
      if (!perm?.name) continue
      const module = perm.module ?? perm.name.split('.')[0] ?? 'general'
      if (!groups[module]) groups[module] = []
      groups[module].push(perm)
    }
    return groups
  })

  const groupNames = computed(() =>
    Object.keys(groupedPermissions.value).sort(),
  )

  function isPermissionSelected(name: string): boolean {
    return !!checkedMap[permissionKey(name)]
  }

  function isGroupSelected(module: string): boolean {
    const group = groupedPermissions.value[module] ?? []
    return group.length > 0 && group.every((p) => isPermissionSelected(p.name))
  }

  function isGroupIndeterminate(module: string): boolean {
    const group = groupedPermissions.value[module] ?? []
    const n = group.filter((p) => isPermissionSelected(p.name)).length
    return n > 0 && n < group.length
  }

  function togglePermission(name: string): void {
    const key = permissionKey(name)
    checkedMap[key] = !checkedMap[key]
  }

  function toggleGroup(module: string): void {
    const group = groupedPermissions.value[module] ?? []
    const next = !isGroupSelected(module)
    for (const p of group) {
      checkedMap[permissionKey(p.name)] = next
    }
  }

  function selectAll(): void {
    for (const p of allPermissions.value) {
      checkedMap[permissionKey(p.name)] = true
    }
  }

  function deselectAll(): void {
    for (const p of allPermissions.value) {
      checkedMap[permissionKey(p.name)] = false
    }
  }

  /**
   * Load all permissions + this role's permissions, then pre-check.
   */
  async function loadRolePermissions(role: Role): Promise<void> {
    loadingAll.value = true
    clearCheckedMap()

    try {
      const [allRes, roleRes] = await Promise.all([
        permissionApi.getAll({
          limit: 1000,
          order_by: 'name',
          order_dir: 'asc',
        }),
        store.fetchPermissions(role.id),
      ])

      // Unwrap list of all permissions (handle several response shapes)
      const rawAll =
        (allRes as any)?.data?.records ??
        (allRes as any)?.data?.data ??
        (allRes as any)?.data ??
        (allRes as any)?.records ??
        allRes

      const list: Permission[] = Array.isArray(rawAll) ? rawAll : []
      allPermissions.value = list

      // Role permissions from API
      const rolePerms: Permission[] = Array.isArray((roleRes as any)?.permissions)
        ? (roleRes as any).permissions
        : Array.isArray((roleRes as any)?.data?.permissions)
          ? (roleRes as any).data.permissions
          : Array.isArray(role.permissions)
            ? role.permissions
            : []

      const byId = new Map(list.map((p) => [Number(p.id), p]))
      const byName = new Map(list.map((p) => [permissionKey(p.name), p]))

      // Start everything unchecked
      for (const p of list) {
        checkedMap[permissionKey(p.name)] = false
      }

      // Pre-check role permissions
      for (const rp of rolePerms) {
        const matched =
          byId.get(Number((rp as any).id)) ??
          byName.get(permissionKey((rp as any).name ?? rp))

        if (matched) {
          checkedMap[permissionKey(matched.name)] = true
        } else if (typeof rp === 'string') {
          // API returned plain names
          const m = byName.get(permissionKey(rp))
          if (m) checkedMap[permissionKey(m.name)] = true
        }
      }
    } catch (err: any) {
      allPermissions.value = []
      clearCheckedMap()
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.message ?? 'Failed to load permissions',
        life: 4000,
      })
    } finally {
      loadingAll.value = false
    }
  }

  async function handleSync(role: Role): Promise<boolean> {
    try {
      await store.syncPermissions(role.id, {
        permissions: selectedPermissions.value,
      })
      toast.add({
        severity: 'success',
        summary: 'Permissions Synced',
        detail: `Permissions for "${role.name}" updated successfully.`,
        life: 4000,
      })
      return true
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Sync Failed',
        detail: err?.response?.data?.message ?? 'Failed to sync permissions',
        life: 5000,
      })
      return false
    }
  }

  function reset(): void {
    allPermissions.value = []
    clearCheckedMap()
    loadingAll.value = false
  }

  return {
    allPermissions,
    selectedPermissions,
    checkedMap,
    groupedPermissions,
    groupNames,
    loadingAll,
    isPermissionSelected,
    isGroupSelected,
    isGroupIndeterminate,
    togglePermission,
    toggleGroup,
    selectAll,
    deselectAll,
    loadRolePermissions,
    handleSync,
    reset,
  }
}