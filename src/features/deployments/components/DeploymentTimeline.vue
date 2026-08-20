<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DeploymentStatusBadge from './DeploymentStatusBadge.vue'
import type { Deployment } from '../types'

const props = defineProps<{
  deployments: Deployment[]
  loading?: boolean
}>()

const router = useRouter()

// ─── Group by month ───────────────────────────────────
interface GroupedDeployments {
  key: string           // e.g. "2026-08"
  label: string         // e.g. "August 2026"
  count: number
  deployments: Deployment[]
}

const groupedByMonth = computed<GroupedDeployments[]>(() => {
  const groups = new Map<string, Deployment[]>()

  // Sort DESC (newest first)
  const sorted = [...props.deployments].sort((a, b) => {
    const dateA = a.deployed_at ? new Date(a.deployed_at).getTime() : 0
    const dateB = b.deployed_at ? new Date(b.deployed_at).getTime() : 0
    return dateB - dateA
  })

  for (const d of sorted) {
    if (!d.deployed_at) continue
    const date = new Date(d.deployed_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(d)
  }

  return Array.from(groups.entries()).map(([key, deployments]) => {
    const [year, month] = key.split('-')
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })

    return {
      key,
      label: monthName,
      count: deployments.length,
      deployments,
    }
  })
})

// ─── Formatters ───────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

function formatDayNumber(dateStr: string | null | undefined): string {
  if (!dateStr) return '?'
  try {
    return String(new Date(dateStr).getDate())
  } catch {
    return '?'
  }
}

function formatDayName(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
  } catch {
    return ''
  }
}

function formatSalary(amount: number | null, currency: string | null): string {
  if (!amount) return ''
  const symbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : currency === 'PHP' ? '₱' : ''
  return `${symbol}${Number(amount).toLocaleString()} ${currency ?? ''}`.trim()
}

// ─── Navigation ───────────────────────────────────────
function goToApplicant(applicantId: number | undefined) {
  if (!applicantId) return
  router.push({ name: 'applicants.show', params: { id: applicantId } })
}
</script>

<template>
  <div class="flex flex-col gap-6">

    <!-- Loading state -->
    <div v-if="loading && deployments.length === 0" class="flex flex-col items-center justify-center py-16 gap-3">
      <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
      <p class="text-sm text-blueberry-500">Loading timeline...</p>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="deployments.length === 0"
      class="flex flex-col items-center justify-center py-16 gap-3 bg-white border border-appleCore-100 rounded-xl"
    >
      <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
        <i class="pi pi-calendar-times text-2xl text-blueberry-300" />
      </div>
      <p class="text-sm text-blueberry-500 font-medium">No deployments to display</p>
      <p class="text-xs text-blueberry-400">Timeline will appear when applicants are deployed</p>
    </div>

    <!-- Timeline -->
    <div v-else class="flex flex-col gap-6">
      <div
        v-for="group in groupedByMonth"
        :key="group.key"
        class="flex flex-col gap-3"
      >
        <!-- Month header -->
        <div class="sticky top-0 z-10 flex items-center gap-3 py-2 bg-appleCore-50/70 backdrop-blur-sm rounded-lg px-3 -mx-3">
          <div class="w-8 h-8 rounded-lg bg-apricot-100 flex items-center justify-center">
            <i class="pi pi-calendar text-apricot-600 text-xs" />
          </div>
          <div class="flex-1">
            <h3 class="text-base font-serif font-semibold text-blueberry-800">
              📅 {{ group.label }}
            </h3>
          </div>
          <span class="text-xs font-bold text-apricot-700 bg-apricot-100 px-2.5 py-1 rounded-full">
            {{ group.count }} deployed
          </span>
        </div>

        <!-- Deployments in this month -->
        <div class="flex flex-col gap-2 pl-4">
          <div
            v-for="deployment in group.deployments"
            :key="deployment.id"
            class="group flex items-stretch gap-3 bg-white border border-appleCore-100 rounded-xl p-3 hover:border-apricot-200 hover:shadow-sm transition-all cursor-pointer"
            @click="goToApplicant(deployment.applicant_id)"
          >
            <!-- Date column -->
            <div
              class="flex-shrink-0 w-14 flex flex-col items-center justify-center rounded-lg text-white"
              :class="
                deployment.cancelled_at
                  ? 'bg-gradient-to-br from-red-400 to-red-600'
                  : 'bg-gradient-to-br from-green-400 to-green-600'
              "
            >
              <span class="text-[10px] font-medium uppercase tracking-wider opacity-80">
                {{ formatDayName(deployment.deployed_at) }}
              </span>
              <span class="text-xl font-bold">
                {{ formatDayNumber(deployment.deployed_at) }}
              </span>
            </div>

            <!-- Content column -->
            <div class="flex-1 min-w-0">
              <!-- Top: Name + Status -->
              <div class="flex items-start justify-between gap-2 mb-1">
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-semibold text-blueberry-800 group-hover:text-apricot-600 transition-colors truncate">
                    {{ deployment.applicant?.full_name ?? 'Unknown Applicant' }}
                  </h4>
                  <span
                    v-if="deployment.applicant?.applicant_code"
                    class="text-[10px] font-mono text-apricot-600"
                  >
                    {{ deployment.applicant.applicant_code }}
                  </span>
                </div>

                <DeploymentStatusBadge
                  :status="deployment.status"
                  :cancelled-at="deployment.cancelled_at"
                />
              </div>

              <!-- Middle: Destination + Position -->
              <div class="flex items-center gap-3 text-xs text-blueberry-600 mt-1.5 flex-wrap">
                <span class="flex items-center gap-1">
                  <i class="pi pi-globe text-green-500 text-[10px]" />
                  <strong>{{ deployment.deployment_country ?? '—' }}</strong>
                </span>
                <span v-if="deployment.deployment_company" class="flex items-center gap-1">
                  <i class="pi pi-building text-blueberry-400 text-[10px]" />
                  {{ deployment.deployment_company }}
                </span>
                <span v-if="deployment.deployment_position" class="flex items-center gap-1">
                  <i class="pi pi-briefcase text-blueberry-400 text-[10px]" />
                  {{ deployment.deployment_position }}
                </span>
              </div>

              <!-- Bottom: Contract + Salary -->
              <div class="flex items-center gap-3 text-[11px] text-blueberry-500 mt-1.5 flex-wrap">
                <span v-if="deployment.contract_duration_months" class="flex items-center gap-1">
                  <i class="pi pi-calendar-clock text-[10px]" />
                  {{ deployment.contract_duration_months }} months
                </span>
                <span v-if="deployment.monthly_salary" class="flex items-center gap-1 font-medium">
                  <i class="pi pi-dollar text-[10px]" />
                  {{ formatSalary(deployment.monthly_salary, deployment.salary_currency) }}
                </span>
                <span v-if="deployment.flight_date" class="flex items-center gap-1">
                  <i class="pi pi-send text-[10px]" />
                  Flight: {{ formatDate(deployment.flight_date) }}
                </span>
              </div>
            </div>

            <!-- Arrow -->
            <div class="flex items-center">
              <i class="pi pi-arrow-right text-blueberry-300 group-hover:text-apricot-500 group-hover:translate-x-0.5 transition-all text-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>