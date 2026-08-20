<script setup lang="ts">
import { computed } from 'vue'
import type { Permission } from '../types'

// PrimeVue
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Skeleton from 'primevue/skeleton'
import Divider from 'primevue/divider'

const props = defineProps<{
  grouped: Record<string, Permission[]>
  loading: boolean
}>()

const moduleNames = computed(() => Object.keys(props.grouped).sort())

function moduleColor(module: string): string {
  const colors: Record<string, string> = {
    role:       'info',
    permission: 'warning',
    user:       'success',
    applicant:  'primary',
    document:   'secondary',
  }
  return colors[module] ?? 'secondary'
}
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <Skeleton v-for="n in 5" :key="n" height="6rem" class="w-full rounded-xl" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="moduleNames.length === 0"
      class="flex flex-col items-center justify-center py-16 text-surface-400"
    >
      <i class="pi pi-folder-open text-5xl mb-4" />
      <p class="text-lg font-medium">No permissions found</p>
    </div>

    <!-- Groups -->
    <div
      v-for="module in moduleNames"
      :key="module"
      class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 overflow-hidden"
    >
      <!-- Group Header -->
      <div class="flex items-center justify-between px-5 py-3 bg-surface-50 dark:bg-surface-800">
        <div class="flex items-center gap-3">
          <i class="pi pi-folder text-primary-500" />
          <h3 class="font-semibold capitalize text-surface-900 dark:text-surface-0">
            {{ module }}
          </h3>
          <Tag
            :value="`${grouped[module].length} permissions`"
            :severity="moduleColor(module)"
            class="text-xs"
          />
        </div>
      </div>

      <Divider class="my-0" />

      <!-- Permissions Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y divide-surface-100 dark:divide-surface-700">
        <div
          v-for="perm in grouped[module]"
          :key="perm.id"
          class="p-4 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
        >
          <div class="flex items-start gap-2">
            <i class="pi pi-key text-warning-500 mt-1 text-xs" />
            <div class="flex-1 min-w-0">
              <p class="font-mono text-sm text-surface-900 dark:text-surface-0 truncate">
                {{ perm.name }}
              </p>
              <p
                v-if="perm.description"
                class="text-xs text-surface-500 mt-1"
              >
                {{ perm.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>