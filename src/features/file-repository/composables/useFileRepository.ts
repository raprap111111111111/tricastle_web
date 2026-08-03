// src/features/file-repository/composables/useFileRepository.ts

import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useFileRepositoryStore } from '../stores/file-repository.store'
import type { FileRepository } from '../types'

export function useFileRepository() {
  const store  = useFileRepositoryStore()
  const toast  = useToast()

  // ─── Dialog visibility ────────────────────────────────────────────────
  const showUploadDialog = ref(false)
  const showDeleteDialog = ref(false)
  const showPurgeDialog  = ref(false)

  const selectedFile = ref<FileRepository | null>(null)

  // ─── Open helpers ─────────────────────────────────────────────────────
  function openUpload() {
    showUploadDialog.value = true
  }

  function openDelete(file: FileRepository) {
    selectedFile.value     = file
    showDeleteDialog.value = true
  }

  function openPurge(file: FileRepository) {
    selectedFile.value    = file
    showPurgeDialog.value = true
  }

  function closeAll() {
    showUploadDialog.value = false
    showDeleteDialog.value = false
    showPurgeDialog.value  = false
    selectedFile.value     = null
  }

  // ─── Actions ──────────────────────────────────────────────────────────
  async function handleUpload(file: File, extra?: Record<string, any>) {
    try {
      await store.uploadFile(file, extra)
      toast.add({
        severity: 'success',
        summary:  'File Uploaded',
        detail:   `${file.name} has been uploaded successfully.`,
        life:     4000,
      })
      closeAll()
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Upload Failed',
        detail:   store.error ?? 'An unexpected error occurred.',
        life:     5000,
      })
    }
  }

  async function handleDelete(id: number) {
    try {
      await store.deleteFile(id)
      toast.add({
        severity: 'success',
        summary:  'File Deleted',
        detail:   'The file has been soft-deleted.',
        life:     4000,
      })
      closeAll()
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Delete Failed',
        detail:   store.error ?? 'An unexpected error occurred.',
        life:     5000,
      })
    }
  }

  async function handlePurge(id: number) {
    try {
      await store.purgeFile(id)
      toast.add({
        severity: 'warn',
        summary:  'File Permanently Purged',
        detail:   'The file has been permanently removed from storage.',
        life:     5000,
      })
      closeAll()
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Purge Failed',
        detail:   store.error ?? 'An unexpected error occurred.',
        life:     5000,
      })
    }
  }

  return {
    // store passthrough
    store,
    // dialog state
    showUploadDialog,
    showDeleteDialog,
    showPurgeDialog,
    selectedFile,
    // helpers
    openUpload,
    openDelete,
    openPurge,
    closeAll,
    // handlers
    handleUpload,
    handleDelete,
    handlePurge,
  }
}