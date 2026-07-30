<script setup lang="ts">
defineProps<{ isActive: boolean }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset"
    :class="isActive
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : 'bg-gray-50 text-gray-600 ring-gray-200'"
  >
    <i :class="isActive ? 'pi pi-check-circle' : 'pi pi-ban'" class="text-[10px]" />
    {{ isActive ? 'Active' : 'Inactive' }}
  </span>
</template>