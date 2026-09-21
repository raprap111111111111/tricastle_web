<!-- src/features/applicants/components/insurance/InsuranceMissingFieldsAlert.vue -->
<script setup lang="ts">
defineProps<{
  missingItems: Array<{
    applicantId: number
    applicantName: string
    fields: string[]
  }>
}>()
</script>

<template>
  <div v-if="missingItems.length > 0" class="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-2">
    <div class="flex items-center gap-2 font-semibold">
      <i class="pi pi-exclamation-triangle text-amber-600 text-sm" />
      <span>Missing Required Information</span>
    </div>
    <ul class="list-disc pl-6 space-y-1 text-amber-800">
      <li v-for="item in missingItems" :key="item.applicantId">
        <strong class="font-medium text-amber-950">{{ item.applicantName }}:</strong>
        Missing {{ item.fields.join(', ') }}
      </li>
    </ul>
  </div>
</template>