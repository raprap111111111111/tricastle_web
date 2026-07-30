<!-- src/features/documents/views/DocumentCreateView.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'

import {
  AppButton,
  AppCard,
  AppFormField,
  AppFormSection,
  AppApplicantPicker,
  AppDocumentTypePicker,
} from '@shared/ui'

import DocumentUploadDropzone from '../components/DocumentUploadDropzone.vue'
import { useDocumentStore } from '../stores/document.store'
import type { Applicant } from '@features/applicants/types'
import type { DocumentType } from '@features/document-types/types'

const router = useRouter()
const route  = useRoute()
const toast  = useToast()
const store  = useDocumentStore()

const preselectedApplicantId = computed(() => {
  const q = route.query.applicant_id
  return q ? Number(q) : null
})

// ─── State ───────────────────────────────────────────────────────────────────
const applicantId       = ref<number | null>(preselectedApplicantId.value)
const selectedApplicant = ref<Applicant | null>(null)

const documentTypeId    = ref<number | null>(null)
const selectedType      = ref<DocumentType | null>(null)

const file         = ref<File | null>(null)
const documentDate = ref<Date | null>(null)
const expiryDate   = ref<Date | null>(null)
const priority     = ref<'low' | 'normal' | 'high' | 'urgent'>('normal')
const notes        = ref<string>('')

// ─── Options ─────────────────────────────────────────────────────────────────
const priorityOptions = [
  { label: 'Low',     value: 'low' },
  { label: 'Normal',  value: 'normal' },
  { label: 'High',    value: 'high' },
  { label: 'Urgent',  value: 'urgent' },
]

// ─── Computed ────────────────────────────────────────────────────────────────
const canSubmit = computed(
  () =>
    applicantId.value    !== null &&
    documentTypeId.value !== null &&
    file.value           !== null,
)

// ─── Handlers ────────────────────────────────────────────────────────────────
function onApplicantSelected(app: Applicant) {
  selectedApplicant.value = app
}
function onApplicantCleared() {
  selectedApplicant.value = null
}

function onTypeSelected(t: DocumentType) {
  selectedType.value = t

  // Auto-fill expiry date from validity_days if not manually set
  if (t.validity_days && !expiryDate.value) {
    const base = documentDate.value ?? new Date()
    const d    = new Date(base)
    d.setDate(d.getDate() + t.validity_days)
    expiryDate.value = d
  }
}
function onTypeCleared() {
  selectedType.value = null
}

function onFileSelected(f: File) {
  file.value = f
}
function onFileError(msg: string) {
  toast.add({
    severity: 'error',
    summary:  'Invalid File',
    detail:   msg,
    life:     4000,
  })
}

function toISO(d: Date | null): string | null {
  return d ? d.toISOString().split('T')[0] : null
}

async function onSubmit() {
  if (!canSubmit.value || !file.value) return
  try {
    const created = await store.createDocument({
      applicant_id:     applicantId.value!,
      document_type_id: documentTypeId.value!,
      file:             file.value,
      document_date:    toISO(documentDate.value),
      expiry_date:      toISO(expiryDate.value),
      priority:         priority.value,
      notes:            notes.value || null,
    })

    toast.add({
      severity: 'success',
      summary:  'Uploaded',
      detail:   `Document "${created.file_name}" uploaded successfully.`,
      life:     3500,
    })
    router.push({ name: 'documents.index' })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary:  'Upload Failed',
      detail:   e?.response?.data?.message ?? store.error ?? 'Try again.',
      life:     5000,
    })
  }
}

function applicantFullName(app: Applicant): string {
  const middle = app.middle_name ? ` ${app.middle_name}` : ''
  const suffix = app.suffix      ? ` ${app.suffix}`      : ''
  return `${app.first_name}${middle} ${app.last_name}${suffix}`.trim()
}

function applicantInitials(app: Applicant): string {
  const f = app.first_name?.charAt(0) ?? ''
  const l = app.last_name?.charAt(0)  ?? ''
  return (f + l).toUpperCase() || '?'
}
</script>

