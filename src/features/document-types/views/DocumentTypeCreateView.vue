<!-- src/features/document-types/views/DocumentTypeCreateView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'

import {
  AppButton,
  AppCard,
  AppFormField,
  AppFormSection,
} from '@shared/ui'
import RequiredFieldsEditor from '../components/RequiredFieldsEditor.vue'
import { useDocumentTypeStore } from '@features/document-types/stores/documentType.store'

import type { DocumentTypeCategory } from '../types'

const router = useRouter()
const toast  = useToast()
const store  = useDocumentTypeStore()

// ─── State ─────────────────────────────────────────
const name              = ref('')
const code              = ref('')
const description       = ref('')
const category          = ref<DocumentTypeCategory>('primary')
const isRequired        = ref(true)
const isActive          = ref(true)
const validityDays      = ref<number | null>(null)
const expiryWarningDays = ref<number>(30)
const sortOrder         = ref<number>(0)
const requiredFields    = ref<string[]>([])

const categoryOptions = [
  { label: 'Primary',    value: 'primary' },
  { label: 'Supporting', value: 'supporting' },
]

// Auto-uppercase code as user types
function onCodeInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  code.value = val.toUpperCase().replace(/[^A-Z0-9_]/g, '')
}

async function onSubmit() {
  if (!name.value.trim() || !code.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Info',
      detail: 'Name and code are required.',
      life: 3000,
    })
    return
  }

  try {
    const created = await store.createType({
      name: name.value.trim(),
      code: code.value.trim(),
      description: description.value || null,
      category: category.value,
      is_required: isRequired.value,
      is_active: isActive.value,
      validity_days: validityDays.value,
      expiry_warning_days: expiryWarningDays.value,
      sort_order: sortOrder.value,
      required_fields: requiredFields.value.length > 0 ? requiredFields.value : null,
    })

    toast.add({
      severity: 'success',
      summary: 'Created',
      detail: `"${created.name}" created successfully.`,
      life: 3000,
    })
    router.push({ name: 'document-types.index' })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Create Failed',
      detail: e?.response?.data?.message ?? store.error ?? 'Try again.',
      life: 4000,
    })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <Button
        icon="pi pi-arrow-left"
        text
        rounded
        type="button"
        @click="router.push({ name: 'document-types.index' })"
      />
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl font-serif font-bold text-blueberry-800 leading-tight">
          New Document Type
        </h1>
        <p class="text-sm text-blueberry-500 mt-0.5">
          Define a new document category with validation rules
        </p>
      </div>
    </div>

    <form autocomplete="off" @submit.prevent="onSubmit">
      <AppCard>
        <div class="space-y-6">

          <!-- Basic info -->
          <AppFormSection title="Basic Information">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppFormField label="Name" required>
                <InputText
                  v-model="name"
                  placeholder="e.g. Philippine Passport"
                  class="w-full"
                />
              </AppFormField>

              <AppFormField
                label="Code"
                required
                hint="Uppercase letters, numbers, underscores only"
              >
                <InputText
                  v-model="code"
                  placeholder="e.g. PASSPORT"
                  class="w-full font-mono"
                  @input="onCodeInput"
                />
              </AppFormField>

              <AppFormField label="Category" required>
                <Select
                  v-model="category"
                  :options="categoryOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </AppFormField>

              <AppFormField
                label="Sort Order"
                hint="Lower numbers appear first in lists"
              >
                <InputNumber
                  v-model="sortOrder"
                  :min="0"
                  :use-grouping="false"
                  class="w-full"
                />
              </AppFormField>
            </div>

            <AppFormField label="Description" class="mt-5">
              <Textarea
                v-model="description"
                rows="2"
                placeholder="Optional description of what this document type is for..."
                class="w-full"
              />
            </AppFormField>
          </AppFormSection>

          <!-- Expiry policy -->
          <AppFormSection
            title="Expiry Policy"
            description="Configure how long this document type is valid"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AppFormField
                label="Validity (days)"
                hint="Leave empty for documents that never expire"
              >
                <InputNumber
                  v-model="validityDays"
                  :min="1"
                  :use-grouping="false"
                  placeholder="e.g. 365"
                  class="w-full"
                />
              </AppFormField>

              <AppFormField
                label="Expiry Warning (days before)"
                hint="Send alerts this many days before expiry"
              >
                <InputNumber
                  v-model="expiryWarningDays"
                  :min="0"
                  :use-grouping="false"
                  class="w-full"
                />
              </AppFormField>
            </div>
          </AppFormSection>

          <!-- Required fields for OCR -->
          <AppFormSection
            title="Required Fields"
            description="Fields that OCR should extract from documents of this type"
          >
            <RequiredFieldsEditor v-model="requiredFields" />
          </AppFormSection>

          <!-- Flags -->
          <AppFormSection title="Settings">
            <div class="space-y-3">
              <div
                class="flex items-center justify-between rounded-xl border
                       border-appleCore-200 px-4 py-3"
              >
                <div>
                  <p class="text-sm font-semibold text-blueberry-800">Required</p>
                  <p class="text-xs text-blueberry-400 mt-0.5">
                    Applicants must submit this document to complete their profile
                  </p>
                </div>
                <ToggleSwitch v-model="isRequired" />
              </div>

              <div
                class="flex items-center justify-between rounded-xl border
                       border-appleCore-200 px-4 py-3"
              >
                <div>
                  <p class="text-sm font-semibold text-blueberry-800">Active</p>
                  <p class="text-xs text-blueberry-400 mt-0.5">
                    Available for selection when uploading new documents
                  </p>
                </div>
                <ToggleSwitch v-model="isActive" />
              </div>
            </div>
          </AppFormSection>
        </div>
      </AppCard>

      <!-- Footer -->
      <div
        class="mt-6 flex items-center justify-end gap-3
               rounded-2xl border border-appleCore-100 bg-white px-5 py-4"
      >
        <AppButton
          type="button"
          variant="secondary"
          :disabled="store.submitting"
          class="!w-auto whitespace-nowrap"
          @click="router.push({ name: 'document-types.index' })"
        >
          Cancel
        </AppButton>
        <AppButton
          type="submit"
          icon="pi pi-check"
          :loading="store.submitting"
          :disabled="!name.trim() || !code.trim()"
          class="!w-auto whitespace-nowrap"
        >
          Create Document Type
        </AppButton>
      </div>
    </form>
  </div>
</template>