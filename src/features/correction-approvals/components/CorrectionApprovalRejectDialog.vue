<!-- src/features/correction-approvals/components/CorrectionApprovalRejectDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import type { CorrectionApproval } from '../types'

defineProps<{
  visible: boolean
  record: CorrectionApproval | null
  reason: string
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'update:reason', v: string): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    modal
    header="Reject Correction Request"
    :style="{ width: '500px' }"
    :closable="!submitting"
    :draggable="false"
  >
    <div v-if="record" class="flex flex-col gap-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-sm text-red-800">
          <i class="pi pi-exclamation-triangle mr-1" />
          You are rejecting
          <span class="font-semibold">
            {{ record.correction_request?.request_code ?? `#${record.correction_request_id}` }}
          </span>
          at Level {{ record.approval_level }}.
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-600">
          Reason <span class="text-red-500">*</span>
        </label>
        <Textarea
          :model-value="reason"
          @update:model-value="(v) => emit('update:reason', v ?? '')"
          rows="4"
          placeholder="Explain why this is being rejected..."
          auto-resize
        />
        <p class="text-xs text-blueberry-400">This will be visible to the requester.</p>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        severity="secondary"
        outlined
        :disabled="submitting"
        @click="emit('update:visible', false)"
      />
      <Button
        label="Reject"
        icon="pi pi-times"
        severity="danger"
        :loading="submitting"
        @click="emit('confirm')"
      />
    </template>
  </Dialog>
</template>