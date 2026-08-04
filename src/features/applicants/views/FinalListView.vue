<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'

import { useFinalList } from '../composables/useFinalList'
import FinalListStats from '../components/final-list/FinalListStats.vue'
import FinalListFolderCard from '../components/final-list/FinalListFolderCard.vue'
import FinalListEmptyState from '../components/final-list/FinalListEmptyState.vue'

const router = useRouter()

const {
  folders,
  stats,
  groupBy,
  searchQuery,
  selectedBatchId,
  availableBatches,
  loading,
  loadFinalList,
  resetFilters,
} = useFinalList()

onMounted(loadFinalList)

const groupByOptions = [
  { label: 'Day',   value: 'day' },
  { label: 'Week',  value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year',  value: 'year' },
]

// ─── Batch dropdown options ────────────────────────────
const batchOptions = computed(() => {
  const items = availableBatches.value.map((b) => ({
    label:          `${b.name} (#${b.batch_number})`,
    value:          b.id,
    isActive:       b.is_active ?? false,
    applicantCount: b.applicant_count ?? 0,
    status:         b.status,
  }))

  return [
    {
      label:          'All Batches',
      value:          null,
      isActive:       false,
      applicantCount: 0,
      status:         null,
    },
    ...items,
  ]
})

const hasFilters = computed(
  () => searchQuery.value !== '' || selectedBatchId.value !== null,
)

// Get selected batch label for chip display
const selectedBatchLabel = computed(() => {
  const found = batchOptions.value.find((o) => o.value === selectedBatchId.value)
  return found?.label ?? ''
})
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex flex-col sm:flex-row items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push({ name: 'applicants.index' })"
        />
        <div>
          <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
            Final List
          </h1>
          <p class="text-sm text-blueberry-500 mt-1">
            Approved applicants organized by date, ready for batch assignment
          </p>
        </div>
      </div>

      <Button
        label="Refresh"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="loadFinalList"
      />
    </header>

    <!-- ─── Stats ──────────────────────────────────── -->
    <FinalListStats :stats="stats" />

    <!-- ─── Controls ───────────────────────────────── -->
    <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">

      <!-- Row 1: Search + Batch Filter + Clear -->
      <div class="flex flex-col md:flex-row gap-3">
        <!-- Search -->
        <div class="relative flex-1 min-w-[200px]">
          <i
            class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2
                   text-blueberry-400 text-sm z-10"
          />
          <InputText
            v-model="searchQuery"
            placeholder="Search by name, email, or code..."
            class="w-full !pl-10"
          />
        </div>

        <!-- Batch Filter -->
        <div class="min-w-[300px]">
          <Select
            v-model="selectedBatchId"
            :options="batchOptions"
            option-label="label"
            option-value="value"
            placeholder="Filter by batch..."
            class="w-full"
            show-clear
          >
            <!-- Dropdown option template -->
            <template #option="{ option }">
              <div class="flex items-center gap-2 w-full">
                <!-- Icon -->
                <i
                  v-if="option.value === null"
                  class="pi pi-list text-blueberry-400 text-xs"
                />
                <i
                  v-else
                  class="pi pi-graduation-cap text-xs"
                  :class="option.isActive ? 'text-green-500' : 'text-blueberry-400'"
                />

                <!-- Label -->
                <span class="flex-1 truncate">{{ option.label }}</span>

                <!-- Applicant count badge -->
                <span
                  v-if="option.value !== null"
                  class="text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[24px] text-center"
                  :class="
                    option.applicantCount > 0
                      ? 'bg-apricot-100 text-apricot-700'
                      : 'bg-blueberry-50 text-blueberry-400'
                  "
                >
                  {{ option.applicantCount }}
                </span>

                <!-- Active badge -->
                <span
                  v-if="option.isActive"
                  class="text-[10px] px-1.5 py-0.5 rounded-full
                         bg-green-100 text-green-700 font-medium"
                >
                  ACTIVE
                </span>
              </div>
            </template>

            <!-- Selected value template -->
            <template #value="{ value, placeholder }">
              <div v-if="value" class="flex items-center gap-2">
                <i
                  class="pi pi-graduation-cap text-xs"
                  :class="
                    batchOptions.find(o => o.value === value)?.isActive
                      ? 'text-green-500'
                      : 'text-blueberry-400'
                  "
                />
                <span class="truncate">
                  {{ batchOptions.find(o => o.value === value)?.label }}
                </span>
                <span
                  v-if="batchOptions.find(o => o.value === value)?.isActive"
                  class="text-[10px] px-1.5 py-0.5 rounded-full
                         bg-green-100 text-green-700 font-medium"
                >
                  ACTIVE
                </span>
              </div>
              <span v-else class="text-blueberry-400">{{ placeholder }}</span>
            </template>
          </Select>
        </div>

        <!-- Clear filters -->
        <Button
          v-if="hasFilters"
          label="Clear"
          icon="pi pi-times"
          severity="secondary"
          text
          @click="resetFilters"
        />
      </div>

      <!-- Row 2: Group By -->
      <div class="flex items-center justify-between border-t border-appleCore-100 pt-3">
        <div class="flex items-center gap-2">
          <i class="pi pi-th-large text-blueberry-400 text-xs" />
          <span class="text-xs font-medium text-blueberry-500 uppercase tracking-wider">
            Group By
          </span>
        </div>
        <SelectButton
          v-model="groupBy"
          :options="groupByOptions"
          option-label="label"
          option-value="value"
          size="small"
        />
      </div>

      <!-- Active filter chips -->
      <div
        v-if="hasFilters"
        class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100"
      >
        <span class="text-xs text-blueberry-500">Active filters:</span>

        <span
          v-if="searchQuery"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50
                 text-apricot-700 rounded-full text-xs font-medium ring-1 ring-apricot-200"
        >
          <i class="pi pi-search text-[10px]" />
          "{{ searchQuery }}"
          <button
            type="button"
            class="hover:text-apricot-900"
            @click="searchQuery = ''"
          >
            <i class="pi pi-times text-[10px]" />
          </button>
        </span>

        <span
          v-if="selectedBatchId"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50
                 text-blue-700 rounded-full text-xs font-medium ring-1 ring-blue-200"
        >
          <i class="pi pi-graduation-cap text-[10px]" />
          {{ selectedBatchLabel }}
          <button
            type="button"
            class="hover:text-blue-900"
            @click="selectedBatchId = null"
          >
            <i class="pi pi-times text-[10px]" />
          </button>
        </span>
      </div>
    </div>

    <!-- ─── Loading ────────────────────────────────── -->
    <template v-if="loading && folders.length === 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Skeleton
          v-for="i in 8"
          :key="i"
          height="180px"
          border-radius="16px"
        />
      </div>
    </template>

    <!-- ─── Empty ──────────────────────────────────── -->
    <FinalListEmptyState v-else-if="folders.length === 0" />

    <!-- ─── Folders Grid ───────────────────────────── -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <FinalListFolderCard
        v-for="folder in folders"
        :key="folder.key"
        :folder="folder"
      />
    </div>
  </div>
</template>