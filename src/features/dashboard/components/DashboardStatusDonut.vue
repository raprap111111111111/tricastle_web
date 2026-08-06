<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { StatusBreakdown } from '../types'

Chart.register(...registerables)

const props = defineProps<{
  data?: StatusBreakdown | null
  loading?: boolean
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const items = computed(() => [
  { label: 'Verified',     value: props.data?.verified     ?? 0, color: '#10b981' },
  { label: 'Pending',      value: props.data?.pending      ?? 0, color: '#f59e0b' },
  { label: 'Under Review', value: props.data?.under_review ?? 0, color: '#3b82f6' },
  { label: 'Rejected',     value: props.data?.rejected     ?? 0, color: '#ef4444' },
  { label: 'Incomplete',   value: props.data?.incomplete   ?? 0, color: '#94a3b8' },
])

const total = computed(() => items.value.reduce((s, i) => s + i.value, 0))
const hasData = computed(() => total.value > 0)

function render() {
  if (!canvas.value || !hasData.value) {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    return
  }

  if (chartInstance) chartInstance.destroy()

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: items.value.map((i) => i.label),
      datasets: [
        {
          data: items.value.map((i) => i.value),
          backgroundColor: items.value.map((i) => i.color),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          cornerRadius: 8,
        },
      },
    },
  })
}

onMounted(render)
watch(() => props.data, render, { deep: true })
</script>

<template>
  <div class="min-h-[200px]">
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
        <i class="pi pi-chart-pie text-xl text-blueberry-300" />
      </div>
      <p class="text-sm font-semibold text-blueberry-600">No status data</p>
      <p class="text-xs text-blueberry-400">Add applicants to see breakdown</p>
    </div>

    <!-- Chart -->
    <div v-else class="flex items-center gap-6">
      <div class="relative w-[180px] h-[180px] flex-shrink-0">
        <canvas ref="canvas" />
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-3xl font-serif font-bold text-blueberry-800">{{ total }}</span>
          <span class="text-[11px] font-medium text-blueberry-500 uppercase tracking-wider">Total</span>
        </div>
      </div>

      <div class="flex-1 space-y-2.5">
        <div
          v-for="item in items"
          :key="item.label"
          class="flex items-center justify-between gap-2 py-1"
        >
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            <span class="text-xs font-medium text-blueberry-700">{{ item.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-blueberry-800">{{ item.value }}</span>
            <span class="text-[10px] font-medium text-blueberry-400 w-9 text-right">
              {{ total > 0 ? Math.round((item.value / total) * 100) : 0 }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>