<!-- src/shared/ui/AppStatCard.vue -->
<script setup lang="ts">
defineProps<{
  label:      string
  value:      string | number
  icon:       string
  iconClass?: string
  trend?:     string
  trendUp?:   boolean
}>()
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-appleCore-200 px-5 py-4
           flex items-center gap-4"
  >
    <!-- Icon -->
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      :class="iconClass ?? 'bg-appleCore-50 text-blueberry-500'"
    >
      <i :class="[icon, 'text-lg']" />
    </div>

    <!-- Content -->
    <div class="min-w-0">
      <p class="text-xs text-blueberry-400 font-medium uppercase tracking-wide truncate">
        {{ label }}
      </p>
      <p class="text-xl font-serif font-semibold text-blueberry-800 mt-0.5 leading-tight">
        {{ value }}
      </p>
      <p
        v-if="trend"
        class="text-xs mt-0.5"
        :class="trendUp ? 'text-green-500' : 'text-red-400'"
      >
        <i :class="trendUp ? 'pi pi-arrow-up' : 'pi pi-arrow-down'" class="text-xs mr-0.5" />
        {{ trend }}
      </p>
    </div>
  </div>
</template>