export function getDefaultAvatar(name?: string | null): string {
  const cleanName = (name ?? 'Applicant').trim() || 'Applicant'
  const encodedName = encodeURIComponent(cleanName)
  return `https://ui-avatars.com/api/?name=${encodedName}&background=E8EEF5&color=1E3A5F&font-size=0.38&bold=true&size=256`
}

function toHttps(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null
  // Keep localhost / 127.0.0.1 as-is (http is fine in local dev)
  if (url.includes('localhost') || url.includes('127.0.0.1')) return url
  if (url.startsWith('http://')) return url.replace(/^http:\/\//i, 'https://')
  return url
}

/**
 * Prefer the backend-provided photo_url (already points to the secure /preview stream).
 * Fall back to scanning documents only if photo_url is missing.
 */
export function getApplicantPhoto(person: any): string {
  if (!person || typeof person !== 'object') {
    return getDefaultAvatar('Applicant')
  }

  // 1. Trust the backend first (ApplicantResource already resolves ID_PHOTO → /preview)
  const direct = toHttps(person.photo_url ?? person.profile_photo_url ?? person.avatar_url)
  if (direct) return direct

  // 2. Fallback: scan documents array (for older payloads that don’t have photo_url)
  const docs =
    person.current_documents ??
    person.documents ??
    person.currentDocuments ??
    person.applicant_documents ??
    []

  if (Array.isArray(docs) && docs.length > 0) {
    const photoDoc = docs.find((d: any) => {
      const code = String(
        d?.document_type?.code ?? d?.documentType?.code ?? d?.code ?? ''
      ).toUpperCase()
      const name = String(
        d?.document_type?.name ?? d?.documentType?.name ?? d?.name ?? ''
      ).toUpperCase()
      const notes = String(d?.notes ?? '').toUpperCase()

      return (
        code === 'ID_PHOTO' ||
        code.includes('PHOTO') ||
        code.includes('2X2') ||
        name.includes('PHOTO') ||
        name.includes('2X2') ||
        notes.includes('2X2')
      )
    })

    if (photoDoc) {
      // Prefer the already-generated URL from the resource
      const fromDoc = toHttps(
        photoDoc.file_url ?? photoDoc.url ?? photoDoc.public_url
      )
      if (fromDoc) return fromDoc

      // Last resort: build the preview URL using the current origin
      if (photoDoc.id) {
        // Works both on localhost and on production
        const base =
          import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
          (typeof window !== 'undefined' ? window.location.origin : '')
        return `${base}/api/v1/applicant-documents/${photoDoc.id}/preview`
      }
    }
  }

  // 3. Default avatar
  const name =
    person.full_name ||
    `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim() ||
    person.name ||
    'Applicant'
  return getDefaultAvatar(name)
}