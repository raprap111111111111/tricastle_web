<script setup lang="ts">
import { computed } from 'vue'
import type { InternshipStatus } from '../types'

const props = defineProps<{ status: InternshipStatus | string }>()

const cls = computed(() => {
  const map: Record<string, string> = {
    draft:          'bg-gray-50 text-gray-700 ring-gray-200',
    pending:        'bg-yellow-50 text-yellow-700 ring-yellow-200',
    active:         'bg-emerald-50 text-emerald-700 ring-emerald-200',
    completed:      'bg-blue-50 text-blue-700 ring-blue-200',
    transferred:    'bg-indigo-50 text-indigo-700 ring-indigo-200',
    cancelled:      'bg-red-50 text-red-700 ring-red-200',
    returned_early: 'bg-orange-50 text-orange-700 ring-orange-200',
  }
  return map[props.status] ?? 'bg-gray-50 text-gray-700 ring-gray-200'
})

const label = computed(() =>
  String(props.status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
)
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset"
    :class="cls"
  >
    {{ label }}
  </span>
</template>