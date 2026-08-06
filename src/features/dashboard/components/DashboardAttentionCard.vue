<script setup lang="ts">
interface AttentionItem {
  id: string | number
  type: 'expiring' | 'correction' | 'mismatch' | 'incomplete'
  title: string
  count: number
  href?: string
}

const props = defineProps<{
  items?: AttentionItem[]
  loading?: boolean
}>()

const typeConfig: Record<string, { icon: string; color: string; bg: string; ring: string; route?: string }> = {
  expiring:   { icon: 'pi-calendar-times',       color: 'text-red-600',    bg: 'bg-red-50',    ring: 'ring-red-100',    route: '/documents/expiring-soon' },
  correction: { icon: 'pi-pencil',               color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-100', route: '/correction-requests' },
  mismatch:   { icon: 'pi-exclamation-triangle', color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-100', route: '/verification-mismatches' },
  incomplete: { icon: 'pi-info-circle',          color: 'text-blue-600',   bg: 'bg-blue-50',   ring: 'ring-blue-100',   route: '/applicants?status=incomplete' },
}
</script>

<template>
  <div class="space-y-2 min-h-[200px]">
    <!-- Loading -->
    <div v-if="loading && !items?.length" class="flex items-center justify-center py-12">
      <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
    </div>

    <!-- Empty (all zeros) -->
    <div
      v-else-if="!items?.length || items.every((i) => i.count === 0)"
      class="flex flex-col items-center justify-center py-8 text-center gap-2"
    >
      <div class="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
        <i class="pi pi-check-circle text-xl text-green-500" />
      </div>
      <p class="text-sm font-semibold text-blueberry-700">All clear! 🎉</p>
      <p class="text-xs text-blueberry-400">Nothing needs your attention</p>
    </div>

    <!-- Items -->
    <router-link
      v-for="item in items"
      v-else
      :key="item.id"
      :to="typeConfig[item.type]?.route ?? '/'"
      class="flex items-center gap-3 p-3 rounded-xl bg-white ring-1 hover:shadow-md transition-all group"
      :class="typeConfig[item.type]?.ring"
    >
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        :class="typeConfig[item.type]?.bg"
      >
        <i class="pi" :class="[typeConfig[item.type]?.icon, typeConfig[item.type]?.color]" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-blueberry-800 truncate">{{ item.title }}</p>
        <p class="text-[11px] text-blueberry-500 mt-0.5">
          {{ item.count }} {{ item.count === 1 ? 'item needs attention' : 'items need attention' }}
        </p>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-lg font-bold" :class="typeConfig[item.type]?.color">
          {{ item.count }}
        </span>
        <i class="pi pi-chevron-right text-[10px] text-blueberry-400 group-hover:text-blueberry-700 transition-colors" />
      </div>
    </router-link>
  </div>
</template>