import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { internshipApi } from '../api/internship.api'
import type { BulkGenerateMoaPayload, GenerateMoaPayload } from '../types'

export function useMoaDownload() {
  const toast = useToast()
  const generating = ref(false)

  /** Trigger direct browser download from binary Blob data */
  function triggerBlobDownload(
    data: BlobPart,
    filename: string,
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ): string {
    const blob = new Blob([data], { type: mimeType })
    const localUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = localUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Revoke local object URL after download starts
    setTimeout(() => window.URL.revokeObjectURL(localUrl), 1000)

    return localUrl
  }

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

  /** Force browser download for external URLs */
  function triggerBrowserDownload(url: string, filename = 'MOA_Document.docx') {
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

  async function generateSingle(
    internshipId: number,
    payload: GenerateMoaPayload = {},
  ): Promise<string> {
    generating.value = true
    try {
      // ⚡ Clean up payload strings before sending to API
      const cleanPayload: GenerateMoaPayload = {
        ...payload,
        municipality: payload.municipality?.trim() || 'Murcia',
      }

      // 🚀 Direct Blob stream from Laravel backend (Bypasses LAN r2.dev block)
      const response = await axios.get(
        `/api/v1/internships/${internshipId}/download-moa`,
        {
          params: cleanPayload,
          responseType: 'blob', // 👈 Tells Axios to receive binary file stream
        },
      )

      // Try to read custom filename from Content-Disposition header if available
      let filename = `MOA_${internshipId}.docx`
      const disposition = response.headers['content-disposition']
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) {
          filename = match[1]
        }
      }

      // Save file locally via Blob URL
      const localUrl = triggerBlobDownload(response.data, filename)

      toast.add({
        severity: 'success',
        summary: 'MOA Generated',
        detail: `MOA Word document download started (${filename}).`,
        life: 3500,
      })

      return localUrl
    } catch (err: any) {
      console.error('[MOA] generateSingle failed:', err)
      toast.add({
        severity: 'error',
        summary: 'MOA Generation Failed',
        detail: err?.response?.data?.message ?? err?.message ?? 'Could not generate MOA document.',
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

      const filename = body?.type === 'zip' ? 'Bulk_MOAs.zip' : 'MOA_Document.docx'
      triggerBrowserDownload(url, filename)

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