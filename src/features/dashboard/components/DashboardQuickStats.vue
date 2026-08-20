<script setup lang="ts">
interface QuickStat {
  label: string
  value: string | number
  icon: string
  color: string
  bg: string
}

defineProps<{
  stats?: QuickStat[]
  loading?: boolean
}>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <!-- Loading skeletons -->
    <template v-if="loading && !stats?.length">
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-center gap-2.5 p-3 rounded-xl bg-white ring-1 ring-appleCore-200 animate-pulse"
      >
        <div class="w-9 h-9 rounded-lg bg-appleCore-200 flex-shrink-0" />
        <div class="flex-1 space-y-1">
          <div class="h-2 w-16 bg-appleCore-200 rounded" />
          <div class="h-4 w-10 bg-appleCore-200 rounded" />
        </div>
      </div>
    </template>

    <!-- Real stats -->
    <div
      v-for="stat in stats"
      v-else
      :key="stat.label"
      class="flex items-center gap-2.5 p-3 rounded-xl bg-white ring-1 ring-appleCore-200"
    >
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        :class="stat.bg"
      >
        <i class="pi" :class="[stat.icon, stat.color]" />
      </div>
      <div class="min-w-0">
        <p class="text-[10px] font-medium text-blueberry-500 uppercase tracking-wide truncate">
          {{ stat.label }}
        </p>
        <p class="text-base font-bold text-blueberry-800 leading-tight">
          {{ stat.value }}
        </p>
      </div>
    </div>
  </div>
</template>