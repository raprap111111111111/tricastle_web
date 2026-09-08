import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { internshipApi } from '../api/internship.api'
import type { BulkGenerateMoaPayload, GenerateMoaPayload } from '../types'

export function useMoaDownload() {
  const toast = useToast()
  const generating = ref(false)

  /** Safely unwrap response whether axios interceptor is active or not */
  function unwrap(res: any): any {
    return res?.data?.data ?? res?.data ?? res
  }

  /** Extract URL from any nested position in the API response */
  function extractUrl(body: any): string | null {
    if (!body) return null
    if (typeof body === 'string' && body.startsWith('http')) return body

    return (
      body.download_url ??
      body.download ??
      body.file_url ??
      body.url ??
      body?.data?.download_url ??
      body?.data?.download ??
      null
    )
  }

  /** Force browser download bypassing popup blockers */
  function triggerBrowserDownload(url: string, filename = 'MOA_Document.pdf') {
    const fullUrl = url.startsWith('http')
      ? url
      : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`

    const link = document.createElement('a')
    link.href = fullUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function generateSingle(internshipId: number, payload: GenerateMoaPayload = {}): Promise<string> {
    generating.value = true
    try {
      const res = await internshipApi.generateMoa(internshipId, payload)
      const body = unwrap(res)
      const url = extractUrl(body)

      if (!url) {
        console.error('[MOA] API response missing download_url:', body)
        throw new Error('Server generated MOA but did not return a valid download URL.')
      }

      // 🎯 FIXED: Set file extension to .pdf
      const docNo = body?.document_no ?? `MOA_${internshipId}`
      triggerBrowserDownload(url, `${docNo}.pdf`)

      toast.add({
        severity: 'success',
        summary: 'MOA PDF Generated',
        detail: `MOA PDF Document download started (${docNo}).`,
        life: 3500,
      })

      return url
    } catch (err: any) {
      console.error('[MOA] generateSingle failed:', err)
      toast.add({
        severity: 'error',
        summary: 'MOA Generation Failed',
        detail: err?.response?.data?.message ?? err?.message ?? 'Could not generate MOA PDF Document.',
        life: 5000,
      })
      throw err
    } finally {
      generating.value = false
    }
  }

  async function generateBulk(payload: BulkGenerateMoaPayload): Promise<string> {
    generating.value = true
    try {
      const res = await internshipApi.bulkGenerateMoa(payload)
      const body = unwrap(res)
      const url = extractUrl(body)

      if (!url) {
        throw new Error('Server generated bulk MOAs but did not return a download URL.')
      }

      // 🎯 FIXED: Zip fallback to .pdf
      triggerBrowserDownload(url, body?.type === 'zip' ? 'Bulk_MOAs.zip' : 'MOA_Documents.pdf')

      toast.add({
        severity: 'success',
        summary: 'Bulk MOAs Generated',
        detail: 'Download started automatically.',
        life: 3500,
      })

      return url
    } catch (err: any) {
      console.error('[MOA] generateBulk failed:', err)
      toast.add({
        severity: 'error',
        summary: 'Bulk MOA Failed',
        detail: err?.response?.data?.message ?? err?.message ?? 'Could not generate bulk MOAs.',
        life: 5000,
      })
      throw err
    } finally {
      generating.value = false
    }
  }

  return {
    generating,
    generateSingle,
    generateBulk,
  }
}