<!-- src/features/verification-mismatches/components/VerificationMismatchDetailPanel.vue -->
<script setup lang="ts">
import VerificationMismatchResolveDialog from './VerificationMismatchResolveDialog.vue'
import VerificationMismatchWaiveDialog from './VerificationMismatchWaiveDialog.vue'
import VerificationMismatchEscalateDialog from './VerificationMismatchEscalateDialog.vue'
import type { VerificationMismatch } from '../types'

defineProps<{
  record: VerificationMismatch | null
  resolveVisible: boolean
  waiveVisible: boolean
  escalateVisible: boolean
  notes: string
  submitting: boolean
}>()

defineEmits<{
  (e: 'update:resolveVisible', v: boolean): void
  (e: 'update:waiveVisible', v: boolean): void
  (e: 'update:escalateVisible', v: boolean): void
  (e: 'update:notes', v: string): void
  (e: 'resolve'): void
  (e: 'waive'): void
  (e: 'escalate'): void
}>()
</script>

<template>
  <div>
    <VerificationMismatchResolveDialog
      :visible="resolveVisible"
      :record="record"
      :notes="notes"
      :submitting="submitting"
      @update:visible="(v: boolean) => $emit('update:resolveVisible', v)"
      @update:notes="(v: string) => $emit('update:notes', v)"
      @confirm="$emit('resolve')"
    />
    <VerificationMismatchWaiveDialog
      :visible="waiveVisible"
      :record="record"
      :notes="notes"
      :submitting="submitting"
      @update:visible="(v: boolean) => $emit('update:waiveVisible', v)"
      @update:notes="(v: string) => $emit('update:notes', v)"
      @confirm="$emit('waive')"
    />
    <VerificationMismatchEscalateDialog
      :visible="escalateVisible"
      :record="record"
      :notes="notes"
      :submitting="submitting"
      @update:visible="(v: boolean) => $emit('update:escalateVisible', v)"
      @update:notes="(v: string) => $emit('update:notes', v)"
      @confirm="$emit('escalate')"
    />
  </div>
</template>