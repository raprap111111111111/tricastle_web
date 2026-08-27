// src/shared/utils/applicant-photo.ts

/**
 * Generates a clean UI Avatar fallback image with user initials
 */
export function getDefaultAvatar(name?: string | null): string {
  const cleanName = (name ?? 'Applicant').trim() || 'Applicant'
  const encodedName = encodeURIComponent(cleanName)
  return `https://ui-avatars.com/api/?name=${encodedName}&background=E8EEF5&color=1E3A5F&font-size=0.38&bold=true&size=256`
}

/**
 * Force HTTPS on image URLs to prevent Vercel Mixed Content blocks
 */
function toHttps(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    return url.replace(/^http:\/\//i, 'https://')
  }
  return url
}

/**
 * Returns the best available profile photo URL for an applicant or staff,
 * safely defaulting if person is null or undefined.
 */
export function getApplicantPhoto(person: any): string {
  if (!person || typeof person !== 'object') {
    return getDefaultAvatar('Applicant')
  }

  // 1. Direct photo_url from Laravel model accessor
  if (person.photo_url && typeof person.photo_url === 'string') {
    return toHttps(person.photo_url)!
  }

  // 2. Direct avatar/photo property if present
  const directPath = person.avatar || person.photo || person.avatar_url || person.profile_photo
  if (directPath && typeof directPath === 'string') {
    if (directPath.startsWith('http') || directPath.startsWith('blob:') || directPath.startsWith('data:')) {
      return toHttps(directPath)!
    }
    const base = (import.meta.env.VITE_API_URL || 'https://tricastle-api.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')
    return toHttps(`${base}/storage/${directPath.replace(/^\/+/, '')}`)!
  }

  // 3. Scan documents array for ID_PHOTO
  const docs = person.current_documents ?? person.documents ?? person.currentDocuments ?? []
  if (Array.isArray(docs) && docs.length > 0) {
    const photoDoc = docs.find((d: any) => {
      const code = String(d?.document_type?.code ?? d?.document_type_code ?? d?.code ?? '').toUpperCase()
      const name = String(d?.document_type?.name ?? d?.document_type_name ?? d?.name ?? '').toUpperCase()
      return code.includes('PHOTO') || code.includes('2X2') || name.includes('PHOTO') || name.includes('2X2')
    })

    if (photoDoc?.file_url) return toHttps(photoDoc.file_url)!
    if (photoDoc?.url) return toHttps(photoDoc.url)!
    if (photoDoc?.id) {
      const base = (import.meta.env.VITE_API_URL || 'https://tricastle-api.onrender.com/api/v1').replace(/\/$/, '')
      return `${base}/applicant-documents/${photoDoc.id}/file`
    }
  }

  // 4. Safe fallback to initials avatar
  const name =
    person.full_name ||
    `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim() ||
    person.name ||
    'Applicant'

  return getDefaultAvatar(name)
}