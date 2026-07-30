<!-- src/features/document-types/components/DocumentTypeCategoryBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentTypeCategory } from '../types'

const props = defineProps<{ category: DocumentTypeCategory }>()

const config = computed(() => {
  const map: Record<DocumentTypeCategory, { label: string; cls: string; icon: string }> = {
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
  }
  return map[props.category]
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