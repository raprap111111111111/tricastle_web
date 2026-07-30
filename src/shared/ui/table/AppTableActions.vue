<template>
  <div class="flex items-center gap-1 justify-end">
    <button
      v-for="action in visibleActions"
      :key="action.key"
      :title="action.label"
      class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
      :class="action.class ?? 'text-blueberry-500 hover:bg-appleCore-100 hover:text-apricot-500'"
      @click.stop="action.onClick"
    >
      <i :class="action.icon" class="text-sm" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TableAction {
  key: string
  label: string
  icon: string
  class?: string
  visible?: boolean
  onClick: () => void
}

const props = defineProps<{
  actions: TableAction[]
}>()

const visibleActions = computed(() =>
  props.actions.filter((a) => a.visible !== false),
)
</script>