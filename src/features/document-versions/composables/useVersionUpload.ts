// src/features/document-versions/composables/useVersionUpload.ts

import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDocumentVersionStore } from '../stores/documentVersion.store'
import { MAX_UPLOAD_MB } from '../constants'

export function useVersionUpload() {
  const store = useDocumentVersionStore()
  const toast = useToast()

  const selectedFile = ref<File | null>(null)
  const changeReason = ref<string>('')
  const uploading    = ref(false)

  function onFileSelected(file: File | null) {
    if (!file) {
      selectedFile.value = null
      return
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toast.add({
        severity: 'warn',
        summary:  'File too large',
        detail:   `Maximum size is ${MAX_UPLOAD_MB}MB.`,
        life:     3000,
      })
      selectedFile.value = null
      return
    }
    selectedFile.value = file
  }

  async function submit(applicantDocumentId: number) {
    if (!selectedFile.value) {
      toast.add({
        severity: 'warn',
        summary:  'No file selected',
        detail:   'Please choose a file to upload.',
        life:     3000,
      })
      return null
    }
    if (!changeReason.value.trim()) {
      toast.add({
        severity: 'warn',
        summary:  'Reason required',
        detail:   'Please describe why you are uploading a new version.',
        life:     3000,
      })
      return null
    }

    uploading.value = true
    try {
      const created = await store.uploadNewVersion({
        applicant_document_id: applicantDocumentId,
        file:                  selectedFile.value,
        change_reason:         changeReason.value.trim(),
      })
      toast.add({
        severity: 'success',
        summary:  'Version uploaded',
        detail:   `Version ${created?.version_number} is now current.`,
        life:     3000,
      })
      selectedFile.value = null
      changeReason.value = ''
      return created
    } catch (e: any) {
      toast.add({
        severity: 'error',
        summary:  'Upload failed',
        detail:   e?.response?.data?.message ?? 'Please try again.',
        life:     4000,
      })
      return null
    } finally {
      uploading.value = false
    }
  }

  return {
    selectedFile,
    changeReason,
    uploading,
    onFileSelected,
    submit,
  }
}