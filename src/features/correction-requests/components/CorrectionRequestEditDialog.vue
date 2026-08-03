<!-- src/features/correction-requests/components/CorrectionRequestEditDialog.vue -->
<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import { useCorrectionRequestStore } from '../stores/correction-request.store'
import type { CorrectionRequest, UpdateCorrectionRequestPayload } from '../types'

const props = defineProps<{
  visible: boolean
  record: CorrectionRequest | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'updated', record: CorrectionRequest): void
}>()

const store = useCorrectionRequestStore()
const toast = useToast()

const form = reactive<UpdateCorrectionRequestPayload>({
  severity: 'low',
  description: '',
  justification: '',
  requires_approval: false,
  requires_new_document: false,
  due_date: undefined,
})

const dueDateModel = ref<Date | null>(null)

watch(
  () => props.record,
  (r) => {
    if (!r) return

    Object.assign(form, {
      severity: r.severity,
      description: r.description,
      justification: r.justification ?? '',
      requires_approval: r.requires_approval,
      requires_new_document: r.requires_new_document,
      due_date: r.due_date ?? undefined,
    })

    dueDateModel.value = r.due_date ? new Date(r.due_date) : null
  },
  { immediate: true },
)

watch(dueDateModel, (date) => {
  if (!date) {
    form.due_date = undefined
    return
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  form.due_date = `${year}-${month}-${day}`
})

const severityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Critical', value: 'critical' },
]

async function submit() {
  if (!props.record) return
  try {
    const updated = await store.update(props.record.id, form)
    if (updated) {
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: `${updated.request_code} updated successfully.`,
        life: 3000,
      })
      emit('updated', updated)
      emit('update:visible', false)
    }
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: err?.response?.data?.message ?? 'Something went wrong.',
      life: 4000,
    })
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!store.submitting"
    :style="{ width: '560px', maxWidth: '95vw' }"
    :pt="{
      root: { class: 'rounded-xl overflow-hidden' },
      header: {
        class: '!px-5 !py-4 border-b border-surface-200 dark:border-surface-700',
      },
      content: { class: '!p-5' },
      footer: {
        class: '!px-5 !py-3 border-t border-surface-200 dark:border-surface-700',
      },
    }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-pencil text-primary-500" />
        <div>
          <p class="font-semibold text-surface-800 dark:text-surface-100 text-sm">
            Edit Correction Request
          </p>
          <p class="text-xs text-surface-400 mt-0.5">
            {{ record?.request_code }}
          </p>
        </div>
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
        <p
          v-if="form.description && form.description.length < 10"
          class="text-xs text-red-500"
        >
          Minimum 10 characters
        </p>
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
      <div class="flex flex-wrap items-center gap-6 pt-1">
        <label
          class="flex items-center gap-2 cursor-pointer text-sm text-surface-700 dark:text-surface-200"
        >
          <Checkbox v-model="form.requires_approval" binary />
          Requires Approval
        </label>
        <label
          class="flex items-center gap-2 cursor-pointer text-sm text-surface-700 dark:text-surface-200"
        >
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
          :disabled="store.submitting"
          @click="$emit('update:visible', false)"
        />
        <Button
          label="Save Changes"
          icon="pi pi-check"
          size="small"
          :loading="store.submitting"
          :disabled="!form.description || form.description.length < 10"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>