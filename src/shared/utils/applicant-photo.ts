// src/shared/utils/applicant-photo.ts

export function getDefaultAvatar(name?: string | null): string {
  const cleanName = (name ?? 'Applicant').trim() || 'Applicant'
  const encodedName = encodeURIComponent(cleanName)
  return `https://ui-avatars.com/api/?name=${encodedName}&background=E8EEF5&color=1E3A5F&font-size=0.38&bold=true&size=256`
}

function toHttps(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    return url.replace(/^http:\/\//i, 'https://')
  }
  return url
}

export function getApplicantPhoto(person: any): string {
  if (!person || typeof person !== 'object') {
    return getDefaultAvatar('Applicant')
  }

  // 1. Scan documents array for ID_PHOTO
  const docs = person.current_documents ?? person.documents ?? person.currentDocuments ?? []
  if (Array.isArray(docs) && docs.length > 0) {
    const photoDoc = docs.find((d: any) => {
      const code = String(d?.document_type?.code ?? d?.document_type_code ?? d?.code ?? '').toUpperCase()
      const name = String(d?.document_type?.name ?? d?.document_type_name ?? d?.name ?? '').toUpperCase()
      return code.includes('PHOTO') || code.includes('2X2') || name.includes('PHOTO') || name.includes('2X2')
    })

    if (photoDoc?.id) {
      return `https://tricastle-api.onrender.com/api/v1/applicant-documents/${photoDoc.id}/preview`
    }
    if (photoDoc?.file_url) return toHttps(photoDoc.file_url)!
    if (photoDoc?.url) return toHttps(photoDoc.url)!
  }

  // 2. Direct photo_url property
  if (person.photo_url && typeof person.photo_url === 'string') {
    return toHttps(person.photo_url)!
  }

  const name = person.full_name || `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim() || person.name || 'Applicant'
  return getDefaultAvatar(name)
}