<template>
  <!-- ✅ Autofill trap -->
  <div class="absolute w-0 h-0 overflow-hidden opacity-0" aria-hidden="true">
    <input type="text"     name="fakeusernameremembered" autocomplete="username" />
    <input type="password" name="fakepasswordremembered" autocomplete="new-password" />
  </div>

  <form class="max-w-5xl mx-auto" autocomplete="off" @submit.prevent="onSubmit">
    <!-- ─── Header ───────────────────────────────────────── -->
    <div class="flex items-center gap-3 mb-6">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        type="button"
        @click="router.push({ name: 'documents.index' })"
      />
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-serif font-bold text-blueberry-800 leading-tight">
          Upload Document
        </h1>
        <p class="text-sm text-blueberry-500 mt-0.5">
          Upload and attach a document to an applicant
        </p>
      </div>
    </div>

    <!-- ─── Body ─────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT: File -->
      <div class="lg:col-span-1">
        <AppCard>
          <div class="space-y-4">
            <div>
              <h2 class="text-base font-serif font-semibold text-blueberry-800">
                Document File
              </h2>
              <p class="text-xs text-blueberry-400 mt-0.5">
                PDF, JPG, PNG · max 10 MB
              </p>
            </div>

            <DocumentUploadDropzone
              :disabled="store.submitting"
              @file="onFileSelected"
              @error="onFileError"
            />

            <div
              class="rounded-xl border border-appleCore-200 bg-appleCore-50/60
                     px-3 py-2.5 flex items-start gap-2"
            >
              <i class="pi pi-info-circle text-apricot-500 text-sm mt-0.5" />
              <p class="text-xs text-blueberry-500 leading-relaxed">
                For best OCR accuracy, upload a
                <span class="font-semibold text-blueberry-700">clear scan</span>
                or high-resolution photo.
              </p>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- RIGHT: Details -->
      <div class="lg:col-span-2">
        <AppCard>
          <div class="space-y-6">
            <!-- Applicant -->
            <AppFormSection title="Applicant">
              <AppFormField label="Assign to Applicant" required>
                <AppApplicantPicker
                  v-model="applicantId"
                  placeholder="Search by name, code, or email…"
                  @select="onApplicantSelected"
                  @clear="onApplicantCleared"
                />
              </AppFormField>

              <div
                v-if="selectedApplicant"
                class="mt-3 flex items-center gap-3 rounded-xl border
                       border-green-200 bg-green-50/40 px-3 py-2.5"
              >
                <div
                  class="w-10 h-10 rounded-full bg-apricot-500 text-white
                         flex items-center justify-center flex-shrink-0
                         font-serif font-bold text-sm"
                >
                  {{ applicantInitials(selectedApplicant) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-blueberry-800 truncate">
                    {{ applicantFullName(selectedApplicant) }}
                  </p>
                  <div class="flex items-center gap-2 text-xs mt-0.5">
                    <span class="font-mono text-apricot-600 font-semibold">
                      {{ selectedApplicant.applicant_code }}
                    </span>
                    <span class="text-blueberry-400 truncate">
                      · {{ selectedApplicant.email }}
                    </span>
                  </div>
                </div>
                <i class="pi pi-check-circle text-green-600 text-lg" />
              </div>
            </AppFormSection>

            <!-- Classification -->
            <AppFormSection title="Classification">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AppFormField label="Document Type" required>
                  <AppDocumentTypePicker
                    v-model="documentTypeId"
                    placeholder="Search type by name or code…"
                    @select="onTypeSelected"
                    @clear="onTypeCleared"
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

              <!-- Selected type preview -->
              <div
                v-if="selectedType"
                class="mt-3 flex items-center gap-3 rounded-xl border
                       border-apricot-200 bg-apricot-50/40 px-3 py-2.5"
              >
                <div
                  class="w-10 h-10 rounded-xl bg-apricot-500 text-white
                         flex items-center justify-center flex-shrink-0"
                >
                  <i class="pi pi-tag text-base" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-blueberry-800 truncate">
                      {{ selectedType.name }}
                    </p>
                    <span
                      v-if="selectedType.is_required"
                      class="text-[10px] font-bold uppercase tracking-wide
                             text-red-600 bg-red-50 px-1.5 py-0.5 rounded"
                    >
                      Required
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-xs mt-0.5">
                    <span
                      class="font-mono text-apricot-600 font-semibold
                             bg-white px-1.5 py-0.5 rounded"
                    >
                      {{ selectedType.code }}
                    </span>
                    <span class="text-blueberry-400 capitalize">
                      · {{ selectedType.category }}
                    </span>
                    <span v-if="selectedType.validity_days" class="text-blueberry-400">
                      · {{ selectedType.validity_days }}d validity
                    </span>
                  </div>
                </div>
                <i class="pi pi-check-circle text-apricot-600 text-lg" />
              </div>
            </AppFormSection>

            <!-- Dates -->
            <AppFormSection
              title="Dates"
              description="Optional — used for expiry tracking & alerts"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AppFormField label="Document Date">
                  <Calendar
                    v-model="documentDate"
                    date-format="yy-mm-dd"
                    show-icon
                    placeholder="YYYY-MM-DD"
                    class="w-full"
                  />
                </AppFormField>

                <AppFormField label="Expiry Date">
                  <Calendar
                    v-model="expiryDate"
                    date-format="yy-mm-dd"
                    show-icon
                    placeholder="YYYY-MM-DD"
                    class="w-full"
                  />
                </AppFormField>
              </div>
            </AppFormSection>

            <!-- Notes -->
            <AppFormSection title="Notes">
              <AppFormField label="Internal Notes" hint="Only visible to staff members">
                <Textarea
                  v-model="notes"
                  rows="3"
                  placeholder="Any additional context about this document…"
                  class="w-full"
                />
              </AppFormField>
            </AppFormSection>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- ─── Footer ───────────────────────────────────────── -->
    <div
      class="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center
             sm:justify-between gap-3 rounded-2xl border border-appleCore-100
             bg-white px-5 py-4"
    >
      <!-- Completion checklist -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium"
          :class="file
            ? 'bg-green-50 text-green-700'
            : 'bg-appleCore-100 text-blueberry-500'"
        >
          <i :class="file ? 'pi pi-check-circle' : 'pi pi-circle'" class="text-[10px]" />
          File
        </span>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium"
          :class="selectedApplicant
            ? 'bg-green-50 text-green-700'
            : 'bg-appleCore-100 text-blueberry-500'"
        >
          <i :class="selectedApplicant ? 'pi pi-check-circle' : 'pi pi-circle'" class="text-[10px]" />
          Applicant
        </span>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium"
          :class="documentTypeId
            ? 'bg-green-50 text-green-700'
            : 'bg-appleCore-100 text-blueberry-500'"
        >
          <i :class="documentTypeId ? 'pi pi-check-circle' : 'pi pi-circle'" class="text-[10px]" />
          Type
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 flex-shrink-0">
        <AppButton
          type="button"
          variant="secondary"
          :disabled="store.submitting"
          class="!w-auto whitespace-nowrap"
          @click="router.push({ name: 'documents.index' })"
        >
          Cancel
        </AppButton>
        <AppButton
          type="submit"
          icon="pi pi-upload"
          :loading="store.submitting"
          :disabled="!canSubmit"
          class="!w-auto whitespace-nowrap"
        >
          Upload Document
        </AppButton>
      </div>
    </div>
  </form>
</template>