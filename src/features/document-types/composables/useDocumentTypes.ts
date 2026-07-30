// src/features/document-types/composables/useDocumentTypes.ts
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDocumentTypeStore } from '@features/document-types/stores/documentType.store'
import type { DocumentType } from '../types'

// ✅ Module-scoped reactive state — shared between view + dialog
const deleteDialogOpen = ref(false)
const selectedType     = ref<DocumentType | null>(null)

export function useDocumentTypes() {
  const store = useDocumentTypeStore()
  const toast = useToast()

  // ─── DELETE (opens hold-to-delete dialog) ─────────────────────────────
  function handleDelete(type: DocumentType) {
    selectedType.value     = type
    deleteDialogOpen.value = true
  }

  async function confirmDelete() {
    if (!selectedType.value) return
    const type = selectedType.value

    try {
      await store.deleteType(type.id)
      toast.add({
        severity: 'success',
        summary:  'Deleted',
        detail:   `Document type "${type.name}" deleted.`,
        life:     3000,
      })
      deleteDialogOpen.value = false
      selectedType.value     = null
      await store.fetchTypes()
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary:  'Delete Failed',
        detail:   e?.response?.data?.message ?? 'Try again.',
        life:     4000,
      })
    }
  }

  function cancelDelete() {
    deleteDialogOpen.value = false
    selectedType.value     = null
  }

  // ─── TOGGLE (active/inactive) ─────────────────────────────────────────
  async function handleToggle(id: number, currentActive: boolean, name?: string) {
    try {
      await store.toggleActive(id, !currentActive)
      toast.add({
        severity: 'success',
        summary:  !currentActive ? 'Activated' : 'Deactivated',
        detail:   `"${name}" is now ${!currentActive ? 'active' : 'inactive'}.`,
        life:     2500,
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary:  'Toggle Failed',
        detail:   e?.response?.data?.message ?? 'Try again.',
        life:     4000,
      })
    }
  }

  return {
    // delete
    handleDelete,
    confirmDelete,
    cancelDelete,
    deleteDialogOpen,
    selectedType,
    // toggle
    handleToggle,
  }
}