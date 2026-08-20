<script setup lang="ts">
import { onMounted, onActivated, ref, computed } from 'vue'
import { AppCard, AppStatCard } from '@shared/ui'
import { useActivityLogStore } from '../stores/activity-log.store'
import { useActivityLogs } from '../composables/useActivityLogs'
import { useActivityLogRealtime } from '@shared/pubnub/useActivityLogRealtime'
import ActivityLogTable from '../components/ActivityLogTable.vue'
import ActivityLogFilters from '../components/ActivityLogFilters.vue'
import type { ActivityLogFilters as IFilters } from '../types'

const store = useActivityLogStore()
const { stats } = useActivityLogs()

// ─── Track active quick filter ─────────────────────────
const activeQuickFilter = ref<string | null>(null)

async function load() {
  await store.fetchLogs()
}

onMounted(load)
onActivated(load)

// 📡 Real-time
useActivityLogRealtime({ onReload: load })

// ─── Quick Filter Cards ─────────────────────────────────
const quickFilters = [
  {
    key: 'all',
    label: 'All Activity',
    icon: 'pi pi-list',
    module: null,
    action: null,
    color: 'blueberry',
    gradient: 'from-blueberry-500 to-blueberry-700',
    ring: 'ring-blueberry-200',
  },
  {
    key: 'login',
    label: 'Logins',
    icon: 'pi pi-sign-in',
    module: 'LoginHistory',
    action: 'created',
    color: 'green',
    gradient: 'from-green-500 to-green-700',
    ring: 'ring-green-200',
  },
  {
    key: 'logout',
    label: 'Logouts',
    icon: 'pi pi-sign-out',
    module: 'LoginHistory',
    action: 'updated',
    color: 'gray',
    gradient: 'from-gray-500 to-gray-700',
    ring: 'ring-gray-200',
  },
  {
    key: 'applicants',
    label: 'Applicants',
    icon: 'pi pi-users',
    module: 'Applicant',
    action: null,
    color: 'apricot',
    gradient: 'from-apricot-500 to-apricot-700',
    ring: 'ring-apricot-200',
  },
  {
    key: 'batches',
    label: 'Batches',
    icon: 'pi pi-graduation-cap',
    module: 'ApplicantBatch',
    action: null,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-700',
    ring: 'ring-purple-200',
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: 'pi pi-file',
    module: 'Document',
    action: null,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
    ring: 'ring-blue-200',
  },
  {
    key: 'created',
    label: 'Created',
    icon: 'pi pi-plus-circle',
    module: null,
    action: 'created',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-700',
    ring: 'ring-emerald-200',
  },
  {
    key: 'deleted',
    label: 'Deleted',
    icon: 'pi pi-trash',
    module: null,
    action: 'deleted',
    color: 'red',
    gradient: 'from-red-500 to-red-700',
    ring: 'ring-red-200',
  },
]

// Count each type from current logs
function getCount(filter: typeof quickFilters[0]): number {
  if (filter.key === 'all') return store.logs.length
  return store.logs.filter((log: any) => {
    const moduleMatch = filter.module ? log.module === filter.module : true
    const actionMatch = filter.action ? log.action === filter.action : true
    return moduleMatch && actionMatch
  }).length
}

// ─── Apply quick filter ─────────────────────────────────
function applyQuickFilter(filter: typeof quickFilters[0]) {
  activeQuickFilter.value = filter.key

  if (filter.key === 'all') {
    store.resetFilters()
  } else {
    store.setFilters({
      module: filter.module ?? '',
      action: filter.action ?? '',
    } as any)
  }

  store.fetchLogs()
}

// ─── Advanced filter handlers ────────────────────────────
function onFilter(f: Partial<IFilters>) {
  activeQuickFilter.value = null   // clear quick filter when using advanced
  store.setFilters(f)
  store.fetchLogs()
}

function onReset() {
  activeQuickFilter.value = 'all'
  store.resetFilters()
  store.fetchLogs()
}

function onPageChange(page: number) {
  store.setPage(page)
  store.fetchLogs()
}

