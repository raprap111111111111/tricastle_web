<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps<{
  labels?: string[]
  applicants?: number[]
  documents?: number[]
  loading?: boolean
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const hasData = computed(
  () =>
    (props.labels?.length ?? 0) > 0 &&
    ((props.applicants?.length ?? 0) > 0 || (props.documents?.length ?? 0) > 0),
)

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

  const gradientA = ctx.createLinearGradient(0, 0, 0, 250)
  gradientA.addColorStop(0, 'rgba(251, 146, 60, 0.4)')
  gradientA.addColorStop(1, 'rgba(251, 146, 60, 0)')

  const gradientD = ctx.createLinearGradient(0, 0, 0, 250)
  gradientD.addColorStop(0, 'rgba(30, 58, 138, 0.3)')
  gradientD.addColorStop(1, 'rgba(30, 58, 138, 0)')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels ?? [],
      datasets: [
        {
          label: 'Applicants',
          data: props.applicants ?? [],
          borderColor: '#f97316',
          backgroundColor: gradientA,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Documents',
          data: props.documents ?? [],
          borderColor: '#1e3a8a',
          backgroundColor: gradientD,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1e3a8a',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 12, weight: '600' as any },
            color: '#334155',
          },
        },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          cornerRadius: 8,
          titleFont: { weight: 'bold' as any },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.15)' },
          ticks: { color: '#94a3b8', font: { size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } },
        },
      },
    },
  })
}

onMounted(render)
watch(() => [props.labels, props.applicants, props.documents], render, {
  deep: true,
})
</script>

<template>
  <div class="relative h-[280px] w-full">
    <!-- Loading -->
    <div
      v-if="loading && !hasData"
      class="absolute inset-0 flex items-center justify-center"
    >
      <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!hasData"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"
    >
      <div class="w-14 h-14 rounded-full bg-appleCore-50 flex items-center justify-center">
        <i class="pi pi-chart-line text-xl text-blueberry-300" />
      </div>
      <p class="text-sm font-semibold text-blueberry-600">No trend data yet</p>
      <p class="text-xs text-blueberry-400">Chart will appear once activity begins</p>
    </div>

    <!-- Chart -->
    <canvas v-show="hasData" ref="canvas" />
  </div>
</template>