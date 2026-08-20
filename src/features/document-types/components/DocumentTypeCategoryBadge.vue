<!-- src/features/document-types/components/DocumentTypeCategoryBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  category: string
}>()

const config = computed(() => {
  const map: Record<string, { label: string; cls: string; icon: string }> = {
    primary: {
      label: 'Primary',
      cls: 'bg-apricot-50 text-apricot-700 ring-apricot-200',
      icon: 'pi-star-fill',
    },
    supporting: {
      label: 'Supporting',
      cls: 'bg-blueberry-50 text-blueberry-700 ring-blueberry-200',
      icon: 'pi-bookmark',
    },
    personal: {
      label: 'Personal',
      cls: 'bg-purple-50 text-purple-700 ring-purple-200',
      icon: 'pi-user',
    },
  }

  return map[props.category] ?? {
    label: props.category || 'Unknown',
    cls: 'bg-gray-50 text-gray-700 ring-gray-200',
    icon: 'pi-tag',
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl
           text-xs font-semibold ring-1 ring-inset"
    :class="config.cls"
  >
    <i :class="`pi ${config.icon} text-[10px]`" />
    {{ config.label }}
  </span>
</template>