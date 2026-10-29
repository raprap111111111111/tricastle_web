import type { RouteLocationNormalized, NavigationGuardReturn } from 'vue-router'
import { TOKEN_KEY as PORTAL_TOKEN_KEY } from '../services/portalApi'

export function isPortalPath(path: string): boolean {
  return path === '/portal' || path.startsWith('/portal/')
}

/**
 * Handles auth checks exclusively for /portal/* routes.
 * Returns null if the path is not a portal path.
 */
export function portalGuard(
  to: RouteLocationNormalized,
): NavigationGuardReturn | null {
  if (!isPortalPath(to.path)) {
    return null
  }

  const hasPortalToken = !!localStorage.getItem(PORTAL_TOKEN_KEY)

  // Guest portal pages (Login, Verify, Register, Forgot)
  if (to.meta.guest || to.meta.guestPortal) {
    if (hasPortalToken) {
      return { path: '/portal/dashboard', replace: true }
    }
    return true
  }

  // Protected portal pages (Dashboard, Profile)
  if (to.meta.requiresPortalAuth) {
    if (!hasPortalToken) {
      return {
        path: '/portal/login',
        query: { redirect: to.fullPath },
        replace: true,
      }
    }
    return true
  }

  return true
}