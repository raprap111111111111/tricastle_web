<!-- src/features/file-repository/components/FileSizeLabel.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bytes: number
  decimals?: number
}>()

const label = computed(() => {
  const d = props.decimals ?? 2
  const b = props.bytes

  if (b === 0)          return '0 B'
  if (b < 1024)         return `${b} B`
  if (b < 1024 ** 2)    return `${(b / 1024).toFixed(d)} KB`
  if (b < 1024 ** 3)    return `${(b / 1024 ** 2).toFixed(d)} MB`
  return                       `${(b / 1024 ** 3).toFixed(d)} GB`
})
</script>

<template>
  <span class="tabular-nums">{{ label }}</span>
</template>