import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { applicantApi } from '../api/applicant.api'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function usePdosExport() {
  const toast = useToast()

  const isDialogOpen = ref(false)
  const isExporting = ref(false)
  const pdosDate = ref<Date>(new Date())
  const selectedApplicantIds = ref<number[]>([])

  function open(applicantIds: number[]) {
    selectedApplicantIds.value = [...applicantIds]
    pdosDate.value = new Date()
    isDialogOpen.value = true
  }

  function close() {
    isDialogOpen.value = false
    selectedApplicantIds.value = []
  }

  async function submit() {
    if (!selectedApplicantIds.value.length || !pdosDate.value) return

    isExporting.value = true
    try {
      await applicantApi.downloadPdosBatch(
        selectedApplicantIds.value,
        formatDate(pdosDate.value),
      )

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'PDOS Certificates downloaded successfully.',
        life: 3000,
      })
      close()
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Export Failed',
        detail:
          error?.response?.data?.message ??
          'Failed to generate PDOS certificates.',
        life: 5000,
      })
    } finally {
      isExporting.value = false
    }
  }

  return {
    isDialogOpen,
    isExporting,
    pdosDate,
    open,
    close,
    submit,
  }
}