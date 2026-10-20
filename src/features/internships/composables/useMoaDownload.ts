import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import http from '@shared/api/http'

export function useMoaDownload() {
  const toast = useToast()
  const generating = ref(false)

  /** Helper to trigger local browser download from Blob data (Same as PDOS) */
  function triggerBlobDownload(data: Blob, filename: string) {
    const localUrl = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = localUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => window.URL.revokeObjectURL(localUrl), 1000)
  }

  async function generateSingle(internshipId: number, payload: any = {}): Promise<void> {
    generating.value = true
    try {
      // 🚀 Direct backend file stream (bypasses Cloudflare *.r2.dev block completely!)
      const response = await http.get<Blob>(`/internships/${internshipId}/download-moa`, {
        params: payload,
        responseType: 'blob',
      })

      const blob = response.data as unknown as Blob

      // Parse filename from Content-Disposition header if present
      let filename = `MOA_${internshipId}.docx`
      const disposition = response.headers?.['content-disposition'] as string | undefined
      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)"?/i)
        if (match?.[1]) filename = decodeURIComponent(match[1].trim())
      }

      // Download file locally
      triggerBlobDownload(blob, filename)

      toast.add({
        severity: 'success',
        summary: 'MOA Generated',
        detail: `Downloaded ${filename} directly from server.`,
        life: 3500,
      })
    } catch (err: any) {
      console.error('[MOA] Download failed:', err)
      toast.add({
        severity: 'error',
        summary: 'MOA Generation Failed',
        detail: err?.message ?? 'Could not download MOA document.',
        life: 5000,
      })
    } finally {
      generating.value = false
    }
  }

  return {
    generating,
    generateSingle,
  }
}