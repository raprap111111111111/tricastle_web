<template>
  <div class="bg-white p-6 rounded-2xl shadow-soft border border-appleCore-100 hover:shadow-medium transition-shadow">
    <div class="flex items-center justify-between">
      <div class="min-w-0 flex-1">
        <p class="text-sm text-blueberry-500 truncate">{{ label }}</p>
        <p class="text-3xl font-serif font-bold text-blueberry-800 mt-1">
          {{ value }}
        </p>
        <div v-if="trend !== undefined" class="flex items-center gap-1 mt-2">
          <i
            :class="[
              trend >= 0 ? 'pi pi-arrow-up text-green-600' : 'pi pi-arrow-down text-red-500',
              'text-xs',
            ]"
          />
          <span
            class="text-xs font-medium"
            :class="trend >= 0 ? 'text-green-600' : 'text-red-500'"
          >
            {{ Math.abs(trend) }}%
          </span>
          <span v-if="trendLabel" class="text-xs text-blueberry-400 ml-1">
            {{ trendLabel }}
          </span>
        </div>
      </div>

      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        :class="iconBg"
      >
        <i :class="[icon, 'text-white text-xl']" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'apricot' | 'blueberry' | 'citrus' | 'appleCore' | 'green' | 'red'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    icon: string
    variant?: Variant
    trend?: number
    trendLabel?: string
  }>(),
  { variant: 'apricot' },
)

const iconBg = computed(() => {
  const map: Record<Variant, string> = {
    apricot: 'bg-apricot-500',
    blueberry: 'bg-blueberry-500',
    citrus: 'bg-citrus-500',
    appleCore: 'bg-appleCore-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  }
  return map[props.variant]
})
</script>