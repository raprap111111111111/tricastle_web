<!-- src/features/correction-requests/components/CorrectionRequestDetailPanel.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import type { CorrectionRequest } from '../types'
import CorrectionRequestStatusBadge from './CorrectionRequestStatusBadge.vue'
import CorrectionRequestSeverityBadge from './CorrectionRequestSeverityBadge.vue'

defineProps<{
  record: CorrectionRequest | null

  // Action dialogs
  approveVisible: boolean
  rejectVisible: boolean
  completeVisible: boolean
  cancelVisible: boolean

  approveNotes: string
  rejectReason: string
  completeNotes: string
  cancelReason: string

  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:approveVisible', v: boolean): void
  (e: 'update:rejectVisible', v: boolean): void
  (e: 'update:completeVisible', v: boolean): void
  (e: 'update:cancelVisible', v: boolean): void
  (e: 'update:approveNotes', v: string): void
  (e: 'update:rejectReason', v: string): void
  (e: 'update:completeNotes', v: string): void
  (e: 'update:cancelReason', v: string): void
  (e: 'approve'): void
  (e: 'reject'): void
  (e: 'complete'): void
  (e: 'cancel'): void
}>()

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>

<template>
  <!-- Approve -->
  <Dialog
    :visible="approveVisible"
    modal
    header="Approve Request"
    :style="{ width: '400px' }"
    :pt="{ root: { class: 'rounded-xl' }, content: { class: '!p-5' }, footer: { class: '!px-5 !py-3' } }"
    @update:visible="$emit('update:approveVisible', $event)"
  >
    <div class="space-y-3">
      <p class="text-sm text-surface-600 dark:text-surface-300">
        Approve <strong>{{ record?.request_code }}</strong>?
      </p>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-surface-500">Notes (optional)</label>
        <Textarea
          :model-value="approveNotes"
          rows="3"
          class="w-full"
          placeholder="Add notes..."
          @update:model-value="$emit('update:approveNotes', $event)"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" size="small" text severity="secondary" @click="$emit('update:approveVisible', false)" />
        <Button label="Approve" icon="pi pi-check" size="small" severity="success" :loading="submitting" @click="$emit('approve')" />
      </div>
    </template>
  </Dialog>

  <!-- Reject -->
  <Dialog
    :visible="rejectVisible"
    modal
    header="Reject Request"
    :style="{ width: '400px' }"
    :pt="{ root: { class: 'rounded-xl' }, content: { class: '!p-5' }, footer: { class: '!px-5 !py-3' } }"
    @update:visible="$emit('update:rejectVisible', $event)"
  >
    <div class="space-y-3">
      <p class="text-sm text-surface-600 dark:text-surface-300">
        Reject <strong>{{ record?.request_code }}</strong>?
      </p>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-surface-500">
          Reason <span class="text-red-500">*</span>
        </label>
        <Textarea
          :model-value="rejectReason"
          rows="3"
          class="w-full"
          placeholder="Reason for rejection..."
          @update:model-value="$emit('update:rejectReason', $event)"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" size="small" text severity="secondary" @click="$emit('update:rejectVisible', false)" />
        <Button label="Reject" icon="pi pi-times" size="small" severity="danger" :loading="submitting" @click="$emit('reject')" />
      </div>
    </template>
  </Dialog>

  <!-- Complete -->
  <Dialog
    :visible="completeVisible"
    modal
    header="Mark as Complete"
    :style="{ width: '400px' }"
    :pt="{ root: { class: 'rounded-xl' }, content: { class: '!p-5' }, footer: { class: '!px-5 !py-3' } }"
    @update:visible="$emit('update:completeVisible', $event)"
  >
    <div class="space-y-3">
      <p class="text-sm text-surface-600 dark:text-surface-300">
        Mark <strong>{{ record?.request_code }}</strong> as completed?
      </p>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-surface-500">Notes (optional)</label>
        <Textarea
          :model-value="completeNotes"
          rows="3"
          class="w-full"
          placeholder="Completion notes..."
          @update:model-value="$emit('update:completeNotes', $event)"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" size="small" text severity="secondary" @click="$emit('update:completeVisible', false)" />
        <Button label="Complete" icon="pi pi-check-circle" size="small" :loading="submitting" @click="$emit('complete')" />
      </div>
    </template>
  </Dialog>

  <!-- Cancel -->
  <Dialog
    :visible="cancelVisible"
    modal
    header="Cancel Request"
    :style="{ width: '400px' }"
    :pt="{ root: { class: 'rounded-xl' }, content: { class: '!p-5' }, footer: { class: '!px-5 !py-3' } }"
    @update:visible="$emit('update:cancelVisible', $event)"
  >
    <div class="space-y-3">
      <p class="text-sm text-surface-600 dark:text-surface-300">
        Cancel <strong>{{ record?.request_code }}</strong>?
      </p>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-surface-500">
          Reason <span class="text-red-500">*</span>
        </label>
        <Textarea
          :model-value="cancelReason"
          rows="3"
          class="w-full"
          placeholder="Reason for cancellation..."
          @update:model-value="$emit('update:cancelReason', $event)"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Back" size="small" text severity="secondary" @click="$emit('update:cancelVisible', false)" />
        <Button label="Cancel Request" icon="pi pi-ban" size="small" severity="warn" :loading="submitting" @click="$emit('cancel')" />
      </div>
    </template>
  </Dialog>
</template>