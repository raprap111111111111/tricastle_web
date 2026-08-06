<script setup lang="ts">
import { AppStatCard } from '@shared/ui'
import type { StatCard, StatVariant } from '../types'

defineProps<{
  stats: StatCard[]
  loading?: boolean
}>()

// Whitelist of valid variants (must match AppStatCard's Variant type)
const VALID_VARIANTS: readonly StatVariant[] = [
  'apricot',
  'blueberry',
  'citrus',
  'appleCore',
] as const

/**
 * Coerces backend-provided variant into a safe, valid one.
 * Falls back to 'blueberry' for anything unrecognized.
 */
function safeVariant(value: string | undefined | null): StatVariant {
  if (value && (VALID_VARIANTS as readonly string[]).includes(value)) {
    return value as StatVariant
  }
  return 'blueberry'
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    <!-- Loading skeletons -->
    <template v-if="loading && stats.length === 0">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white rounded-2xl ring-1 ring-appleCore-200 p-5 animate-pulse"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="space-y-2 flex-1">
            <div class="h-3 w-24 bg-appleCore-200 rounded" />
            <div class="h-8 w-16 bg-appleCore-200 rounded" />
          </div>
          <div class="w-12 h-12 rounded-xl bg-appleCore-200" />
        </div>
        <div class="h-3 w-32 bg-appleCore-200 rounded" />
      </div>
    </template>

    <!-- Real cards -->
    <AppStatCard
      v-for="stat in stats"
      v-else
      :key="stat.label"
      :label="stat.label"
      :value="stat.value"
      :icon="stat.icon"
      :variant="safeVariant(stat.variant)"
      :trend="stat.trend"
      :trend-label="stat.trend_label"
    />
  </div>
</template>