import { computed } from 'vue'
import { useAuthStore } from '@features/auth/stores/auth.store'
import type { Permission } from '@shared/constants/permissions'

export function usePermissions() {
  const authStore = useAuthStore()

  const permissions = computed<string[]>(() => authStore.user?.permissions ?? [])
  const roles       = computed<string[]>(() => authStore.user?.roles ?? [])
  const role        = computed(() => roles.value[0] ?? 'guest')
  const isSuperAdmin = computed(() => roles.value.includes('super_admin'))

  function can(perm: Permission | string): boolean {
    if (isSuperAdmin.value) return true
    return permissions.value.includes(perm)
  }

  function canAny(perms: (Permission | string)[]): boolean {
    if (isSuperAdmin.value) return true
    if (!perms.length) return true
    return perms.some((p) => permissions.value.includes(p))
  }

  function canAll(perms: (Permission | string)[]): boolean {
    if (isSuperAdmin.value) return true
    return perms.every((p) => permissions.value.includes(p))
  }

  function hasRole(roleName: string): boolean {
    return roles.value.includes(roleName)
  }

  return { permissions, roles, role, isSuperAdmin, can, canAny, canAll, hasRole }
}