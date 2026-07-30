<template>
  <div class="text-center py-16 px-4">
    <div class="mx-auto w-20 h-20 bg-appleCore-100 rounded-full flex items-center justify-center mb-4">
      <i :class="icon" class="text-3xl text-blueberry-400" />
    </div>
    <h3 class="text-lg font-serif font-semibold text-blueberry-800 mb-1">
      {{ title }}
    </h3>
    <p v-if="description" class="text-sm text-blueberry-500 mb-6 max-w-md mx-auto">
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title: string
    description?: string
  }>(),
  { icon: 'pi pi-inbox' },
)
</script>