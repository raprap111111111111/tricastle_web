<!-- src/features/documents/components/BatchDocumentFilters.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import { AppSearchBar } from '@shared/ui'

const emit = defineEmits<{
  (e: 'filter', value: { search: string }): void
  (e: 'reset'): void
}>()

const search = ref('')

function onSearch(value: string) {
  emit('filter', { search: value })
}

function reset() {
  search.value = ''
  emit('reset')
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <AppSearchBar
      v-model="search"
      placeholder="Search batch name or code..."
      button-label=""
      class="flex-1 min-w-[260px]"
      @search="onSearch"
    />

    <Button
      icon="pi pi-refresh"
      severity="secondary"
      text
      rounded
      v-tooltip.top="'Reset filters'"
      @click="reset"
    />
  </div>
</template>