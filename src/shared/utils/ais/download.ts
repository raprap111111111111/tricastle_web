// src/shared/utils/ais/download.ts

/** Trigger a browser download for a blob. */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Safe filename builder from applicant record. */
export function makeSafeFileName(applicant: any): string {
  return `${applicant.applicant_code ?? 'applicant'}_${applicant.last_name ?? ''}.pdf`
    .replace(/[^\w.-]/g, '_')
}