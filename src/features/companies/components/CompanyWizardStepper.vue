<script setup lang="ts">
import type { WizardStep, StepKey, StepState } from '../composables/useCompanyWizard'

defineProps<{
  steps: WizardStep[]
  currentIndex: number
  progress: number
  stepStates: Record<StepKey, StepState>
}>()

defineEmits<{
  (e: 'go-to', index: number): void
}>()

function getStepClass(index: number, currentIdx: number, state: StepState): string {
  const isActive = index === currentIdx
  const isCompleted = index < currentIdx

  if (state === 'invalid') return 'bg-red-500 text-white ring-4 ring-red-100'
  if (isActive) return 'bg-apricot-500 text-white ring-4 ring-apricot-100'
  if (isCompleted || state === 'valid') return 'bg-green-500 text-white'
  return 'bg-appleCore-100 text-blueberry-400'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Progress bar -->
    <div class="w-full h-1.5 bg-appleCore-100 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-apricot-400 to-apricot-500 rounded-full transition-all duration-300"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <!-- Step indicators -->
    <div class="flex items-start justify-between gap-2">
      <button
        v-for="(step, index) in steps"
        :key="step.key"
        type="button"
        class="flex flex-col items-center gap-2 flex-1 group cursor-pointer"
        @click="$emit('go-to', index)"
      >
        <!-- Circle -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
          :class="getStepClass(index, currentIndex, stepStates[step.key])"
        >
          <i v-if="stepStates[step.key] === 'valid' && index !== currentIndex" class="pi pi-check text-xs" />
          <i v-else-if="stepStates[step.key] === 'invalid'" class="pi pi-times text-xs" />
          <i v-else :class="step.icon" class="text-xs" />
        </div>

        <!-- Label -->
        <div class="flex flex-col items-center gap-0.5 min-w-0">
          <span
            class="text-xs font-semibold truncate max-w-full"
            :class="index === currentIndex ? 'text-apricot-700' : 'text-blueberry-500'"
          >
            {{ step.label }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>