<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import ToggleSwitch from 'primevue/toggleswitch'
import Message from 'primevue/message'
import type { Batch, BatchPayload, BatchStatus } from '../types'

const props = defineProps<{
  initial?: Batch | null
  submitLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: BatchPayload]
  cancel: []
}>()

// ─── Form state interface ────────────────────────────────
interface FormState {
  batch_number: number
  name: string
  country: string | null
  deployment_date: Date | null
  status: BatchStatus
  is_active: boolean
  description: string | null
}

// ─── Helpers ─────────────────────────────────────────────
function toDate(str: string | null | undefined): Date | null {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

function toDateString(date: Date | null | undefined): string | null {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return null
  return d.toISOString().split('T')[0]
}

// ─── Form state ──────────────────────────────────────────
const form = ref<FormState>({
  batch_number:    props.initial?.batch_number ?? 1,
  name:            props.initial?.name ?? '',
  country:         props.initial?.country ?? 'Japan',
  deployment_date: toDate(props.initial?.deployment_date),
  status:          props.initial?.status ?? 'draft',
  is_active:       props.initial?.is_active ?? false,
  description:     props.initial?.description ?? '',
})

const statusOptions: { label: string; value: BatchStatus }[] = [
  { label: 'Draft',     value: 'draft' },
  { label: 'Ongoing',   value: 'ongoing' },
  { label: 'Deployed',  value: 'deployed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

// Sync on external change
watch(
  () => props.initial,
  (val) => {
    if (val) {
      form.value = {
        batch_number:    val.batch_number,
        name:            val.name,
        country:         val.country,
        deployment_date: toDate(val.deployment_date),
        status:          val.status,
        is_active:       val.is_active,
        description:     val.description,
      }
    }
  },
)

function onSubmit() {
  const payload: BatchPayload = {
    batch_number:    form.value.batch_number,
    name:            form.value.name,
    country:         form.value.country,
    deployment_date: toDateString(form.value.deployment_date),
    status:          form.value.status,
    is_active:       form.value.is_active,
    description:     form.value.description,
  }
  emit('submit', payload)
}
</script>

<template>
  <form
    class="bg-white rounded-2xl border border-appleCore-100 p-6 space-y-6"
    @submit.prevent="onSubmit"
  >
    <!-- Row 1: Number + Name -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Batch Number <span class="text-red-500">*</span>
        </label>
        <InputNumber
          v-model="form.batch_number"
          :min="1"
          show-buttons
          class="w-full"
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Batch Name <span class="text-red-500">*</span>
        </label>
        <InputText
          v-model="form.name"
          placeholder="e.g. Japan Batch 1"
          class="w-full"
        />
      </div>
    </div>

    <!-- Row 2: Country + Deployment -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Country
        </label>
        <InputText
          v-model="form.country"
          placeholder="Japan"
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Deployment Date
        </label>
        <DatePicker
          v-model="form.deployment_date"
          date-format="yy-mm-dd"
          show-icon
          class="w-full"
        />
      </div>
    </div>

    <!-- Row 3: Status -->
    <div>
      <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
        Status
      </label>
      <Select
        v-model="form.status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        class="w-full max-w-xs"
      />
    </div>

    <!-- ─── Active Toggle ───────────────────────────────── -->
    <div class="border border-apricot-200 bg-apricot-50/50 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <ToggleSwitch v-model="form.is_active" input-id="is-active" />
        <div class="flex-1">
          <label for="is-active" class="cursor-pointer">
            <p class="text-sm font-semibold text-blueberry-800">
              Set as Active Batch
            </p>
            <p class="text-xs text-blueberry-500 mt-0.5">
              When enabled, this batch becomes the default for new applicants.
              <strong>Any other active batch will be automatically deactivated.</strong>
            </p>
          </label>
        </div>
      </div>

      <Message
        v-if="form.is_active"
        severity="warn"
        :closable="false"
        class="mt-3"
      >
        Enabling this will deactivate the currently active batch (if any).
      </Message>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
        Description
      </label>
      <Textarea
        v-model="form.description"
        rows="4"
        placeholder="Any notes or details about this batch..."
        class="w-full"
      />
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-2 pt-4 border-t border-appleCore-100">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        outlined
        @click="emit('cancel')"
      />
      <Button
        type="submit"
        :label="submitLabel ?? 'Save'"
        :loading="loading"
        icon="pi pi-check"
      />
    </div>
  </form>
</template>