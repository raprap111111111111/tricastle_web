<!-- src/features/correction-approvals/components/CorrectionApprovalDetailPanel.vue -->
<script setup lang="ts">
import CorrectionApprovalStatusBadge from './CorrectionApprovalStatusBadge.vue'
import CorrectionApprovalLevelBadge from './CorrectionApprovalLevelBadge.vue'
import CorrectionApprovalApproveDialog from './CorrectionApprovalApproveDialog.vue'
import CorrectionApprovalRejectDialog from './CorrectionApprovalRejectDialog.vue'
import CorrectionApprovalEscalateDialog from './CorrectionApprovalEscalateDialog.vue'
import type { CorrectionApproval } from '../types'

defineProps<{
  record: CorrectionApproval | null
  approveVisible: boolean
  rejectVisible: boolean
  escalateVisible: boolean
  comments: string
  reason: string
  conditions: string[]
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:approve-visible', v: boolean): void
  (e: 'update:reject-visible', v: boolean): void
  (e: 'update:escalate-visible', v: boolean): void
  (e: 'update:comments', v: string): void
  (e: 'update:reason', v: string): void
  (e: 'update:conditions', v: string[]): void
  (e: 'approve'): void
  (e: 'reject'): void
  (e: 'escalate'): void
}>()

function formatDateTime(s: string | null | undefined) {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <CorrectionApprovalApproveDialog
    :visible="approveVisible"
    :record="record"
    :comments="comments"
    :conditions="conditions"
    :submitting="submitting"
    @update:visible="(v) => emit('update:approve-visible', v)"
    @update:comments="(v) => emit('update:comments', v)"
    @update:conditions="(v) => emit('update:conditions', v)"
    @confirm="emit('approve')"
  />

  <CorrectionApprovalRejectDialog
    :visible="rejectVisible"
    :record="record"
    :reason="reason"
    :submitting="submitting"
    @update:visible="(v) => emit('update:reject-visible', v)"
    @update:reason="(v) => emit('update:reason', v)"
    @confirm="emit('reject')"
  />

  <CorrectionApprovalEscalateDialog
    :visible="escalateVisible"
    :record="record"
    :reason="reason"
    :comments="comments"
    :submitting="submitting"
    @update:visible="(v) => emit('update:escalate-visible', v)"
    @update:reason="(v) => emit('update:reason', v)"
    @update:comments="(v) => emit('update:comments', v)"
    @confirm="emit('escalate')"
  />
</template>