import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '@features/auth/stores/auth.store'

export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
): Promise<RouteLocationRaw | boolean | void> {
  const authStore = useAuthStore()

  const requiresAuth  = to.meta?.requiresAuth  ?? false
  const requiresGuest = to.meta?.requiresGuest ?? false
  const requiredPerms = (to.meta?.permissions as string[] | undefined) ?? []

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (requiresGuest && authStore.isAuthenticated) {
    return { name: 'Dashboard' }
  }

  if (requiresAuth && requiredPerms.length && authStore.user) {
    const userPerms    = authStore.user.permissions ?? []
    const isSuperAdmin = (authStore.user.roles ?? []).includes('super_admin')

    if (!isSuperAdmin && !requiredPerms.some((p) => userPerms.includes(p))) {
      return { name: 'Dashboard' }
    }
  }

  return true
}