<!-- src/features/applicants/components/final-list/FinalListHeader.vue -->
<script setup lang="ts">
import Button from 'primevue/button'

defineProps<{
  loading?:      boolean
  hasApplicants: boolean
}>()

defineEmits<{
  back:      []
  refresh:   []
  export:    []
  bulkAIS:   []
}>()
</script>

<template>
  <header class="flex flex-col sm:flex-row items-start justify-between gap-4">
    <div class="flex items-start gap-3">
      <Button icon="pi pi-arrow-left" text rounded @click="$emit('back')" />
      <div>
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Final List
        </h1>
        <p class="text-sm text-blueberry-500 mt-1">
          All approved applicants ready for batch assignment
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <!-- Bulk AIS -->
      <Button
        label="Bulk AIS"
        icon="pi pi-file-pdf"
        severity="secondary"
        outlined
        :disabled="!hasApplicants"
        class="!text-red-600 !border-red-300 hover:!bg-red-50"
        @click="$emit('bulkAIS')"
      />

      <!-- Export Excel -->
      <Button
        label="Export Excel"
        icon="pi pi-file-excel"
        severity="secondary"
        outlined
        :disabled="!hasApplicants"
        @click="$emit('export')"
      />

      <!-- Refresh -->
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="$emit('refresh')"
      />
    </div>
  </header>
</template>