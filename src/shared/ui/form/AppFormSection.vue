<template>
  <section class="space-y-4">
    <div v-if="title || description" class="border-b border-appleCore-200 pb-3 mb-4">
      <h3 v-if="title" class="text-lg font-serif font-semibold text-blueberry-800">
        {{ title }}
      </h3>
      <p v-if="description" class="text-sm text-blueberry-500 mt-1">
        {{ description }}
      </p>
    </div>

    <div class="grid gap-4" :class="gridClass">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    columns?: 1 | 2 | 3 | 4
  }>(),
  { columns: 2 },
)

const gridClass = computed(() => {
  const map = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }
  return map[props.columns]
})
</script>