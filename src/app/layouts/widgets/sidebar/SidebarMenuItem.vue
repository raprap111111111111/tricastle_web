<template>
  <RouterLink :to="to" custom v-slot="{ navigate }">
    <div
      class="group my-0.5 rounded-lg border transition-all cursor-pointer"
      :class="[
        isActive
          ? 'bg-apricot-500/20 border-apricot-500/50'
          : 'border-transparent hover:bg-appleCore-100',
      ]"
      @click="navigate"
    >
      <div class="flex items-center px-3.5 py-2 gap-3">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          :class="isActive ? 'bg-apricot-500/40' : 'bg-appleCore-50 group-hover:bg-appleCore-100'"
        >
          <i
            :class="[icon, isActive ? 'text-blueberry-800' : 'text-blueberry-500', 'text-base']"
          />
        </div>
        <span
          class="flex-1 text-sm truncate"
          :class="isActive ? 'text-blueberry-800 font-bold' : 'text-blueberry-700 font-semibold'"
        >
          {{ title }}
        </span>
        <div v-if="isActive" class="w-1 h-6 rounded-full bg-apricot-500" />
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps<{
  icon: string
  title: string
  to: string
  exact?: boolean
  activeRoutes?: string[]
}>()

const route = useRoute()

const isActive = computed(() => {
  const current = route.path
  const routesToCheck = [props.to, ...(props.activeRoutes ?? [])]

  // ── Exact match mode ──────────────────────────────────
  if (props.exact) {
    return routesToCheck.includes(current)
  }

  // ── Partial match (prefix-based) ──────────────────────
  return routesToCheck.some(
    (path) => current === path || current.startsWith(`${path}/`),
  )
})
</script>