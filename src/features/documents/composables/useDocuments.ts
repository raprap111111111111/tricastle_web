// src/features/documents/composables/useDocuments.ts
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useDocumentStore } from '../stores/document.store'

export function useDocuments() {
  const store   = useDocumentStore()
  const toast   = useToast()
  const confirm = useConfirm()

  async function handleDelete(id: number, fileName?: string) {
    return new Promise<boolean>((resolve) => {
      confirm.require({
        message: `Delete "${fileName ?? 'this document'}"? This cannot be undone.`,
        header:  'Delete Document',
        icon:    'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        accept: async () => {
          try {
            await store.deleteDocument(id)
            toast.add({
              severity: 'success',
              summary:  'Deleted',
              detail:   'Document deleted.',
              life:     3000,
            })
            resolve(true)
          } catch (e: any) {
            toast.add({
              severity: 'error',
              summary:  'Delete Failed',
              detail:   e?.response?.data?.message ?? 'Try again.',
              life:     4000,
            })
            resolve(false)
          }
        },
        reject: () => resolve(false),
      })
    })
  }

  /**
   * Verify a document.
   * Note: current backend endpoint accepts only `id`. If you later add
   * notes support (PATCH body: { notes: string }), update the store's
   * `verify()` to accept notes and re-add the parameter here.
   */
  async function handleVerify(id: number) {
    try {
      await store.verify(id)
      toast.add({
        severity: 'success',
        summary:  'Verified',
        detail:   'Document has been verified.',
        life:     3000,
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary:  'Verify Failed',
        detail:   e?.response?.data?.message ?? 'Try again.',
        life:     4000,
      })
    }
  }

  async function handleReject(id: number, reason: string) {
    try {
      await store.reject(id, reason)
      toast.add({
        severity: 'warn',
        summary:  'Rejected',
        detail:   'Document rejected.',
        life:     3000,
      })
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary:  'Reject Failed',
        detail:   e?.response?.data?.message ?? 'Try again.',
        life:     4000,
      })
    }
  }

  return { handleDelete, handleVerify, handleReject }
}