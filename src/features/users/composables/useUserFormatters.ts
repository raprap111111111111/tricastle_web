import { computed, type Ref } from 'vue'
import type { User } from '../schemas/user.schema'

export function useUserFormatters(user: Ref<User | null | undefined>) {
  const fullName = computed(() => {
    if (!user.value) return '—'
    return (
      user.value.full_name ||
      [user.value.first_name, user.value.middle_name, user.value.last_name, user.value.suffix]
        .filter(Boolean)
        .join(' ')
    )
  })

  const initials = computed(() => {
    if (!user.value) return '?'
    const f = user.value.first_name?.[0] ?? ''
    const l = user.value.last_name?.[0] ?? ''
    return (f + l).toUpperCase() || 'U'
  })

  const primaryRole = computed(() => {
    if (!user.value?.roles?.length) return null
    const firstRole = user.value.roles[0]
    const roleName = typeof firstRole === 'string' ? firstRole : (firstRole as any)?.name ?? ''
    return roleName ? roleName.replace(/_/g, ' ') : null
  })

  /**
   * Safely compute full avatar URL for Local, S3, R2, or Blob previews
   */
  const avatarUrl = computed(() => {
    if (!user.value?.avatar) return null
    const raw = user.value.avatar

    // 1. Direct URLs (R2, S3, CDN, or Local Blob preview)
    if (
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('blob:') ||
      raw.startsWith('data:')
    ) {
      return raw
    }

    // 2. Normalize Windows backslashes (avatars\file.jpg -> avatars/file.jpg)
    const normalized = raw.replace(/\\/g, '/')

    // 3. Resolve API origin (Vite ENV or fallback to current origin)
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086'
    let origin = 'http://localhost:8086'
    try {
      origin = new URL(apiBase).origin
    } catch {
      if (typeof window !== 'undefined') {
        origin = window.location.origin
      }
    }

    // 4. Construct relative storage path
    const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`
    if (cleanPath.startsWith('/storage/')) {
      return `${origin}${cleanPath}`
    }
    return `${origin}/storage${cleanPath}`
  })

  function formatDate(d?: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function formatDateTime(d?: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    fullName,
    initials,
    primaryRole,
    avatarUrl,
    formatDate,
    formatDateTime,
  }
}