<!-- src/features/file-repository/components/FileSizeLabel.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bytes:     number
  decimals?: number
}>()

const label = computed(() => {
  const bytes    = props.bytes ?? 0
  const decimals = props.decimals ?? 2

  if (bytes === 0) return '0 B'

  const k     = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i     = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
})
</script>

<template>
  <span>{{ label }}</span>
</template>