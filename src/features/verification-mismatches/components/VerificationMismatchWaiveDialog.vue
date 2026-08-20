<!-- src/features/verification-mismatches/components/VerificationMismatchWaiveDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import type { VerificationMismatch } from '../types'

defineProps<{
  visible: boolean
  record: VerificationMismatch | null
  notes: string
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'update:notes', v: string): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Waive Mismatch"
    :style="{ width: '500px' }"
    :closable="!submitting"
    :draggable="false"
    @update:visible="(v: boolean) => emit('update:visible', v)"
  >
    <div v-if="record" class="flex flex-col gap-4">
      <div class="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <p class="text-sm text-slate-800">
          <i class="pi pi-ban mr-1" />
          Waiving <span class="font-semibold">{{ record.field_label }}</span> —
          this mismatch will be marked as acceptable
        </p>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-600">
          Waiver Justification <span class="text-red-500">*</span>
        </label>
        <Textarea
          :model-value="notes"
          rows="4"
          placeholder="Explain why this mismatch is being waived..."
          auto-resize
          @update:model-value="(v: string | undefined) => emit('update:notes', v ?? '')"
        />
        <span class="text-[10px] text-blueberry-400">
          Minimum 10 characters required
        </span>
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
        label="Waive"
        icon="pi pi-ban"
        severity="secondary"
        :loading="submitting"
        :disabled="notes.length < 10"
        @click="emit('confirm')"
      />
    </template>
  </Dialog>
</template>