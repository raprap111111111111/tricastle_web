<!-- src/features/applicants/components/final-list/FinalListFilterBar.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'

const props = defineProps<{
  searchQuery: string
  selectedBatchId: number | null
  batchOptions: any[]
  appliedAdvancedCount: number
  hasFilters: boolean
  activeFilters: { key: string; label: string; value: string }[]
}>()

const emit = defineEmits<{
  'update:searchQuery': [v: string]
  'update:selectedBatchId': [v: number | null]
  search: [v: string]
  openAdvanced: []
  resetAll: []
  removeFilter: [key: string]
}>()

// ─── Local draft only (does NOT search while typing) ────────────────────────
const draft = ref(props.searchQuery ?? '')

// Keep draft in sync when parent clears/resets search
watch(
  () => props.searchQuery,
  (val) => {
    if (val !== draft.value) draft.value = val ?? ''
  },
)

function triggerSearch() {
  const term = draft.value.trim()
  emit('update:searchQuery', term)
  emit('search', term)
}

function clearSearch() {
  draft.value = ''
  emit('update:searchQuery', '')
  emit('search', '')
}
</script>

<template>
  <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">
    <div class="flex flex-wrap items-center gap-3">

      <!-- 🔍 Search (same structure/colors as AppSearchBar) -->
      <div class="flex items-center gap-2 flex-1 min-w-[280px]">
        <div class="relative flex-1">
          <!-- Leading icon -->
          <i
            class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-blueberry-400 text-sm pointer-events-none" />

          <InputText v-model="draft" placeholder="Search by name, email, code, or trade..." class="w-full !pl-10"
            :class="draft ? '!pr-10' : ''" @keydown.enter="triggerSearch" />

          <!-- Clear (X) -->
          <button v-if="draft" type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-blueberry-400 hover:text-blueberry-600 transition-colors"
            aria-label="Clear search" @click="clearSearch">
            <i class="pi pi-times-circle text-sm" />
          </button>
        </div>

        <!-- Search button (apricot, icon only — matches screenshot) -->
        <Button icon="pi pi-search"
          class="!bg-apricot-500 !border-apricot-500 hover:!bg-apricot-600 hover:!border-apricot-600 !text-white !w-10 !h-10 !p-0 shrink-0"
          v-tooltip.top="'Search'" @click="triggerSearch" />
      </div>

      <!-- Batch filter -->
      <div class="min-w-[240px]">
        <Select :model-value="selectedBatchId" :options="batchOptions" option-label="label" option-value="value"
          placeholder="Filter by batch..." class="w-full" show-clear filter
          filter-placeholder="Type batch name or number (e.g. 46)..." filter-match-mode="contains"
          :auto-filter-focus="true" @update:model-value="$emit('update:selectedBatchId', $event)">
          <template #option="{ option }">
            <div class="flex items-center gap-2 w-full">
              <i v-if="option.value === null" class="pi pi-list text-blueberry-400 text-xs" />
              <i v-else class="pi pi-graduation-cap text-xs"
                :class="option.isActive ? 'text-green-500' : 'text-blueberry-400'" />
              <span class="flex-1 truncate">{{ option.label }}</span>
              <span v-if="option.value !== null"
                class="text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[24px] text-center" :class="option.applicantCount > 0
                    ? 'bg-apricot-100 text-apricot-700'
                    : 'bg-blueberry-50 text-blueberry-400'
                  ">
                {{ option.applicantCount }}
              </span>
              <span v-if="option.isActive"
                class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                ACTIVE
              </span>
            </div>
          </template>

          <template #value="{ value, placeholder }">
            <div v-if="value !== null && value !== undefined" class="flex items-center gap-2">
              <i class="pi pi-graduation-cap text-xs" :class="batchOptions.find((o: any) => o.value === value)?.isActive
                  ? 'text-green-500'
                  : 'text-blueberry-400'
                " />
              <span class="truncate">
                {{batchOptions.find((o: any) => o.value === value)?.label}}
              </span>
            </div>
            <span v-else class="text-blueberry-400">{{ placeholder }}</span>
          </template>
        </Select>
      </div>

      <!-- Advanced -->
      <Button severity="secondary" outlined @click="$emit('openAdvanced')">
        <template #default>
          <i class="pi pi-sliders-h mr-2" />
          <span>Advanced</span>
          <span v-if="appliedAdvancedCount > 0"
            class="ml-2 px-1.5 py-0.5 rounded-full bg-apricot-500 text-white text-[10px] font-bold min-w-[20px] text-center">
            {{ appliedAdvancedCount }}
          </span>
        </template>
      </Button>

      <!-- Reset -->
      <Button v-if="hasFilters" icon="pi pi-refresh" severity="secondary" text rounded
        v-tooltip.top="'Reset all filters'" @click="$emit('resetAll')" />
    </div>

    <!-- Active filter chips -->
    <div v-if="hasFilters" class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100">
      <span class="text-xs text-blueberry-500 font-medium">Active:</span>
      <span v-for="f in activeFilters" :key="f.key"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700 rounded-full text-xs font-medium ring-1 ring-apricot-200">
        <span class="font-semibold">{{ f.label }}:</span>
        <span>{{ f.value }}</span>
        <button type="button" class="ml-0.5 hover:text-apricot-900 transition-colors"
          @click="$emit('removeFilter', f.key)">
          <i class="pi pi-times text-[10px]" />
        </button>
      </span>
    </div>
  </div>
</template>