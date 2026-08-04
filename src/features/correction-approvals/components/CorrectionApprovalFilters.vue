<!-- src/features/correction-approvals/components/CorrectionApprovalFilters.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { CorrectionApprovalListParams, ApprovalDecision, ApprovalLevel } from '../types'

const emit = defineEmits<{
  (e: 'filter', filters: Partial<CorrectionApprovalListParams>): void
  (e: 'reset'): void
}>()

const decision = ref<ApprovalDecision | null>(null)
const level = ref<ApprovalLevel | null>(null)
const pendingOnly = ref(false)

const decisionOptions = [
  { label: 'All Decisions', value: null },
  { label: 'Pending', value: 'pending' as const },
  { label: 'Approved', value: 'approved' as const },
  { label: 'Rejected', value: 'rejected' as const },
  { label: 'Escalated', value: 'escalated' as const },
]

const levelOptions = [
  { label: 'All Levels', value: null },
  { label: 'Level 1 - Supervisor', value: 1 as const },
  { label: 'Level 2 - Admin', value: 2 as const },
]

function apply() {
  emit('filter', {
    decision: decision.value ?? undefined,
    approval_level: level.value ?? undefined,
    pending_only: pendingOnly.value || undefined,
  })
}

function reset() {
  decision.value = null
  level.value = null
  pendingOnly.value = false
  emit('reset')
}
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <div class="flex flex-col gap-1 min-w-40">
      <label class="text-xs font-semibold text-blueberry-600">Decision</label>
      <Select
        v-model="decision"
        :options="decisionOptions"
        option-label="label"
        option-value="value"
        placeholder="All"
        size="small"
      />
    </div>

    <div class="flex flex-col gap-1 min-w-40">
      <label class="text-xs font-semibold text-blueberry-600">Approval Level</label>
      <Select
        v-model="level"
        :options="levelOptions"
        option-label="label"
        option-value="value"
        placeholder="All"
        size="small"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs font-semibold text-blueberry-600">Quick Filter</label>
      <div class="flex items-center gap-2 h-9">
        <input
          id="pending-only"
          v-model="pendingOnly"
          type="checkbox"
          class="rounded border-appleCore-300 text-apricot-500 focus:ring-apricot-500"
        />
        <label for="pending-only" class="text-sm text-blueberry-700 cursor-pointer">
          Pending only
        </label>
      </div>
    </div>

    <div class="flex gap-2 ml-auto">
      <Button
        label="Apply"
        icon="pi pi-filter"
        size="small"
        severity="primary"
        @click="apply"
      />
      <Button
        label="Reset"
        icon="pi pi-refresh"
        size="small"
        severity="secondary"
        outlined
        @click="reset"
      />
    </div>
  </div>
</template>