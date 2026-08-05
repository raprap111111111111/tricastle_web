<!-- src/features/documents/views/DocumentCreateView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import http from '@shared/api/http'
import DocumentUploadDropzone from '../components/DocumentUploadDropzone.vue'
import { documentApi } from '../api/document.api'
import type { CreateDocumentPayload } from '../types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// ═══════════════════════════════════════════════════════════
// Context detection — figure out where we came from
// ═══════════════════════════════════════════════════════════

const applicantIdFromQuery      = computed(() => Number(route.query.applicant_id) || null)
const batchIdFromQuery          = computed(() => Number(route.query.batch_id) || null)
const documentTypeIdFromQuery   = computed(() => Number(route.query.document_type_id) || null)

const hasApplicantContext = computed(() => !!applicantIdFromQuery.value)
const hasBatchContext     = computed(() => !!batchIdFromQuery.value)

const showBatchSelector     = computed(() => !hasApplicantContext.value && !hasBatchContext.value)
const showApplicantSelector = computed(() => !hasApplicantContext.value)

// ═══════════════════════════════════════════════════════════
// Form state
// ═══════════════════════════════════════════════════════════
const form = ref({
  batch_id:         batchIdFromQuery.value,
  applicant_id:     applicantIdFromQuery.value,
  document_type_id: documentTypeIdFromQuery.value,
  file:             null as File | null,
  document_date:    null as Date | null,
  expiry_date:      null as Date | null,
  notes:            '',
})

// ═══════════════════════════════════════════════════════════
// Data sources
// ═══════════════════════════════════════════════════════════
const batches        = ref<any[]>([])
const applicants     = ref<any[]>([])
const documentTypes  = ref<any[]>([])
const loadingData    = ref(false)
const submitting     = ref(false)

// ═══════════════════════════════════════════════════════════
// 🎯 Helper — build applicant filter params
// ═══════════════════════════════════════════════════════════
function buildApplicantParams(batchId?: number | null) {
  const params: any = {
    limit: 200,
    status: 'final_list',                    // ✅ ONLY approved applicants
    exclude_statuses: '',                    // ✅ Clear any exclusion
  }
  if (batchId) params.batch_id = batchId
  return params
}

// ═══════════════════════════════════════════════════════════
// Load data on mount
// ═══════════════════════════════════════════════════════════
onMounted(async () => {
  loadingData.value = true
  try {
    // Always load document types
    const { data: dtRes } = await http.get('/document-types', { params: { limit: 200 } })
    documentTypes.value = dtRes?.records ?? dtRes?.data ?? []

    // Load batches ONLY if we need the selector
    if (showBatchSelector.value) {
      const { data: bRes } = await http.get('/batches', { params: { limit: 200 } })
      batches.value = bRes?.records ?? bRes?.data ?? []
    }

    // Load applicants — 🎯 FINAL LIST ONLY
    if (showApplicantSelector.value) {
      const { data: aRes } = await http.get('/applicants', {
        params: buildApplicantParams(form.value.batch_id),
      })
      applicants.value = aRes?.records ?? aRes?.data ?? []
    }

    // If applicant is preselected, fetch their batch automatically
    if (hasApplicantContext.value && !form.value.batch_id) {
      const { data: appRes } = await http.get(`/applicants/${applicantIdFromQuery.value}`)
      const applicant = appRes?.data ?? appRes
      form.value.batch_id = applicant?.batch_id ?? null
    }
  } catch (e) {
    console.error('Failed to load data:', e)
    toast.add({
      severity: 'error',
      summary: 'Load failed',
      detail: 'Could not load form data',
      life: 3500,
    })
  } finally {
    loadingData.value = false
  }
})

// ═══════════════════════════════════════════════════════════
// When batch changes → reload FINAL LIST applicants in that batch
// ═══════════════════════════════════════════════════════════
async function onBatchChange() {
  if (!showApplicantSelector.value) return

  form.value.applicant_id = null
  try {
    const { data } = await http.get('/applicants', {
      params: buildApplicantParams(form.value.batch_id),   // ✅ Uses same filter
    })
    applicants.value = data?.records ?? data?.data ?? []
  } catch (e) {
    console.error(e)
  }
}

// ═══════════════════════════════════════════════════════════
// Submit
// ═══════════════════════════════════════════════════════════
async function submit() {
  if (!form.value.file) {
    toast.add({ severity: 'warn', summary: 'File required', detail: 'Please choose a file', life: 3000 })
    return
  }
  if (!form.value.applicant_id) {
    toast.add({ severity: 'warn', summary: 'Applicant required', life: 3000 })
    return
  }
  if (!form.value.document_type_id) {
    toast.add({ severity: 'warn', summary: 'Document type required', life: 3000 })
    return
  }
  if (showBatchSelector.value && !form.value.batch_id) {
    toast.add({ severity: 'warn', summary: 'Batch required', life: 3000 })
    return
  }

  submitting.value = true
  try {
    const payload: CreateDocumentPayload = {
      applicant_id:     form.value.applicant_id,
      document_type_id: form.value.document_type_id,
      file:             form.value.file,
    }

    if (form.value.batch_id) {
      payload.batch_id = form.value.batch_id
    }
    if (form.value.document_date) {
      payload.document_date = form.value.document_date.toISOString().slice(0, 10)
    }
    if (form.value.expiry_date) {
      payload.expiry_date = form.value.expiry_date.toISOString().slice(0, 10)
    }
    if (form.value.notes) {
      payload.notes = form.value.notes
    }

    await documentApi.create(payload)

    toast.add({
      severity: 'success',
      summary: 'Document uploaded',
      detail: 'File saved successfully',
      life: 2500,
    })

    if (hasApplicantContext.value) {
      router.push({
        name: 'documents.folder',
        params: { applicantId: applicantIdFromQuery.value! },
        query: batchIdFromQuery.value ? { from_batch: String(batchIdFromQuery.value) } : {},
      })
    } else if (hasBatchContext.value) {
      router.push({
        name: 'documents.folders',
        params: { batchId: String(batchIdFromQuery.value) },
      })
    } else {
      router.push({ name: 'documents.batches' })
    }
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Upload failed',
      detail: e?.response?.data?.message ?? 'Something went wrong',
      life: 4000,
    })
  } finally {
    submitting.value = false
  }
}

