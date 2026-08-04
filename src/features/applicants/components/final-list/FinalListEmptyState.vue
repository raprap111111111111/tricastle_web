<!-- src/features/applicants/components/final-list/FinalListEmptyState.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center py-16 gap-4
           bg-white border border-dashed border-appleCore-200 rounded-2xl"
  >
    <div
      class="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center"
    >
      <i class="pi pi-folder-open text-3xl text-green-500" />
    </div>
    <div class="text-center max-w-md">
      <h3 class="text-lg font-serif font-semibold text-blueberry-800 mb-1">
        No Final List Applicants Yet
      </h3>
      <p class="text-sm text-blueberry-500">
        Approve applicants and move them to the Final List to see them here,
        organized by date.
      </p>
    </div>
    <Button
      label="View Applicants"
      icon="pi pi-users"
      severity="secondary"
      outlined
      @click="router.push({ name: 'applicants.index' })"
    />
  </div>
</template>