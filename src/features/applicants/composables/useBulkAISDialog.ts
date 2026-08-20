// src/features/applicants/composables/useBulkAISDialog.ts

import { ref, computed, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { generateBulkAIS, type BulkAISMode, type BulkProgress } from '@shared/utils/ais'

export type BulkAISSource = 'selected' | 'batch' | 'all'

export function useBulkAISDialog(
  storeApplicants:      Ref<any[]>,
  filteredApplicants:   Ref<any[]>,
  selectedIds:          Ref<number[]>,
  selectedBatchId:      Ref<number | null>,
) {
  const toast = useToast()

  const showBulkAISDialog = ref(false)
  const bulkAISGenerating = ref(false)
  const bulkAISProgress   = ref<BulkProgress>({ current: 0, total: 0 })

  const bulkAISSource  = ref<BulkAISSource>('selected')
  const bulkAISBatchId = ref<number | null>(null)
  const bulkAISMode    = ref<BulkAISMode>('zip')

  const bulkAISApplicants = computed(() => {
    switch (bulkAISSource.value) {
      case 'selected':
        return storeApplicants.value.filter((a) => selectedIds.value.includes(a.id))
      case 'batch':
        if (!bulkAISBatchId.value) return []
        return storeApplicants.value.filter((a) =>
          a.applicant_batches?.some((ab: any) => ab.batch_id === bulkAISBatchId.value),
        )
      case 'all':
      default:
        return filteredApplicants.value
    }
  })

  function openBulkAISDialog() {
    bulkAISSource.value     = selectedIds.value.length > 0 ? 'selected' : 'all'
    bulkAISBatchId.value    = selectedBatchId.value
    bulkAISMode.value       = 'zip'
    bulkAISProgress.value   = { current: 0, total: 0 }
    showBulkAISDialog.value = true
  }

  function closeBulkAISDialog() {
    if (bulkAISGenerating.value) return
    showBulkAISDialog.value = false
  }

  async function handleBulkAISGenerate() {
    if (bulkAISApplicants.value.length === 0) return

    bulkAISGenerating.value = true
    bulkAISProgress.value   = { current: 0, total: bulkAISApplicants.value.length }

    try {
      await generateBulkAIS(
        bulkAISApplicants.value,
        undefined,
        bulkAISMode.value,
        (p) => { bulkAISProgress.value = p },
      )
      toast.add({
        severity: 'success',
        summary:  'AIS Generated',
        detail:   `${bulkAISApplicants.value.length} applicant information sheet${bulkAISApplicants.value.length !== 1 ? 's' : ''} generated`,
        life:     4000,
      })
      showBulkAISDialog.value = false
    } catch (err) {
      console.error('[Bulk AIS]', err)
      toast.add({
        severity: 'error',
        summary:  'Generation Failed',
        detail:   'Could not generate all AIS PDFs.',
        life:     5000,
      })
    } finally {
      bulkAISGenerating.value = false
    }
  }

  return {
    showBulkAISDialog, bulkAISGenerating, bulkAISProgress,
    bulkAISSource, bulkAISBatchId, bulkAISMode, bulkAISApplicants,
    openBulkAISDialog, closeBulkAISDialog, handleBulkAISGenerate,
  }
}