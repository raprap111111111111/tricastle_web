// src/features/correction-requests/composables/useCorrectionRequestForm.ts
import { reactive, ref } from 'vue'
import { useCorrectionRequestStore } from '../stores/correction-request.store'
import { useToast } from 'primevue/usetoast'
import type { CorrectionRequest } from '../types'

export function useCorrectionRequestForm() {
  const store = useCorrectionRequestStore()
  const toast = useToast()

  const visible = ref(false)
  const editTarget = ref<CorrectionRequest | null>(null)

  const form = reactive({
    document_verification_id: null as number | null,   // ✅ ADD
    applicant_document_id: null as number | null,      // ✅ ADD
    severity: 'moderate' as 'low' | 'moderate' | 'critical',
    description: '',
    justification: '',
    due_date: undefined as string | undefined,
    requires_approval: false,
    requires_new_document: false,
    fields_to_correct: [] as string[],
    correction_data: {} as Record<string, any>,
  })

  function reset() {
    form.document_verification_id = null
    form.applicant_document_id = null
    form.severity = 'moderate'
    form.description = ''
    form.justification = ''
    form.due_date = undefined
    form.requires_approval = false
    form.requires_new_document = false
    form.fields_to_correct = []
    form.correction_data = {}
    editTarget.value = null
  }

  function openCreate() {
    reset()
    visible.value = true
  }

  function openEdit(record: CorrectionRequest) {
    reset()
    editTarget.value = record
    form.document_verification_id = record.document_verification_id
    form.applicant_document_id = record.applicant_document_id
    form.severity = record.severity
    form.description = record.description
    form.justification = record.justification ?? ''
    form.due_date = record.due_date ?? undefined
    form.requires_approval = record.requires_approval
    form.requires_new_document = record.requires_new_document
    visible.value = true
  }

  async function submit(): Promise<boolean> {
    // ✅ Validate required fields BEFORE sending
    if (!editTarget.value) {
      if (!form.document_verification_id) {
        toast.add({
          severity: 'warn',
          summary: 'Missing Field',
          detail: 'Please select a document verification',
          life: 3000,
        })
        return false
      }
      if (!form.applicant_document_id) {
        toast.add({
          severity: 'warn',
          summary: 'Missing Field',
          detail: 'Please select an applicant document',
          life: 3000,
        })
        return false
      }
    }
    if (!form.description) {
      toast.add({
        severity: 'warn',
        summary: 'Missing Field',
        detail: 'Description is required',
        life: 3000,
      })
      return false
    }

    try {
      const payload: any = {
        severity: form.severity,
        description: form.description,
        justification: form.justification || undefined,
        due_date: form.due_date || undefined,
        requires_approval: form.requires_approval,
        requires_new_document: form.requires_new_document,
        fields_to_correct: form.fields_to_correct,
        correction_data: form.correction_data,
      }

      if (editTarget.value) {
        await store.update(editTarget.value.id, payload)
        toast.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Correction request updated',
          life: 3000,
        })
      } else {
        // ✅ Include required IDs only on create
        payload.document_verification_id = form.document_verification_id
        payload.applicant_document_id = form.applicant_document_id
        await store.create(payload)
        toast.add({
          severity: 'success',
          summary: 'Created',
          detail: 'Correction request created',
          life: 3000,
        })
      }

      visible.value = false
      reset()
      return true
    } catch (err: any) {
      console.error('❌ Create/Update failed:', err.response?.data)
      const errors = err.response?.data?.errors
      const errorMsg = errors
        ? Object.values(errors).flat().join(', ')
        : err.response?.data?.message ?? 'Failed to submit'

      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
        life: 5000,
      })
      return false
    }
  }

  return {
    visible,
    editTarget,
    form,
    openCreate,
    openEdit,
    reset,
    submit,
  }
}