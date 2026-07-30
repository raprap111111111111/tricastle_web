<template>
  <small class="text-red-500 text-xs flex items-center gap-1">
    <i class="pi pi-exclamation-circle text-[10px]" />
    {{ message }}
  </small>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
</script>