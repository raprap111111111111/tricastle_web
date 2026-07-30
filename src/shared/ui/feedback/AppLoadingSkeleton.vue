<template>
  <div class="space-y-3">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse bg-gradient-to-r from-appleCore-100 via-appleCore-50 to-appleCore-100 rounded-lg"
      :style="{ height, width: getWidth(i) }"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    count?: number
    height?: string
    variant?: 'lines' | 'card' | 'avatar'
  }>(),
  {
    count: 3,
    height: '16px',
    variant: 'lines',
  },
)

function getWidth(i: number): string {
  if (props.variant === 'card') return '100%'
  if (props.variant === 'avatar') return props.height
  const widths = ['100%', '92%', '85%', '78%', '95%']
  return widths[(i - 1) % widths.length]
}
</script>