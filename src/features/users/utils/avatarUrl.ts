/**
 * Resolve avatar to a browser-loadable URL (local storage, S3, R2, blob).
 */
export function resolveAvatarUrl(
  avatar?: string | null,
  apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
): string | null {
  if (!avatar) return null

  // Normalize Windows backslashes (avatars\abc.jpg -> avatars/abc.jpg)
  const normalized = avatar.replace(/\\/g, '/')

  // Already absolute or local blob preview
  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('blob:') ||
    normalized.startsWith('data:')
  ) {
    return normalized
  }

  // Determine backend origin (e.g. http://localhost:8086)
  const base = apiBase || 'http://localhost:8086'
  let origin = 'http://localhost:8086'
  try {
    origin = new URL(base).origin
  } catch {
    if (typeof window !== 'undefined') {
      origin = window.location.origin
    }
  }

  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`

  if (cleanPath.startsWith('/storage/')) {
    return `${origin}${cleanPath}`
  }

  return `${origin}/storage${cleanPath}`
}