<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ action: string }>()

const config = computed(() => {
  const map: Record<string, { icon: string; color: string; bg: string }> = {
    created:            { icon: 'pi pi-plus-circle',   color: 'text-green-700', bg: 'bg-green-50 ring-green-200' },
    updated:            { icon: 'pi pi-pencil',        color: 'text-blue-700',  bg: 'bg-blue-50 ring-blue-200' },
    deleted:            { icon: 'pi pi-trash',         color: 'text-red-700',   bg: 'bg-red-50 ring-red-200' },
    restored:           { icon: 'pi pi-refresh',       color: 'text-teal-700',  bg: 'bg-teal-50 ring-teal-200' },
    verified:           { icon: 'pi pi-check-circle',  color: 'text-green-700', bg: 'bg-green-50 ring-green-200' },
    rejected:           { icon: 'pi pi-times-circle',  color: 'text-red-700',   bg: 'bg-red-50 ring-red-200' },
    activated:          { icon: 'pi pi-star-fill',     color: 'text-amber-700', bg: 'bg-amber-50 ring-amber-200' },
    deactivated:        { icon: 'pi pi-pause-circle',  color: 'text-gray-700',  bg: 'bg-gray-50 ring-gray-200' },
    assigned:           { icon: 'pi pi-user-plus',     color: 'text-indigo-700',bg: 'bg-indigo-50 ring-indigo-200' },
    moved_to_final_list:{ icon: 'pi pi-check-circle',  color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-200' },
    uploaded:           { icon: 'pi pi-upload',        color: 'text-purple-700',bg: 'bg-purple-50 ring-purple-200' },
    downloaded:         { icon: 'pi pi-download',      color: 'text-cyan-700',  bg: 'bg-cyan-50 ring-cyan-200' },
    login:              { icon: 'pi pi-sign-in',       color: 'text-blue-700',  bg: 'bg-blue-50 ring-blue-200' },
    logout:             { icon: 'pi pi-sign-out',      color: 'text-gray-700',  bg: 'bg-gray-50 ring-gray-200' },
  }
  return map[props.action] ?? { icon: 'pi pi-info-circle', color: 'text-blueberry-700', bg: 'bg-blueberry-50 ring-blueberry-200' }
})

const label = computed(() =>
  props.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
           text-xs font-medium ring-1 ring-inset"
    :class="[config.color, config.bg]"
  >
    <i :class="config.icon" class="text-[10px]" />
    {{ label }}
  </span>
</template>