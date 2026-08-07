<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import DeploymentStatusBadge from './DeploymentStatusBadge.vue'
import { deploymentApi } from '../api/deployment.api'
import type { Deployment } from '../types'

const props = defineProps<{
  applicantId: number
  applicantName?: string
}>()

const router = useRouter()

// ─── State ────────────────────────────────────────────
const deployments = ref<Deployment[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// ─── Load history ─────────────────────────────────────
async function loadHistory() {
  loading.value = true
  error.value = null
  try {
    const response = await deploymentApi.list({
      include_all_statuses: true,  // Get ALL statuses (deployed + cancelled)
      limit: 100,
      order_by: 'deployed_at',
      order_dir: 'desc',
    })

    // Filter for this applicant only
    deployments.value = response.records.filter(
      (d) => d.applicant_id === props.applicantId,
    )
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load deployment history'
    deployments.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadHistory)

// ─── Formatters ───────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function formatSalary(amount: number | null, currency: string | null): string {
  if (!amount) return ''
  const symbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : currency === 'PHP' ? '₱' : ''
  return `${symbol}${Number(amount).toLocaleString()} ${currency ?? ''}`.trim()
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const now = new Date().getTime()
    const past = new Date(dateStr).getTime()
    const diffMs = now - past

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 30) return `${days} days ago`

    const months = Math.floor(days / 30)
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`

    const years = Math.floor(months / 12)
    return `${years} year${years > 1 ? 's' : ''} ago`
  } catch {
    return ''
  }
}

// ─── Deployment number badge (1st, 2nd, 3rd, ...) ─────
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Sort by deployed_at ASC to number them chronologically (1st, 2nd, 3rd)
const numberedDeployments = computed(() => {
  // Sort ASC by date to number them oldest-first
  const sortedAsc = [...deployments.value].sort((a, b) => {
    const dateA = a.deployed_at ? new Date(a.deployed_at).getTime() : 0
    const dateB = b.deployed_at ? new Date(b.deployed_at).getTime() : 0
    return dateA - dateB
  })

  const withNumbers = sortedAsc.map((d, idx) => ({
    ...d,
    _deploymentNumber: idx + 1,
  }))

  // Return DESC (newest first) for display
  return withNumbers.reverse()
})

// ─── Contract status helper ───────────────────────────
function getContractStatus(d: Deployment): { label: string; class: string } {
  if (d.cancelled_at) {
    return { label: 'Cancelled', class: 'text-red-600 bg-red-50 ring-red-200' }
  }

  if (!d.contract_end_date) {
    return { label: 'Active', class: 'text-green-600 bg-green-50 ring-green-200' }
  }

  const now = new Date()
  const end = new Date(d.contract_end_date)

  if (end < now) {
    return { label: 'Completed', class: 'text-blue-600 bg-blue-50 ring-blue-200' }
  }

  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft <= 60) {
    return { label: `${daysLeft}d left`, class: 'text-amber-600 bg-amber-50 ring-amber-200' }
  }

  return { label: 'Active', class: 'text-green-600 bg-green-50 ring-green-200' }
}

function goToDeployment(id: number) {
  router.push({ name: 'deployments.show', params: { id } })
}
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
          <i class="pi pi-send text-green-600 text-sm" />
        </div>
        <div>
          <h3 class="font-serif text-lg font-semibold text-blueberry-800">
            Deployment History
          </h3>
          <p class="text-xs text-blueberry-500">
            {{ deployments.length }} {{ deployments.length === 1 ? 'deployment' : 'deployments' }}
          </p>
        </div>
      </div>

      <Button
        icon="pi pi-refresh"
        text
        rounded
        size="small"
        :loading="loading"
        @click="loadHistory"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading && deployments.length === 0" class="space-y-3">
      <Skeleton height="80px" border-radius="12px" v-for="i in 2" :key="i" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="text-center py-6 bg-red-50 border border-red-200 rounded-xl"
    >
      <i class="pi pi-exclamation-triangle text-2xl text-red-500 mb-2" />
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="deployments.length === 0"
      class="text-center py-8 bg-appleCore-50/50 border border-dashed border-appleCore-200 rounded-xl"
    >
      <div class="w-16 h-16 rounded-full bg-appleCore-100 flex items-center justify-center mx-auto mb-3">
        <i class="pi pi-send text-2xl text-blueberry-300" />
      </div>
      <p class="text-sm text-blueberry-500 font-medium">No deployment history</p>
      <p class="text-xs text-blueberry-400 mt-1">
        This applicant hasn't been deployed yet
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <!-- Vertical line -->
      <div class="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-200 via-apricot-200 to-appleCore-100" />

      <!-- Deployment cards -->
      <div class="flex flex-col gap-4">
        <div
          v-for="deployment in numberedDeployments"
          :key="deployment.id"
          class="relative pl-16"
        >
          <!-- Timeline dot with deployment number -->
          <div
            class="absolute left-2 top-4 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white z-10"
            :class="
              deployment.cancelled_at
                ? 'bg-red-500'
                : deployment.contract_end_date && new Date(deployment.contract_end_date) < new Date()
                  ? 'bg-blue-500'
                  : 'bg-green-500'
            "
          >
            <span class="text-[10px] font-bold text-white">
              {{ deployment._deploymentNumber }}
            </span>
          </div>

          <!-- Card -->
          <div
            class="bg-white border border-appleCore-100 rounded-xl p-4 hover:border-apricot-200 hover:shadow-sm transition-all cursor-pointer group"
            @click="goToDeployment(deployment.id)"
          >
            <!-- Top row: deployment number + status -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-bold text-apricot-600">
                    {{ getOrdinal(deployment._deploymentNumber) }} Deployment
                  </span>
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold ring-1 uppercase tracking-wider"
                    :class="getContractStatus(deployment).class"
                  >
                    {{ getContractStatus(deployment).label }}
                  </span>
                </div>
                <h4 class="text-base font-semibold text-blueberry-800 group-hover:text-apricot-600 transition-colors flex items-center gap-1.5">
                  <i class="pi pi-globe text-green-500 text-xs" />
                  {{ deployment.deployment_country ?? 'Unknown Country' }}
                </h4>
                <p v-if="deployment.deployment_company" class="text-sm text-blueberry-500 mt-0.5">
                  {{ deployment.deployment_company }}
                </p>
              </div>

              <DeploymentStatusBadge
                :status="deployment.status"
                :cancelled-at="deployment.cancelled_at"
              />
            </div>

            <!-- Info grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-appleCore-100">
              <!-- Position -->
              <div v-if="deployment.deployment_position">
                <p class="text-[10px] text-blueberry-400 font-medium uppercase tracking-wider">Position</p>
                <p class="text-xs text-blueberry-700 font-medium mt-0.5">{{ deployment.deployment_position }}</p>
              </div>

              <!-- Deployed -->
              <div>
                <p class="text-[10px] text-blueberry-400 font-medium uppercase tracking-wider">Deployed</p>
                <p class="text-xs text-blueberry-700 font-medium mt-0.5">
                  {{ formatDate(deployment.deployed_at) }}
                </p>
                <p class="text-[10px] text-blueberry-400 mt-0.5">
                  {{ timeAgo(deployment.deployed_at) }}
                </p>
              </div>

              <!-- Duration -->
              <div v-if="deployment.contract_duration_months">
                <p class="text-[10px] text-blueberry-400 font-medium uppercase tracking-wider">Contract</p>
                <p class="text-xs text-blueberry-700 font-medium mt-0.5">
                  {{ deployment.contract_duration_months }} months
                </p>
              </div>

              <!-- Salary -->
              <div v-if="deployment.monthly_salary">
                <p class="text-[10px] text-blueberry-400 font-medium uppercase tracking-wider">Salary</p>
                <p class="text-xs text-blueberry-700 font-medium mt-0.5 tabular-nums">
                  {{ formatSalary(deployment.monthly_salary, deployment.salary_currency) }}
                </p>
              </div>
            </div>

            <!-- Cancellation reason -->
            <div
              v-if="deployment.cancelled_at && deployment.cancellation_reason"
              class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg"
            >
              <p class="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <i class="pi pi-times-circle text-[9px]" />
                Cancelled on {{ formatDate(deployment.cancelled_at) }}
              </p>
              <p class="text-xs text-red-800">{{ deployment.cancellation_reason }}</p>
            </div>

            <!-- Notes -->
            <div
              v-else-if="deployment.deployment_notes"
              class="mt-3 p-2 bg-appleCore-50 rounded-lg"
            >
              <p class="text-xs text-blueberry-600 italic">{{ deployment.deployment_notes }}</p>
            </div>

            <!-- Footer: view link -->
            <div class="flex items-center justify-end mt-3 pt-2 border-t border-appleCore-50">
              <span class="text-[11px] text-apricot-600 group-hover:text-apricot-700 font-medium flex items-center gap-1">
                View details
                <i class="pi pi-arrow-right text-[9px] group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>