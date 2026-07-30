<template>
  <div :class="containerClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  }>(),
  { size: 'xl' },
)

const containerClass = computed(() => {
  const map = {
    sm:   'max-w-3xl mx-auto',
    md:   'max-w-5xl mx-auto',
    lg:   'max-w-7xl mx-auto',
    xl:   'max-w-[1400px] mx-auto',
    full: 'w-full',
  }
  return map[props.size]
})
</script>