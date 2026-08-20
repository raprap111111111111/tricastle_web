<!-- src/features/applicants/components/final-list/FinalListBulkActionsBar.vue -->
<script setup lang="ts">
import Button from 'primevue/button'

defineProps<{
  selectedCount:      number
  deployableCount:    number
  nonDeployableCount: number
  submitting?:        boolean
}>()

defineEmits<{
  clear:  []
  deploy: []
}>()
</script>

<template>
  <div v-if="selectedCount > 0"
    class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4
           bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200
           rounded-xl shadow-sm">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
        <i class="pi pi-check-square text-white" />
      </div>
      <div>
        <p class="text-sm font-semibold text-green-900">
          {{ selectedCount }} applicant{{ selectedCount > 1 ? 's' : '' }} selected
        </p>
        <p class="text-xs text-green-700 mt-0.5">
          <span v-if="deployableCount > 0">
            <strong>{{ deployableCount }}</strong> ready to deploy
          </span>
          <span v-if="nonDeployableCount > 0" class="text-amber-700 ml-2">
            ⚠️ {{ nonDeployableCount }} without batch (will be skipped)
          </span>
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Button label="Clear Selection" icon="pi pi-times" severity="secondary" text size="small" @click="$emit('clear')" />
      <Button :label="`Deploy Selected (${deployableCount})`" icon="pi pi-send"
        :disabled="deployableCount === 0"
        :loading="submitting"
        class="!bg-green-600 hover:!bg-green-700 !border-green-600 !text-white !shadow-sm"
        @click="$emit('deploy')" />
    </div>
  </div>
</template>