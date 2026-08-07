<!-- src/features/document-types/components/DocumentTypeFilters.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { AppSearchBar } from '@shared/ui'
import type { DocumentTypeFilters, DocumentTypeCategory } from '../types'

const emit = defineEmits<{
  (e: 'filter', filters: Partial<DocumentTypeFilters>): void
  (e: 'reset'): void
}>()

const search     = ref('')
const category   = ref<DocumentTypeCategory | null>(null)
const isActive   = ref<boolean | null>(null)
const isRequired = ref<boolean | null>(null)

// ─── Options ──────────────────────────────────────────
const categoryOptions = [
  { label: 'Primary',    value: 'primary' },
  { label: 'Supporting', value: 'supporting' },
]

const boolOptions = [
  { label: 'Yes', value: true },
  { label: 'No',  value: false },
]

// ─── Handlers ─────────────────────────────────────────
function apply() {
  emit('filter', {
    search:      search.value,
    category:    category.value,
    is_active:   isActive.value,
    is_required: isRequired.value,
  })
}

function onSearch(value: string) {
  search.value = value.trim()
  apply()
}

function resetAll() {
  search.value     = ''
  category.value   = null
  isActive.value   = null
  isRequired.value = null
  emit('reset')
}

// ─── Active filter chips ──────────────────────────────
const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []

  if (search.value.trim()) {
    filters.push({ key: 'search', label: 'Search', value: search.value })
  }
  if (category.value) {
    const opt = categoryOptions.find((o) => o.value === category.value)
    filters.push({ key: 'category', label: 'Category', value: opt?.label ?? category.value })
  }
  if (isActive.value !== null) {
    filters.push({
      key: 'is_active',
      label: 'Active',
      value: isActive.value ? 'Yes' : 'No',
    })
  }
  if (isRequired.value !== null) {
    filters.push({
      key: 'is_required',
      label: 'Required',
      value: isRequired.value ? 'Yes' : 'No',
    })
  }

  return filters
})

const hasFilters = computed(() => activeFilters.value.length > 0)

function removeFilter(key: string) {
  switch (key) {
    case 'search':      search.value = ''; break
    case 'category':    category.value = null; break
    case 'is_active':   isActive.value = null; break
    case 'is_required': isRequired.value = null; break
  }
  apply()
}
</script>

<template>
  <div class="flex flex-col gap-3">

    <!-- Main filter row -->
    <div class="flex flex-col md:flex-row md:items-center gap-3">
      <div class="flex-1 min-w-0">
        <AppSearchBar
          v-model="search"
          placeholder="Search by name or code..."
          button-label=""
          @search="onSearch"
        />
      </div>

      <Select
        v-model="category"
        :options="categoryOptions"
        option-label="label"
        option-value="value"
        placeholder="All Categories"
        show-clear
        class="w-full md:w-44"
        @change="apply"
      />

      <Select
        v-model="isActive"
        :options="boolOptions"
        option-label="label"
        option-value="value"
        placeholder="Active?"
        show-clear
        class="w-full md:w-36"
        @change="apply"
      />

      <Select
        v-model="isRequired"
        :options="boolOptions"
        option-label="label"
        option-value="value"
        placeholder="Required?"
        show-clear
        class="w-full md:w-36"
        @change="apply"
      />

      <!-- Icon-only Reset (matches other views) -->
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
      class="flex items-center flex-wrap gap-2"
    >
      <span class="text-xs text-blueberry-500 font-medium">Active:</span>

      <span
        v-for="f in activeFilters"
        :key="f.key"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700
               rounded-full text-xs font-medium ring-1 ring-apricot-200"
      >
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