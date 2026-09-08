/**
 * Resolve avatar to a browser-loadable URL.
 * Backend always returns either:
 *   - full external URL (Google / OAuth)
 *   - API stream URL   /api/v1/users/{id}/avatar
 *   - or null
 */
export function resolveAvatarUrl(
  avatar?: string | null,
): string | null {
  if (!avatar) return null

  const normalized = avatar.replace(/\\/g, '/')

  // Already a full URL, blob, or data URI → use as-is
  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('blob:') ||
    normalized.startsWith('data:')
  ) {
    return normalized
  }

  // Backend already gave us the stream path (starts with /api/...)
  if (normalized.startsWith('/api/')) {
    const base = import.meta.env.VITE_API_BASE_URL || window.location.origin
    try {
      return new URL(normalized, base).toString()
    } catch {
      return normalized
    }
  }

  // Fallback (should almost never happen now)
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin
  try {
    return new URL(
      normalized.startsWith('/') ? normalized : `/${normalized}`,
      base,
    ).toString()
  } catch {
    return null
  }
}