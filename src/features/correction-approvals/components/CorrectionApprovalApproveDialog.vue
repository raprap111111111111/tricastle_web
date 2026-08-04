<!-- src/features/correction-approvals/components/CorrectionApprovalApproveDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Chips from 'primevue/chips'
import type { CorrectionApproval } from '../types'

defineProps<{
  visible: boolean
  record: CorrectionApproval | null
  comments: string
  conditions: string[]
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'update:comments', v: string): void
  (e: 'update:conditions', v: string[]): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Approve Correction Request"
    :style="{ width: '500px' }"
    :closable="!submitting"
    :draggable="false"
    @update:visible="(v: boolean) => emit('update:visible', v)"
  >
    <div v-if="record" class="flex flex-col gap-4">
      <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p class="text-sm text-emerald-800">
          <i class="pi pi-info-circle mr-1" />
          Approving
          <span class="font-semibold">
            {{ record.correction_request?.request_code ?? `#${record.correction_request_id}` }}
          </span>
          at Level {{ record.approval_level }}
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-600">
          Comments <span class="text-blueberry-300">(optional)</span>
        </label>
        <Textarea
          :model-value="comments"
          rows="3"
          placeholder="Add any approval notes..."
          auto-resize
          @update:model-value="(v: string | undefined) => emit('update:comments', v ?? '')"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-600">
          Conditions
          <span class="text-blueberry-300">(optional, press Enter to add)</span>
        </label>
        <Chips
          :model-value="conditions"
          placeholder="e.g. Provide new medical certificate"
          @update:model-value="(v: string[] | undefined) => emit('update:conditions', v ?? [])"
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
        label="Approve"
        icon="pi pi-check"
        severity="success"
        :loading="submitting"
        @click="emit('confirm')"
      />
    </template>
  </Dialog>
</template>