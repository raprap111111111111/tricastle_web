<!-- src/features/correction-requests/components/CorrectionRequestCreateDialog.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import type { CorrectionRequest } from '../types'
import type { useCorrectionRequestForm } from '../composables/useCorrectionRequestForm'

const props = defineProps<{
  visible: boolean
  editTarget: CorrectionRequest | null
  form: ReturnType<typeof useCorrectionRequestForm>['form']
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit'): void
}>()

const isEdit = computed(() => !!props.editTarget)
const title = computed(() =>
  isEdit.value ? 'Edit Correction Request' : 'New Correction Request',
)

const severityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Critical', value: 'critical' },
]

const dueDateModel = ref<Date | null>(null)

watch(
  () => props.form.due_date,
  (val) => {
    if (!val) {
      if (dueDateModel.value) dueDateModel.value = null
      return
    }
    const d = new Date(val)
    if (isNaN(d.getTime())) return
    dueDateModel.value = d
  },
  { immediate: true },
)

watch(dueDateModel, (date) => {
  if (!date) {
    props.form.due_date = undefined
    return
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  props.form.due_date = `${year}-${month}-${day}`
})

watch(
  () => props.visible,
  (v) => {
    if (!v) {
      dueDateModel.value = null
    }
  },
)
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!submitting"
    :style="{ width: '560px', maxWidth: '95vw' }"
    :pt="{
      root: { class: 'rounded-xl overflow-hidden' },
      header: { class: '!px-5 !py-4 border-b border-surface-200 dark:border-surface-700' },
      content: { class: '!p-5' },
      footer: { class: '!px-5 !py-3 border-t border-surface-200 dark:border-surface-700' },
    }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-refresh text-primary-500" />
        <span class="font-semibold text-surface-800 dark:text-surface-100">
          {{ title }}
        </span>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Severity -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-300">
          Severity <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="form.severity"
          :options="severityOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-300">
          Description <span class="text-red-500">*</span>
        </label>
        <Textarea
          v-model="form.description"
          rows="3"
          placeholder="Describe what needs to be corrected..."
          class="w-full"
          auto-resize
        />
      </div>

      <!-- Justification -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-300">
          Justification
        </label>
        <Textarea
          v-model="form.justification"
          rows="2"
          placeholder="Why is this correction needed?"
          class="w-full"
          auto-resize
        />
      </div>

      <!-- Due Date -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-surface-600 dark:text-surface-300">
          Due Date
        </label>
        <DatePicker
          v-model="dueDateModel"
          date-format="yy-mm-dd"
          :min-date="new Date()"
          show-icon
          class="w-full"
        />
      </div>

      <!-- Flags -->
      <div class="flex items-center gap-6">
        <label class="flex items-center gap-2 cursor-pointer text-sm text-surface-700 dark:text-surface-200">
          <Checkbox v-model="form.requires_approval" binary />
          Requires Approval
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-sm text-surface-700 dark:text-surface-200">
          <Checkbox v-model="form.requires_new_document" binary />
          Requires New Document
        </label>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancel"
          size="small"
          text
          severity="secondary"
          :disabled="submitting"
          @click="$emit('update:visible', false)"
        />
        <Button
          :label="isEdit ? 'Update' : 'Submit'"
          icon="pi pi-check"
          size="small"
          :loading="submitting"
          @click="$emit('submit')"
        />
      </div>
    </template>
  </Dialog>
</template>