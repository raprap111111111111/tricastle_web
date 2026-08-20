<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import { AppSearchBar } from '@shared/ui'
import type { DeploymentFilters as IFilters } from '../types'

const props = defineProps<{
  countries: string[]
}>()

const emit = defineEmits<{
  (e: 'filter', value: Partial<IFilters>): void
  (e: 'reset'): void
}>()

// ─── Filter state ─────────────────────────────────────
const search = ref('')
const country = ref<string>('')
const dateRange = ref<Date[] | null>(null)

// ─── Options ──────────────────────────────────────────
const countryOptions = computed(() => [
  { label: 'All Countries', value: '' },
  ...props.countries.map((c) => ({ label: c, value: c })),
])

// ─── Formatters ───────────────────────────────────────
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Handlers ─────────────────────────────────────────
function applyFilters() {
  const payload: Partial<IFilters> = {
    search: search.value.trim() || undefined,
    country: country.value || undefined,
  }

  if (dateRange.value && dateRange.value[0]) {
    payload.date_from = formatDate(dateRange.value[0])
  }
  if (dateRange.value && dateRange.value[1]) {
    payload.date_to = formatDate(dateRange.value[1])
  }

  emit('filter', payload)
}

function onSearch(value: string) {
  search.value = value.trim()
  applyFilters()
}

function onCountryChange() {
  applyFilters()
}

function onDateChange() {
  // Only trigger when both dates are selected (or cleared)
  if (!dateRange.value || (dateRange.value[0] && dateRange.value[1])) {
    applyFilters()
  }
}

function resetAll() {
  search.value = ''
  country.value = ''
  dateRange.value = null
  emit('reset')
}

// ─── Active filter chips ──────────────────────────────
const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []

  if (search.value.trim()) {
    filters.push({ key: 'search', label: 'Search', value: search.value })
  }
  if (country.value) {
    filters.push({ key: 'country', label: 'Country', value: country.value })
  }
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    filters.push({
      key: 'date',
      label: 'Date',
      value: `${formatDisplay(dateRange.value[0])} → ${formatDisplay(dateRange.value[1])}`,
    })
  }

  return filters
})

const hasFilters = computed(() => activeFilters.value.length > 0)

function removeFilter(key: string) {
  switch (key) {
    case 'search':  search.value = ''; break
    case 'country': country.value = ''; break
    case 'date':    dateRange.value = null; break
  }
  applyFilters()
}

// ─── Watch date range ─────────────────────────────────
watch(dateRange, () => {
  onDateChange()
})
</script>

<template>
  <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">

    <!-- Row 1: Filters -->
    <div class="flex flex-wrap items-center gap-3">

      <!-- Search -->
      <AppSearchBar
        v-model="search"
        placeholder="Search by applicant name, code, email, or passport..."
        button-label=""
        class="flex-1 min-w-[280px]"
        @search="onSearch"
      />

      <!-- Country Filter -->
      <div class="min-w-[220px]">
        <Select
          v-model="country"
          :options="countryOptions"
          option-label="label"
          option-value="value"
          placeholder="Filter by country..."
          class="w-full"
          show-clear
          filter
          @change="onCountryChange"
        >
          <template #option="{ option }">
            <div class="flex items-center gap-2 w-full">
              <i
                v-if="!option.value"
                class="pi pi-list text-blueberry-400 text-xs"
              />
              <i v-else class="pi pi-globe text-blueberry-400 text-xs" />
              <span class="flex-1 truncate">{{ option.label }}</span>
            </div>
          </template>
        </Select>
      </div>

      <!-- Date Range -->
      <div class="min-w-[260px]">
        <DatePicker
          v-model="dateRange"
          selection-mode="range"
          placeholder="Filter by deployment date..."
          date-format="M dd, yy"
          show-icon
          icon-display="input"
          :manual-input="false"
          show-button-bar
          class="w-full"
        />
      </div>

      <!-- Reset -->
      <Button
        v-if="hasFilters"
        icon="pi pi-refresh"
        severity="secondary"
        text
        rounded
        v-tooltip.top="'Reset all filters'"
        @click="resetAll"
      />
    </div>

    <!-- Active filter chips -->
    <div
      v-if="hasFilters"
      class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100"
    >
      <span class="text-xs text-blueberry-500 font-medium">Active:</span>

      <span
        v-for="f in activeFilters"
        :key="f.key"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700
               rounded-full text-xs font-medium ring-1 ring-apricot-200"
      >
        <i
          v-if="f.key === 'date'"
          class="pi pi-calendar text-[10px]"
        />
        <i
          v-else-if="f.key === 'country'"
          class="pi pi-globe text-[10px]"
        />
        <span class="font-semibold">{{ f.label }}:</span>
        <span>{{ f.value }}</span>
        <button
          type="button"
          class="ml-0.5 hover:text-apricot-900 transition-colors"
          @click="removeFilter(f.key)"
        >
          <i class="pi pi-times text-[10px]" />
        </button>
      </span>
    </div>
  </div>
</template>