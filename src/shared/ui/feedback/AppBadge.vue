<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClass"
  >
    <span
      v-if="dot"
      class="w-1.5 h-1.5 rounded-full"
      :class="dotClass"
    />
    <i v-if="icon" :class="icon" class="text-[10px]" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'apricot' | 'blueberry' | 'citrus' | 'appleCore' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: Variant
    icon?: string
    dot?: boolean
  }>(),
  {
    variant: 'neutral',
    dot: false,
  },
)

const badgeClass = computed(() => {
  const map: Record<Variant, string> = {
    apricot:   'bg-apricot-100 text-apricot-700',
    blueberry: 'bg-blueberry-100 text-blueberry-700',
    citrus:    'bg-citrus-100 text-citrus-800',
    appleCore: 'bg-appleCore-100 text-appleCore-800',
    success:   'bg-green-100 text-green-700',
    warning:   'bg-yellow-100 text-yellow-800',
    danger:    'bg-red-100 text-red-700',
    info:      'bg-blue-100 text-blue-700',
    neutral:   'bg-gray-100 text-gray-700',
  }
  return map[props.variant]
})

const dotClass = computed(() => {
  const map: Record<Variant, string> = {
    apricot:   'bg-apricot-500',
    blueberry: 'bg-blueberry-500',
    citrus:    'bg-citrus-500',
    appleCore: 'bg-appleCore-500',
    success:   'bg-green-500',
    warning:   'bg-yellow-500',
    danger:    'bg-red-500',
    info:      'bg-blue-500',
    neutral:   'bg-gray-500',
  }
  return map[props.variant]
})
</script>