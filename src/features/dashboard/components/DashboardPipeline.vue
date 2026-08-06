<script setup lang="ts">
import { computed } from 'vue'
import type { PipelineData } from '../types'

const props = defineProps<{
  data?: PipelineData | null
  loading?: boolean
}>()

const hasData = computed(() => {
  if (!props.data) return false
  return Object.values(props.data).some((v) => (v ?? 0) > 0)
})

const stages = computed(() => {
  if (!props.data) return []
  const max = props.data.applied ?? 1
  const raw = [
    { key: 'applied',             label: 'Applied',       value: props.data.applied ?? 0,             icon: 'pi-user-plus',  color: 'from-apricot-400 to-apricot-500' },
    { key: 'documents_submitted', label: 'Docs Uploaded', value: props.data.documents_submitted ?? 0, icon: 'pi-file',       color: 'from-blue-400 to-blue-500' },
    { key: 'under_review',        label: 'Under Review',  value: props.data.under_review ?? 0,        icon: 'pi-eye',        color: 'from-indigo-400 to-indigo-500' },
    { key: 'verified',            label: 'Verified',      value: props.data.verified ?? 0,            icon: 'pi-verified',   color: 'from-green-400 to-green-500' },
    { key: 'batched',             label: 'Batched',       value: props.data.batched ?? 0,             icon: 'pi-users',      color: 'from-purple-400 to-purple-500' },
    { key: 'deployed',            label: 'Deployed 🎌',   value: props.data.deployed ?? 0,            icon: 'pi-send',       color: 'from-pink-400 to-pink-500' },
  ]

  return raw.map((s) => ({
    ...s,
    percent: max > 0 ? Math.round((s.value / max) * 100) : 0,
  }))
})
</script>

<template>
  <div class="min-h-[280px]">
    <!-- Loading -->
    <div v-if="loading && !hasData" class="flex items-center justify-center py-16">
      <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!hasData"
      class="flex flex-col items-center justify-center py-10 text-center gap-2"
    >
      <div class="w-14 h-14 rounded-full bg-appleCore-50 flex items-center justify-center">
        <i class="pi pi-send text-xl text-blueberry-300" />
      </div>
      <p class="text-sm font-semibold text-blueberry-600">Pipeline is empty</p>
      <p class="text-xs text-blueberry-400">Add applicants to see the funnel</p>
    </div>

    <!-- Stages -->
    <div v-else class="space-y-2.5">
      <div
        v-for="(stage, i) in stages"
        :key="stage.key"
        class="relative"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex-shrink-0 w-9 h-9 rounded-lg bg-appleCore-50 flex items-center justify-center ring-1 ring-appleCore-200"
          >
            <i class="pi text-sm text-blueberry-600" :class="stage.icon" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-blueberry-700">{{ stage.label }}</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-blueberry-800">{{ stage.value }}</span>
                <span class="text-[10px] text-blueberry-400 font-medium w-9 text-right">
                  {{ stage.percent }}%
                </span>
              </div>
            </div>
            <div class="h-2 bg-appleCore-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r transition-all duration-700"
                :class="stage.color"
                :style="{ width: `${stage.percent}%` }"
              />
            </div>
          </div>
        </div>

        <div
          v-if="i < stages.length - 1 && stages[i].value > 0 && stages[i].value > stages[i + 1].value"
          class="flex items-center gap-1 mt-1 ml-12 text-[10px] text-red-500 font-medium"
        >
          <i class="pi pi-arrow-down text-[8px]" />
          {{ stages[i].value - stages[i + 1].value }} drop-off
          ({{ Math.round(((stages[i].value - stages[i + 1].value) / stages[i].value) * 100) }}%)
        </div>
      </div>
    </div>
  </div>
</template>