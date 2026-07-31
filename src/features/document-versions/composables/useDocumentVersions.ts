// src/features/document-versions/composables/useDocumentVersions.ts

import { computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDocumentVersionStore } from '../stores/documentVersion.store'

export function useDocumentVersions(documentId?: number) {
  const store = useDocumentVersionStore()
  const toast = useToast()

  onMounted(() => {
    if (documentId) store.fetchVersions(documentId)
  })

  const versions       = computed(() => store.versionsSorted)
  const activeVersion  = computed(() => store.activeVersion)
  const loading        = computed(() => store.loading)
  const submitting     = computed(() => store.submitting)

  async function makeCurrent(id: number) {
    try {
      await store.setAsCurrent(id)
      toast.add({
        severity: 'success',
        summary:  'Version restored',
        detail:   'This version is now marked as current.',
        life:     2500,
      })
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Failed',
        detail:   store.error ?? 'Could not update version',
        life:     3500,
      })
    }
  }

  async function removeVersion(id: number) {
    try {
      await store.deleteVersion(id)
      toast.add({
        severity: 'success',
        summary:  'Deleted',
        detail:   'Version removed from history.',
        life:     2500,
      })
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Delete failed',
        detail:   store.error ?? 'Could not delete version',
        life:     3500,
      })
    }
  }

  return {
    versions,
    activeVersion,
    loading,
    submitting,
    makeCurrent,
    removeVersion,
    refresh: () => store.fetchVersions(documentId),
  }
}