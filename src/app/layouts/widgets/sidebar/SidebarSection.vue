<template>
  <div class="flex flex-col">
    <button
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

    <Transition
      enter-active-class="transition-all duration-200 ease-out overflow-hidden"
      leave-active-class="transition-all duration-150 ease-in overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[600px] opacity-100"
      leave-from-class="max-h-[600px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="isExpanded" class="flex flex-col">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  initiallyExpanded?: boolean
}>(), { initiallyExpanded: false })

const isExpanded = ref(props.initiallyExpanded)
</script>