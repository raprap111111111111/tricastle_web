// src/features/document-versions/utils/versionFormatters.ts

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024)             return `${bytes} B`
  if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatVersionDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function fileIcon(mime: string | null): string {
  if (!mime) return 'pi-file'
  if (mime.startsWith('image/'))    return 'pi-image'
  if (mime === 'application/pdf')   return 'pi-file-pdf'
  if (mime.startsWith('video/'))    return 'pi-video'
  return 'pi-file'
}