function onLimitChange(limit: number) {
  store.setLimit(limit)
  store.fetchLogs()
}

// Toggle advanced filters visibility
const showAdvancedFilters = ref(false)
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex items-start justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Activity Logs
        </h1>
        <p class="text-sm text-blueberry-500">
          Track every action performed across the system
        </p>
      </div>
    </header>

    <!-- ─── Stats Cards ────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Actions"  :value="stats.total"      icon="pi pi-history"    variant="blueberry" />
      <AppStatCard label="Today"          :value="stats.today"      icon="pi pi-clock"      variant="apricot" />
      <AppStatCard label="This Week"      :value="stats.this_week"  icon="pi pi-calendar"   variant="citrus" />
      <AppStatCard label="This Month"     :value="stats.this_month" icon="pi pi-chart-line" variant="green" />
    </div>

    <!-- ─── 🎯 Quick Filter Cards ──────────────────── -->
    <section>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">
          Quick Filters
        </h2>
        <button
          type="button"
          class="text-xs text-apricot-600 hover:text-apricot-700 font-medium
                 flex items-center gap-1 transition-colors"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          <i class="pi pi-filter text-[10px]" />
          {{ showAdvancedFilters ? 'Hide' : 'Show' }} advanced filters
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <button
          v-for="filter in quickFilters"
          :key="filter.key"
          type="button"
          class="group relative flex flex-col items-center gap-2 p-4
                 bg-white rounded-xl border transition-all duration-200
                 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none"
          :class="[
            activeQuickFilter === filter.key
              ? `ring-2 ${filter.ring} border-transparent shadow-md`
              : 'border-appleCore-100 hover:border-appleCore-200',
          ]"
          @click="applyQuickFilter(filter)"
        >
          <!-- Icon with gradient bg -->
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center
                   bg-gradient-to-br shadow-sm transition-transform
                   group-hover:scale-110"
            :class="filter.gradient"
          >
            <i :class="filter.icon" class="text-xl text-white" />
          </div>

          <!-- Label -->
          <span class="text-xs font-semibold text-blueberry-700 text-center leading-tight">
            {{ filter.label }}
          </span>

          <!-- Count badge -->
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full
                   bg-appleCore-50 text-blueberry-600 tabular-nums"
          >
            {{ getCount(filter) }}
          </span>

          <!-- Active indicator dot -->
          <span
            v-if="activeQuickFilter === filter.key"
            class="absolute top-2 right-2 w-2 h-2 rounded-full bg-apricot-500
                   ring-2 ring-white animate-pulse"
          />
        </button>
      </div>
    </section>

    <!-- ─── Advanced Filters (collapsible) ────────── -->
    <AppCard
      v-if="showAdvancedFilters"
      :padding="'small'"
      :shadow="'none'"
      class="!bg-transparent !border-appleCore-200/60"
    >
      <div class="flex items-center gap-2 mb-3 text-xs text-blueberry-500">
        <i class="pi pi-info-circle" />
        Use advanced filters for precise date ranges and text search
      </div>
      <ActivityLogFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- ─── Active Filter Indicator ─────────────────── -->
    <div
      v-if="activeQuickFilter && activeQuickFilter !== 'all'"
      class="flex items-center gap-2 px-4 py-2.5 bg-apricot-50 border
             border-apricot-200 rounded-lg text-sm text-apricot-700"
    >
      <i class="pi pi-filter-fill text-apricot-500" />
      Showing:
      <strong>
        {{ quickFilters.find(f => f.key === activeQuickFilter)?.label }}
      </strong>
      <button
        type="button"
        class="ml-auto text-xs font-medium hover:text-apricot-900 
               flex items-center gap-1 transition-colors"
        @click="applyQuickFilter(quickFilters[0])"
      >
        <i class="pi pi-times text-[10px]" />
        Clear filter
      </button>
    </div>

    <!-- ─── Table ──────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <ActivityLogTable
        :logs="store.logs"
        :pagination="store.pagination"
        :loading="store.loading"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
      />
    </AppCard>
  </div>
</template>