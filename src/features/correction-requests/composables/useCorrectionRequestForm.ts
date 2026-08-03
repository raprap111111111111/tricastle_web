// src/features/correction-requests/composables/useCorrectionRequestForm.ts

import { ref, reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useCorrectionRequestStore } from '../stores/correction-request.store'
import type {
  CorrectionRequest,
  CreateCorrectionRequestPayload,
  UpdateCorrectionRequestPayload,
} from '../types'

export function useCorrectionRequestForm() {
  const store = useCorrectionRequestStore()
  const toast = useToast()

  const visible = ref(false)
  const editTarget = ref<CorrectionRequest | null>(null)

  const form = reactive<CreateCorrectionRequestPayload>({
    document_verification_id: 0,
    applicant_document_id: 0,
    severity: 'low',
    description: '',
    fields_to_correct: [],
    correction_data: {},
    justification: '',
    requires_approval: false,
    requires_new_document: false,
    due_date: undefined,
  })

  function openCreate() {
    editTarget.value = null
    resetForm()
    visible.value = true
  }

  function openEdit(record: CorrectionRequest) {
    editTarget.value = record
    Object.assign(form, {
      document_verification_id: record.document_verification_id,
      applicant_document_id: record.applicant_document_id,
      severity: record.severity,
      description: record.description,
      fields_to_correct: record.fields_to_correct ?? [],
      correction_data: record.correction_data ?? {},
      justification: record.justification ?? '',
      requires_approval: record.requires_approval,
      requires_new_document: record.requires_new_document,
      due_date: record.due_date ?? undefined,
    })
    visible.value = true
  }

  function resetForm() {
    Object.assign(form, {
      document_verification_id: 0,
      applicant_document_id: 0,
      severity: 'low',
      description: '',
      fields_to_correct: [],
      correction_data: {},
      justification: '',
      requires_approval: false,
      requires_new_document: false,
      due_date: undefined,
    })
  }

  async function submit(): Promise<boolean> {
    try {
      if (editTarget.value) {
        await store.update(
          editTarget.value.id,
          form as UpdateCorrectionRequestPayload,
        )
        toast.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Correction request updated.',
          life: 3000,
        })
      } else {
        await store.create(form as CreateCorrectionRequestPayload)
        toast.add({
          severity: 'success',
          summary: 'Created',
          detail: 'Correction request submitted.',
          life: 3000,
        })
      }
      visible.value = false
      resetForm()
      return true
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.message ?? 'Something went wrong.',
        life: 4000,
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
    resetForm,
    submit,
  }
}