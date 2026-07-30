<template>
  <section class="space-y-4">
    <div v-if="title || description" class="flex items-center justify-between">
      <div>
        <h2 v-if="title" class="text-lg font-serif font-semibold text-blueberry-800">
          {{ title }}
        </h2>
        <p v-if="description" class="text-sm text-blueberry-500 mt-0.5">
          {{ description }}
        </p>
      </div>
      <slot name="actions" />
    </div>

    <div>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>