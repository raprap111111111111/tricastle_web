<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    hintText?: string
    duration?: number
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    label:    'Hold to delete',
    hintText: 'hold 2s',
    duration: 2000,
    disabled: false,
    loading:  false,
  },
)

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const progress   = ref(0)
const isHolding  = ref(false)
const intervalId = ref<number | null>(null)
const startTime  = ref(0)

function startHold() {
  if (props.disabled || props.loading) return
  isHolding.value = true
  startTime.value = Date.now()

  intervalId.value = window.setInterval(() => {
    const elapsed = Date.now() - startTime.value
    progress.value = Math.min((elapsed / props.duration) * 100, 100)

    if (progress.value >= 100) {
      stopHold(true)
      emit('complete')
    }
  }, 16)
}

function stopHold(completed = false) {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
  isHolding.value = false
  if (!completed) {
    progress.value = 0
  }
}

function cancelHold() {
  stopHold(false)
}

onBeforeUnmount(() => {
  if (intervalId.value) clearInterval(intervalId.value)
})

const progressRounded = computed(() => Math.round(progress.value))

// SVG ring math
const CIRCUMFERENCE = 2 * Math.PI * 22
const strokeDashoffset = computed(
  () => CIRCUMFERENCE - (progress.value / 100) * CIRCUMFERENCE,
)
</script>

<template>
  <div class="flex flex-col gap-3 w-full select-none">
    <!-- Button -->
    <div
      class="relative bg-white rounded-2xl px-4 py-3 border border-appleCore-200
             cursor-pointer transition-none"
      :class="(props.disabled || props.loading) && 'opacity-50 cursor-not-allowed'"
      @mousedown="startHold"
      @mouseup="cancelHold"
      @mouseleave="cancelHold"
      @touchstart.prevent="startHold"
      @touchend="cancelHold"
      @touchcancel="cancelHold"
    >
      <div class="flex items-center gap-4">
        <!-- Circular trash + ring -->
        <div class="relative w-12 h-12 flex-shrink-0">
          <svg class="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
            <!-- background ring -->
            <circle
              cx="24" cy="24" r="22"
              fill="none"
              stroke="rgb(232, 217, 191)"
              stroke-width="2"
            />
            <!-- progress ring (danger red) -->
            <circle
              cx="24" cy="24" r="22"
              fill="none"
              stroke="#dc2626"
              stroke-width="2"
              stroke-linecap="round"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="strokeDashoffset"
            />
          </svg>

          <!-- Trash icon -->
          <div class="absolute inset-0 flex items-center justify-center">
            <i
              v-if="props.loading"
              class="pi pi-spin pi-spinner text-red-600 text-base"
            />
            <i
              v-else
              class="pi pi-trash text-red-600 text-base"
            />
          </div>
        </div>

        <!-- Label + hint -->
        <div class="flex-1 min-w-0">
          <p class="text-blueberry-800 font-semibold text-sm">
            {{ props.loading ? 'Deleting...' : props.label }}
          </p>
          <p class="text-blueberry-400 text-xs mt-0.5">
            {{ props.hintText }}
          </p>
        </div>

        <!-- Percentage -->
        <div class="text-right flex-shrink-0">
          <span
            class="font-bold text-lg tabular-nums"
            :class="progress > 0 ? 'text-red-600' : 'text-appleCore-300'"
          >
            {{ progressRounded }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Thin progress bar under button -->
    <div class="w-full h-0.5 bg-appleCore-100 rounded-full overflow-hidden">
      <div
        class="h-full bg-red-500 rounded-full"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
div {
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
</style>