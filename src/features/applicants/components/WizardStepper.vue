<script setup lang="ts">
import type { WizardStep, StepValidationState } from '../composables/useApplicantWizard'

const props = defineProps<{
  steps: WizardStep[]
  currentIndex: number
  progress: number
  stepStates: Record<string, StepValidationState>
}>()

const emit = defineEmits<{
  (e: 'go-to', index: number): void
}>()

function stepStatus(index: number, key: string): 'active' | 'invalid' | 'completed' | 'pending' {
  if (props.stepStates[key] === 'invalid') return 'invalid'
  if (index === props.currentIndex) return 'active'
  if (index < props.currentIndex) return 'completed'
  return 'pending'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Progress Bar -->
    <div class="w-full bg-appleCore-100 rounded-full h-1.5 overflow-hidden">
      <div
        class="bg-apricot-500 h-1.5 rounded-full transition-all duration-500"
        :style="{ width: `${props.progress}%` }"
      />
    </div>

    <!-- Steps -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="(step, index) in props.steps"
        :key="step.key"
        type="button"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border"
        :class="{
          'bg-apricot-500 text-white border-apricot-500 shadow-sm':
            stepStatus(index, step.key) === 'active',
          'bg-green-50 text-green-700 border-green-200 hover:bg-green-100':
            stepStatus(index, step.key) === 'completed',
          'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 animate-pulse':
            stepStatus(index, step.key) === 'invalid',
          'bg-white text-blueberry-500 border-appleCore-200 hover:border-appleCore-300':
            stepStatus(index, step.key) === 'pending',
        }"
        @click="emit('go-to', index)"
      >
        <i
          :class="[
            stepStatus(index, step.key) === 'invalid'   ? 'pi pi-exclamation-triangle' :
            stepStatus(index, step.key) === 'completed' ? 'pi pi-check-circle' :
            step.icon,
            'text-xs',
          ]"
        />
        <span class="hidden sm:inline">{{ step.label }}</span>
        <span class="sm:hidden">{{ index + 1 }}</span>
      </button>
    </div>

    <!-- Current Step Info -->
    <div class="flex items-center gap-2 text-sm text-blueberry-500">
      <i :class="props.steps[props.currentIndex].icon" />
      <span>
        Step {{ props.currentIndex + 1 }} of {{ props.steps.length }}:
        {{ props.steps[props.currentIndex].description }}
      </span>
    </div>
  </div>
</template>