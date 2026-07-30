<!-- src/features/documents/views/DocumentEditView.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import Select from 'primevue/select'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'

import {
  AppButton,
  AppCard,
  AppFormField,
  AppFormSection,
  AppDocumentTypePicker,
} from '@shared/ui'

import { useDocumentStore } from '../stores/document.store'
import type { DocumentPriority, DocumentStatus } from '../types'
import type { DocumentType } from '@features/document-types/types'

const props = defineProps<{ id: number }>()

const router = useRouter()
const toast  = useToast()
const store  = useDocumentStore()

const loaded = ref(false)

// ─── Form state ──────────────────────────────────────────────────────────────
const documentTypeId = ref<number | null>(null)
const selectedType   = ref<DocumentType | null>(null)
const documentDate   = ref<Date | null>(null)
const expiryDate     = ref<Date | null>(null)
const priority       = ref<DocumentPriority>('normal')
const status         = ref<DocumentStatus>('uploaded')
const notes          = ref<string>('')

// ─── Options ─────────────────────────────────────────────────────────────────
const priorityOptions = [
  { label: 'Low',    value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High',   value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

const statusOptions = [
  { label: 'Uploaded',             value: 'uploaded' },
  { label: 'Pending Verification', value: 'pending_verification' },
  { label: 'Under Review',         value: 'under_review' },
  { label: 'Verified',             value: 'verified' },
  { label: 'Rejected',             value: 'rejected' },
  { label: 'Expired',              value: 'expired' },
  { label: 'Requires Correction',  value: 'requires_correction' },
]

// ─── Load ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  store.clearDocument()
  await store.fetchDocument(props.id)
  loaded.value = true
})

watch(
  () => store.document,
  (d) => {
    if (!d) return
    documentTypeId.value = d.document_type_id
    documentDate.value   = d.document_date ? new Date(d.document_date) : null
    expiryDate.value     = d.expiry_date   ? new Date(d.expiry_date)   : null
    priority.value       = d.priority
    status.value         = d.status
    notes.value          = d.notes ?? ''
  },
  { immediate: true },
)

// ─── Handlers ────────────────────────────────────────────────────────────────
function onTypeSelected(t: DocumentType) {
  selectedType.value = t
}
function onTypeCleared() {
  selectedType.value = null
}

function toISO(d: Date | null): string | null {
  return d ? d.toISOString().split('T')[0] : null
}

async function onSubmit() {
  try {
    await store.updateDocument(props.id, {
      document_type_id: documentTypeId.value ?? undefined,
      document_date:    toISO(documentDate.value),
      expiry_date:      toISO(expiryDate.value),
      priority:         priority.value,
      status:           status.value,
      notes:            notes.value || null,
    })
    toast.add({
      severity: 'success',
      summary:  'Updated',
      detail:   'Document updated successfully.',
      life:     3000,
    })
    router.push({ name: 'documents.view', params: { id: props.id } })
  } catch {
    toast.add({
      severity: 'error',
      summary:  'Update Failed',
      detail:   store.error ?? 'Try again.',
      life:     4000,
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        @click="router.push({ name: 'documents.view', params: { id: props.id } })"
      />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          Edit Document
        </h1>
        <p v-if="store.document" class="text-sm text-blueberry-500">
          {{ store.document.file_name }}
        </p>
      </div>
    </div>

    <template v-if="!loaded">
      <Skeleton height="60px" border-radius="12px" />
      <Skeleton height="300px" border-radius="12px" />
    </template>

    <AppCard v-else>
      <div class="space-y-8">
        <AppFormSection title="Document Metadata">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AppFormField label="Document Type" required>
              <AppDocumentTypePicker
                v-model="documentTypeId"
                placeholder="Search type by name or code…"
                @select="onTypeSelected"
                @clear="onTypeCleared"
              />
            </AppFormField>

            <AppFormField label="Status">
              <Select
                v-model="status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </AppFormField>

            <AppFormField label="Document Date">
              <Calendar
                v-model="documentDate"
                date-format="yy-mm-dd"
                show-icon
                class="w-full"
              />
            </AppFormField>

            <AppFormField label="Expiry Date">
              <Calendar
                v-model="expiryDate"
                date-format="yy-mm-dd"
                show-icon
                class="w-full"
              />
            </AppFormField>

            <AppFormField label="Priority">
              <Select
                v-model="priority"
                :options="priorityOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </AppFormField>
          </div>

          <AppFormField label="Notes" class="mt-5">
            <Textarea v-model="notes" rows="3" class="w-full" />
          </AppFormField>
        </AppFormSection>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-appleCore-100">
          <AppButton
            variant="secondary"
            @click="router.push({ name: 'documents.view', params: { id: props.id } })"
          >
            Cancel
          </AppButton>
          <AppButton
            icon="pi pi-check"
            :loading="store.submitting"
            @click="onSubmit"
          >
            Save Changes
          </AppButton>
        </div>
      </div>
    </AppCard>
  </div>
</template>