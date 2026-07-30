<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Message from 'primevue/message'

import { useBatchStore } from '@/features/batches/stores/batch.store'
import type { BatchAssignmentValues } from '../../schemas/applicant.schema'
import type { ApplicantBatchStatus } from '../../types'

const props = defineProps<{
  initialValues?: BatchAssignmentValues | null
}>()

const emit = defineEmits<{
  next: [values: BatchAssignmentValues]
  back: []
  validate: [values: BatchAssignmentValues | null]
}>()

const batchStore = useBatchStore()

// ─── State ──────────────────────────────────────────────
const batchId     = ref<number | null>(props.initialValues?.batch_id ?? null)
const batchStatus = ref<ApplicantBatchStatus>(
  (props.initialValues?.batch_status as ApplicantBatchStatus) ?? 'applied',
)

// ─── Options ────────────────────────────────────────────
const batchOptions = computed(() =>
  batchStore.batches.map((b: any) => ({
    label: `${b.name} — ${b.country ?? 'Unknown'} (${b.status})`,
    value: b.id,
  })),
)

const statusOptions: { label: string; value: ApplicantBatchStatus }[] = [
  { label: 'Applied',             value: 'applied' },
  { label: 'Shortlisted',         value: 'shortlisted' },
  { label: 'Interview Scheduled', value: 'interview_scheduled' },
  { label: 'Interview Passed',    value: 'interview_passed' },
  { label: 'Medical Pending',     value: 'medical_pending' },
  { label: 'Exam Pending',        value: 'exam_pending' },
  { label: 'Accepted',            value: 'accepted' },
]

// ─── Load batches ───────────────────────────────────────
onMounted(async () => {
  if (batchStore.batches.length === 0) {
    await batchStore.fetchBatches()
  }
  validate()
})

// ─── Validation ─────────────────────────────────────────
function validate() {
  // Batch is optional, so it's always valid
  emit('validate', {
    batch_id: batchId.value,
    batch_status: batchId.value ? batchStatus.value : null,
  })
}

watch([batchId, batchStatus], validate)

// ─── Handlers ───────────────────────────────────────────
function onNext() {
  emit('next', {
    batch_id: batchId.value,
    batch_status: batchId.value ? batchStatus.value : null,
  })
}

function onClear() {
  batchId.value = null
  batchStatus.value = 'applied'
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-appleCore-100 p-6">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-lg font-serif font-semibold text-blueberry-800 flex items-center gap-2">
        <i class="pi pi-users text-apricot-500" />
        Batch Assignment
        <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">(Optional)</span>
      </h3>
      <p class="text-sm text-blueberry-500 mt-1">
        Assign this applicant to a deployment batch now, or leave blank to assign later.
      </p>
    </div>

    <!-- Empty state -->
    <Message
      v-if="batchOptions.length === 0 && !batchStore.loading"
      severity="info"
      :closable="false"
      class="mb-4"
    >
      No batches available. You can create one from the Batches module.
    </Message>

    <!-- Form -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Batch selector -->
      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Select Batch
        </label>
        <Select
          v-model="batchId"
          :options="batchOptions"
          option-label="label"
          option-value="value"
          placeholder="Choose a batch..."
          filter
          show-clear
          :loading="batchStore.loading"
          class="w-full"
        />
      </div>

      <!-- Status selector -->
      <div v-if="batchId">
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Initial Status <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="batchStatus"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
    </div>

    <!-- Confirmation message -->
    <Message
      v-if="batchId"
      severity="success"
      :closable="false"
      class="mt-4"
    >
      Applicant will be added to the selected batch with status
      <strong>"{{ statusOptions.find(s => s.value === batchStatus)?.label }}"</strong>.
    </Message>

    <!-- Action buttons -->
    <div class="flex items-center justify-between mt-6 pt-6 border-t border-appleCore-100">
      <Button
        label="Back"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="emit('back')"
      />

      <div class="flex items-center gap-2">
        <Button
          v-if="batchId"
          label="Clear Selection"
          icon="pi pi-times"
          severity="secondary"
          text
          @click="onClear"
        />
        <Button
          label="Continue"
          icon="pi pi-arrow-right"
          icon-pos="right"
          @click="onNext"
        />
      </div>
    </div>
  </div>
</template>