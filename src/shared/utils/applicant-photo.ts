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
 * Returns the best available profile photo URL for an applicant or staff,
 * falling back to the UI Avatar if no ID photo exists.
 */
export function getApplicantPhoto(person: any): string {
  if (!person) return getDefaultAvatar()

  // 1. Direct photo_url from Laravel model accessor
  if (person.photo_url && typeof person.photo_url === 'string') {
    return person.photo_url
  }

  // 2. Direct avatar/photo property if present
  const directPath = person.avatar || person.photo || person.avatar_url || person.profile_photo
  if (directPath && typeof directPath === 'string') {
    if (directPath.startsWith('http') || directPath.startsWith('blob:') || directPath.startsWith('data:')) {
      return directPath
    }
    const base = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') ?? ''
    return `${base}/storage/${directPath.replace(/^\/+/, '')}`
  }

  // 3. Scan documents array for document type ID_PHOTO
  const docs = person.current_documents ?? person.documents ?? person.currentDocuments ?? []
  if (Array.isArray(docs)) {
    const photoDoc = docs.find((d: any) => {
      const code = d.document_type?.code ?? d.document_type_code ?? d.code
      return code === 'ID_PHOTO'
    })

    if (photoDoc?.file_url) return photoDoc.file_url
    if (photoDoc?.file_path) {
      const base = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') ?? ''
      return `${base}/storage/${photoDoc.file_path.replace(/^\/+/, '')}`
    }
  }

  // 4. Fallback to initials avatar
  const name = person.full_name || `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim() || person.name
  return getDefaultAvatar(name)
}