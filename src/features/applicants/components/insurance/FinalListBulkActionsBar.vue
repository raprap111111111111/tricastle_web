<!-- src/features/applicants/components/final-list/FinalListBulkActionsBar.vue -->
<script setup lang="ts">
import Button from 'primevue/button'

defineProps<{
  selectedCount: number
  deployableCount: number
  nonDeployableCount: number
  submitting?: boolean
}>()

defineEmits<{
  (e: 'clear'): void
  (e: 'deploy'): void
  (e: 'export-insurance'): void
}>()
</script>

<template>
  <div
    v-if="selectedCount > 0"
    class="flex items-center justify-between gap-4 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm"
  >
    <!-- Left -->
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center shrink-0">
        <i class="pi pi-check text-base" />
      </div>

      <div class="min-w-0">
        <p class="text-sm font-semibold text-green-900">
          {{ selectedCount }} applicants selected
        </p>
        <p class="text-xs text-green-700">
          {{ deployableCount }} ready to deploy
          <span v-if="nonDeployableCount > 0">
            · {{ nonDeployableCount }} not deployable
          </span>
        </p>
      </div>
    </div>

    <!-- Right actions -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Clear -->
      <button
        type="button"
        class="px-2.5 py-1.5 text-xs font-medium text-green-700 hover:text-green-900 hover:bg-green-100 rounded-lg transition flex items-center gap-1.5"
        @click="$emit('clear')"
      >
        <i class="pi pi-times text-[10px]" />
        Clear Selection
      </button>

      <!-- 🛡️ Export Insurance -->
      <Button
        label="Export Insurance"
        icon="pi pi-file-word"
        size="small"
        severity="secondary"
        outlined
        class="!bg-white !border-slate-300 !text-slate-700 hover:!bg-slate-50"
        @click="$emit('export-insurance')"
      />

      <!-- Deploy -->
      <Button
        v-if="deployableCount > 0"
        :label="`Deploy Selected (${deployableCount})`"
        icon="pi pi-send"
        size="small"
        severity="success"
        :loading="submitting"
        @click="$emit('deploy')"
      />
    </div>
  </div>
</template>