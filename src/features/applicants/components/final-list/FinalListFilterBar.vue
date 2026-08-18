<!-- src/features/applicants/components/final-list/FinalListFilterBar.vue -->
<script setup lang="ts">
import Button from 'primevue/button'
import Select from 'primevue/select'
import { AppSearchBar } from '@shared/ui'

defineProps<{
  searchQuery:          string
  selectedBatchId:      number | null
  batchOptions:         any[]
  appliedAdvancedCount: number
  hasFilters:           boolean
  activeFilters:        { key: string; label: string; value: string }[]
}>()

defineEmits<{
  'update:searchQuery':     [v: string]
  'update:selectedBatchId': [v: number | null]
  search:                   [v: string]
  openAdvanced:             []
  resetAll:                 []
  removeFilter:             [key: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">
    <div class="flex flex-wrap items-center gap-3">
      <AppSearchBar
        :model-value="searchQuery"
        placeholder="Search by name, email, code, or trade..."
        button-label=""
        class="flex-1 min-w-[280px]"
        @update:model-value="$emit('update:searchQuery', $event)"
        @search="$emit('search', $event)"
      />

      <div class="min-w-[240px]">
        <Select
          :model-value="selectedBatchId"
          :options="batchOptions"
          option-label="label"
          option-value="value"
          placeholder="Filter by batch..."
          class="w-full"
          show-clear
          @update:model-value="$emit('update:selectedBatchId', $event)"
        >
          <template #option="{ option }">
            <div class="flex items-center gap-2 w-full">
              <i v-if="option.value === null" class="pi pi-list text-blueberry-400 text-xs" />
              <i v-else class="pi pi-graduation-cap text-xs"
                :class="option.isActive ? 'text-green-500' : 'text-blueberry-400'" />
              <span class="flex-1 truncate">{{ option.label }}</span>
              <span v-if="option.value !== null"
                class="text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[24px] text-center"
                :class="option.applicantCount > 0
                  ? 'bg-apricot-100 text-apricot-700'
                  : 'bg-blueberry-50 text-blueberry-400'">
                {{ option.applicantCount }}
              </span>
              <span v-if="option.isActive"
                class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                ACTIVE
              </span>
            </div>
          </template>
          <template #value="{ value, placeholder }">
            <div v-if="value" class="flex items-center gap-2">
              <i class="pi pi-graduation-cap text-xs"
                :class="batchOptions.find((o: any) => o.value === value)?.isActive
                  ? 'text-green-500' : 'text-blueberry-400'" />
              <span class="truncate">{{ batchOptions.find((o: any) => o.value === value)?.label }}</span>
            </div>
            <span v-else class="text-blueberry-400">{{ placeholder }}</span>
          </template>
        </Select>
      </div>

      <Button severity="secondary" outlined @click="$emit('openAdvanced')">
        <template #default>
          <i class="pi pi-sliders-h mr-2" />
          <span>Advanced</span>
          <span v-if="appliedAdvancedCount > 0"
            class="ml-2 px-1.5 py-0.5 rounded-full bg-apricot-500 text-white
                   text-[10px] font-bold min-w-[20px] text-center">
            {{ appliedAdvancedCount }}
          </span>
        </template>
      </Button>

      <Button v-if="hasFilters" icon="pi pi-refresh" severity="secondary" text rounded
        v-tooltip.top="'Reset all filters'" @click="$emit('resetAll')" />
    </div>

    <div v-if="hasFilters" class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100">
      <span class="text-xs text-blueberry-500 font-medium">Active:</span>
      <span v-for="f in activeFilters" :key="f.key"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700
               rounded-full text-xs font-medium ring-1 ring-apricot-200">
        <span class="font-semibold">{{ f.label }}:</span>
        <span>{{ f.value }}</span>
        <button type="button" class="ml-0.5 hover:text-apricot-900 transition-colors" @click="$emit('removeFilter', f.key)">
          <i class="pi pi-times text-[10px]" />
        </button>
      </span>
    </div>
  </div>
</template>