function cancel() {
  router.back()
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-3xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <Button icon="pi pi-arrow-left" text rounded @click="cancel" />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          Upload Document
        </h1>
        <p class="text-sm text-blueberry-500 mt-1">
          <template v-if="hasApplicantContext">
            Uploading to applicant's folder — batch is inherited automatically
          </template>
          <template v-else-if="hasBatchContext">
            Uploading to a batch — pick an applicant to continue
          </template>
          <template v-else>
            Global upload — select batch and applicant
          </template>
        </p>
      </div>
    </div>

    <!-- Form -->
    <form
      class="bg-white rounded-2xl border border-appleCore-100 p-6 space-y-6"
      @submit.prevent="submit"
    >
      <!-- ═══════ INFO BANNER — Only Final List ═══════ -->
      <div
        class="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200"
      >
        <i class="pi pi-info-circle text-blue-500 mt-0.5" />
        <div class="text-sm text-blue-700">
          <p class="font-medium">Only Final List applicants can receive documents</p>
          <p class="text-xs text-blue-600 mt-0.5">
            Rejected or in-progress applicants are hidden from the list below.
          </p>
        </div>
      </div>

      <!-- ═══════ CONTEXT BADGE ═══════ -->
      <div
        v-if="hasApplicantContext || hasBatchContext"
        class="flex items-center gap-3 p-3 rounded-xl bg-apricot-50 border border-apricot-100"
      >
        <i class="pi pi-info-circle text-apricot-600" />
        <p class="text-sm text-blueberry-700">
          <template v-if="hasApplicantContext">
            Batch and applicant are locked from context
          </template>
          <template v-else>
            Batch is locked from context — pick an applicant below
          </template>
        </p>
      </div>

      <!-- ═══════ BATCH ═══════ -->
      <div v-if="showBatchSelector">
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Batch <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="form.batch_id"
          :options="batches"
          option-label="name"
          option-value="id"
          placeholder="Select a batch..."
          class="w-full"
          filter
          :loading="loadingData"
          @change="onBatchChange"
        />
      </div>

      <!-- ═══════ APPLICANT (Final List only) ═══════ -->
      <div v-if="showApplicantSelector">
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Applicant <span class="text-red-500">*</span>
          <span class="ml-1 text-[10px] text-green-600 normal-case font-medium">
            (Final List only)
          </span>
        </label>
        <Select
          v-model="form.applicant_id"
          :options="applicants"
          option-label="full_name"
          option-value="id"
          placeholder="Select an applicant..."
          class="w-full"
          filter
          :loading="loadingData"
          :disabled="showBatchSelector && !form.batch_id"
        />
        <p v-if="showBatchSelector && !form.batch_id" class="text-xs text-blueberry-400 mt-1">
          Pick a batch first
        </p>
        <p
          v-else-if="!loadingData && applicants.length === 0"
          class="text-xs text-orange-600 mt-1 flex items-center gap-1"
        >
          <i class="pi pi-exclamation-triangle text-[10px]" />
          No Final List applicants found
          <span v-if="form.batch_id">in this batch</span>
        </p>
      </div>

      <!-- ═══════ DOCUMENT TYPE ═══════ -->
      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Document Type <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="form.document_type_id"
          :options="documentTypes"
          option-label="name"
          option-value="id"
          placeholder="Select document type..."
          class="w-full"
          filter
          :loading="loadingData"
        />
      </div>

      <!-- ═══════ FILE ═══════ -->
      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          File <span class="text-red-500">*</span>
        </label>
        <DocumentUploadDropzone
          :disabled="submitting"
          @file="form.file = $event"
          @error="(m) => toast.add({ severity: 'error', summary: 'Invalid file', detail: m, life: 3500 })"
        />
      </div>

      <!-- ═══════ DATES ═══════ -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Document Date
          </label>
          <DatePicker v-model="form.document_date" class="w-full" date-format="yy-mm-dd" show-icon />
        </div>
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Expiry Date
          </label>
          <DatePicker v-model="form.expiry_date" class="w-full" date-format="yy-mm-dd" show-icon />
        </div>
      </div>

      <!-- ═══════ NOTES ═══════ -->
      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Notes
        </label>
        <Textarea
          v-model="form.notes"
          rows="3"
          placeholder="Optional notes about this document..."
          class="w-full"
        />
      </div>

      <!-- ═══════ ACTIONS ═══════ -->
      <div class="flex items-center justify-end gap-2 pt-4 border-t border-appleCore-100">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          :disabled="submitting"
          @click="cancel"
        />
        <Button
          type="submit"
          label="Upload Document"
          icon="pi pi-upload"
          :loading="submitting"
          class="!bg-apricot-500 !border-apricot-500 hover:!bg-apricot-600"
        />
      </div>
    </form>
  </div>
</template>