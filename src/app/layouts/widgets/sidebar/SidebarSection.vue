<template>
  <div class="flex flex-col">
    <button
      v-if="!isCollapsed"
      class="flex items-center px-3 pt-2.5 pb-2 rounded-lg hover:bg-appleCore-50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <span class="flex-1 text-left text-[11px] font-extrabold tracking-widest text-blueberry-400">
        {{ title }}
      </span>
      <i
        class="pi pi-chevron-down text-blueberry-400 text-xs transition-transform"
        :class="{ 'rotate-180': !isExpanded }"
      />
    </button>

    <div v-show="isCollapsed || isExpanded" class="flex flex-col">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSidebar } from '../../composables/useSidebar'

const props = withDefaults(defineProps<{
  title: string
  initiallyExpanded?: boolean
}>(), { initiallyExpanded: true })

const { isCollapsed } = useSidebar()
const isExpanded = ref(props.initiallyExpanded)
</script>