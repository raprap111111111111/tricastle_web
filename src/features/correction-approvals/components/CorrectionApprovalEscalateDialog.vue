<!-- src/features/correction-approvals/components/CorrectionApprovalEscalateDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import type { CorrectionApproval } from '../types'

defineProps<{
  visible: boolean
  record: CorrectionApproval | null
  reason: string
  comments: string
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'update:reason', v: string): void
  (e: 'update:comments', v: string): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    modal
    header="Escalate to Admin"
    :style="{ width: '500px' }"
    :closable="!submitting"
    :draggable="false"
  >
    <div v-if="record" class="flex flex-col gap-4">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-sm text-blue-800">
          <i class="pi pi-arrow-up-right mr-1" />
          Escalating
          <span class="font-semibold">
            {{ record.correction_request?.request_code ?? `#${record.correction_request_id}` }}
          </span>
          to Level 2 (Admin).
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-600">
          Escalation Reason <span class="text-red-500">*</span>
        </label>
        <Textarea
          :model-value="reason"
          @update:model-value="(v) => emit('update:reason', v ?? '')"
          rows="3"
          placeholder="Why does this need admin review?"
          auto-resize
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-600">
          Additional Comments <span class="text-blueberry-300">(optional)</span>
        </label>
        <Textarea
          :model-value="comments"
          @update:model-value="(v) => emit('update:comments', v ?? '')"
          rows="2"
          placeholder="Any context for the admin..."
          auto-resize
        />
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
        label="Escalate"
        icon="pi pi-arrow-up-right"
        severity="info"
        :loading="submitting"
        @click="emit('confirm')"
      />
    </template>
  </Dialog>
</template>