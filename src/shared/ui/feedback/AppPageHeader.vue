<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div class="min-w-0 flex-1">
      <div v-if="breadcrumbs?.length" class="flex items-center gap-1.5 text-xs text-blueberry-400 mb-1">
        <template v-for="(crumb, i) in breadcrumbs" :key="i">
          <RouterLink
            v-if="crumb.to"
            :to="crumb.to"
            class="hover:text-apricot-500 transition-colors"
          >
            {{ crumb.label }}
          </RouterLink>
          <span v-else>{{ crumb.label }}</span>
          <i v-if="i < breadcrumbs.length - 1" class="pi pi-chevron-right text-[8px]" />
        </template>
      </div>

      <h1 class="text-2xl font-serif font-bold text-blueberry-800 truncate">
        {{ title }}
      </h1>
      <p v-if="description" class="text-blueberry-500 mt-1 text-sm">
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.default" class="flex items-center gap-2 flex-shrink-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

export interface Breadcrumb {
  label: string
  to?: string
}

defineProps<{
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
}>()
</script>