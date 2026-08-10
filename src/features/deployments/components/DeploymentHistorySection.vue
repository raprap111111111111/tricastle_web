<script setup lang="ts">
import { computed } from 'vue'
import type { Deployment } from '../types'

// Accept a partial deployment shape since we build it from applicant_batches
type DeploymentLike = Partial<Deployment> & {
  id: number
  status?: string | null
  deployment_country?: string | null
  deployment_company?: string | null
  deployment_position?: string | null
  deployed_at?: string | null
  contract_duration_months?: number | null
  contract_start_date?: string | null
  contract_end_date?: string | null
  monthly_salary?: number | null
  salary_currency?: string | null
  flight_date?: string | null
  visa_type?: string | null
  deployment_notes?: string | null
  cancellation_reason?: string | null
  cancelled_at?: string | null
  returned_at?: string | null
  return_reason?: string | null
  completed_at?: string | null
  completion_notes?: string | null
  created_at?: string | null
}

const props = defineProps<{
  deployments: DeploymentLike[] | undefined | null
}>()

const sortedDeployments = computed(() => {
  if (!props.deployments || props.deployments.length === 0) return []
  return [...props.deployments].sort((a, b) => {
    const dateA = new Date(a.deployed_at ?? a.created_at ?? 0).getTime()
    const dateB = new Date(b.deployed_at ?? b.created_at ?? 0).getTime()
    return dateB - dateA
  })
})

const deploymentCount = computed(() => sortedDeployments.value.length)

// ─── Formatters ──────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

function formatCurrency(amount: number | null | undefined, currency?: string | null): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Status styling ──────────────────────────────────
function statusColor(status?: string | null): string {
  const map: Record<string, string> = {
    deployed:  'bg-green-50 text-green-700 ring-green-200',
    cancelled: 'bg-red-50 text-red-700 ring-red-200',
    completed: 'bg-blue-50 text-blue-700 ring-blue-200',
    returned:  'bg-orange-50 text-orange-700 ring-orange-200',
    active:    'bg-emerald-50 text-emerald-700 ring-emerald-200',
  }
  return map[status ?? 'deployed'] ?? 'bg-gray-50 text-gray-700 ring-gray-200'
}

function statusIcon(status?: string | null): string {
  const map: Record<string, string> = {
    deployed:  'pi-send',
    cancelled: 'pi-times-circle',
    completed: 'pi-check-circle',
    returned:  'pi-home',
    active:    'pi-check-circle',
  }
  return map[status ?? 'deployed'] ?? 'pi-info-circle'
}

function statusDotColor(status?: string | null): string {
  const map: Record<string, string> = {
    deployed:  'bg-green-500 ring-green-100',
    cancelled: 'bg-red-500 ring-red-100',
    completed: 'bg-blue-500 ring-blue-100',
    returned:  'bg-orange-500 ring-orange-100',
    active:    'bg-emerald-500 ring-emerald-100',
  }
  return map[status ?? 'deployed'] ?? 'bg-gray-400 ring-gray-100'
}

function statusLabel(status?: string | null): string {
  const map: Record<string, string> = {
    deployed:  'DEPLOYED',
    cancelled: 'CANCELLED',
    completed: 'COMPLETED',
    returned:  'RETURNED HOME',
    active:    'ACTIVE',
  }
  return map[status ?? 'deployed'] ?? (status ?? 'UNKNOWN').toUpperCase()
}

// ─── Country flag emoji ───────────────────────────────
function countryFlag(country?: string | null): string {
  const flags: Record<string, string> = {
    Japan: '🇯🇵',
    Korea: '🇰🇷',
    'South Korea': '🇰🇷',
    Taiwan: '🇹🇼',
    Singapore: '🇸🇬',
    'Saudi Arabia': '🇸🇦',
    UAE: '🇦🇪',
    Qatar: '🇶🇦',
    Kuwait: '🇰🇼',
    Bahrain: '🇧🇭',
    Oman: '🇴🇲',
    Canada: '🇨🇦',
    USA: '🇺🇸',
    'United States': '🇺🇸',
    Australia: '🇦🇺',
    'New Zealand': '🇳🇿',
    'Hong Kong': '🇭🇰',
    Malaysia: '🇲🇾',
    Philippines: '🇵🇭',
  }
  return flags[country ?? ''] ?? '🌍'
}
</script>

<template>
  <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
    <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
      <i class="pi pi-send text-apricot-500" />
      Deployment History
      <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">
        ({{ deploymentCount }})
      </span>
    </h3>

    <!-- ─── Timeline ─────────────────────────────────── -->
    <div v-if="deploymentCount > 0" class="relative">
      <!-- Vertical line -->
      <div class="absolute left-[15px] top-2 bottom-2 w-0.5 bg-appleCore-100" />

      <div class="space-y-4">
        <div v-for="deployment in sortedDeployments" :key="deployment.id" class="relative flex gap-4">
          <!-- Timeline dot -->
          <div class="relative z-10 flex-shrink-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center ring-4"
              :class="statusDotColor(deployment.status)">
              <i :class="`pi ${statusIcon(deployment.status)} text-white text-xs`" />
            </div>
          </div>

          <!-- Card -->
          <div class="flex-1 border border-appleCore-100 rounded-lg p-4
                   hover:bg-appleCore-50/30 hover:border-appleCore-200
                   transition-all">
            <!-- Header row: country + company + status -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-lg">{{ countryFlag(deployment.deployment_country) }}</span>
                  <p class="font-semibold text-blueberry-800">
                    {{ deployment.deployment_country ?? '—' }}
                  </p>
                  <span class="text-blueberry-300">·</span>
                  <p class="text-sm text-blueberry-600 truncate">
                    {{ deployment.deployment_company ?? '—' }}
                  </p>
                </div>
                <p v-if="deployment.deployment_position"
                  class="text-xs text-blueberry-500 mt-1 flex items-center gap-1">
                  <i class="pi pi-briefcase text-[10px]" />
                  {{ deployment.deployment_position }}
                </p>
              </div>

              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                       text-xs font-semibold ring-1 ring-inset whitespace-nowrap"
                :class="statusColor(deployment.status)">
                <i :class="`pi ${statusIcon(deployment.status)} text-[10px]`" />
                {{ statusLabel(deployment.status) }}
              </span>
            </div>

            <!-- Info grid: salary + duration + dates -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-appleCore-50">
              <!-- Salary -->
              <div v-if="deployment.monthly_salary">
                <p class="text-[10px] text-blueberry-400 uppercase tracking-wider">Salary</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">
                  {{ formatCurrency(deployment.monthly_salary, deployment.salary_currency) }}
                  <span class="text-[10px] text-blueberry-400 font-normal">/mo</span>
                </p>
              </div>

              <!-- Duration -->
              <div v-if="deployment.contract_duration_months">
                <p class="text-[10px] text-blueberry-400 uppercase tracking-wider">Duration</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">
                  {{ deployment.contract_duration_months }}
                  <span class="text-[10px] text-blueberry-400 font-normal">months</span>
                </p>
              </div>

              <!-- Deployed date -->
              <div v-if="deployment.deployed_at">
                <p class="text-[10px] text-blueberry-400 uppercase tracking-wider">Deployed</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">
                  {{ formatDate(deployment.deployed_at) }}
                </p>
              </div>

              <!-- Contract end / flight date -->
              <div v-if="deployment.contract_end_date">
                <p class="text-[10px] text-blueberry-400 uppercase tracking-wider">Contract End</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">
                  {{ formatDate(deployment.contract_end_date) }}
                </p>
              </div>

              <div v-else-if="deployment.flight_date">
                <p class="text-[10px] text-blueberry-400 uppercase tracking-wider">Flight Date</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">
                  {{ formatDate(deployment.flight_date) }}
                </p>
              </div>
            </div>

            <!-- Visa type -->
            <div v-if="deployment.visa_type" class="mt-3 inline-flex items-center gap-1.5 text-xs text-blueberry-600">
              <i class="pi pi-id-card text-apricot-500 text-[10px]" />
              <span class="font-medium">Visa:</span>
              <span>{{ deployment.visa_type }}</span>
            </div>

            <!-- 🏠 Returned home info -->
            <div v-if="deployment.status === 'returned' && deployment.return_reason"
              class="mt-3 pt-3 border-t border-orange-100 bg-orange-50/50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
              <p class="text-xs font-semibold text-orange-700 mb-1 flex items-center gap-1">
                <i class="pi pi-home text-[10px]" />
                Returned Home Early
              </p>
              <p class="text-xs text-orange-600 italic">"{{ deployment.return_reason }}"</p>
              <p v-if="deployment.returned_at" class="text-[10px] text-orange-500 mt-1">
                Returned on {{ formatDate(deployment.returned_at) }}
              </p>
            </div>

            <!-- ✅ Completed info -->
            <div v-else-if="deployment.status === 'completed'"
              class="mt-3 pt-3 border-t border-blue-100 bg-blue-50/50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
              <p class="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                <i class="pi pi-check-circle text-[10px]" />
                Contract Successfully Completed
              </p>
              <p v-if="deployment.completion_notes" class="text-xs text-blue-600 italic">
                "{{ deployment.completion_notes }}"
              </p>
              <p v-if="deployment.completed_at" class="text-[10px] text-blue-500 mt-1">
                Completed on {{ formatDate(deployment.completed_at) }}
              </p>
            </div>

            <!-- ❌ Cancellation info -->
            <div v-else-if="deployment.status === 'cancelled' && deployment.cancellation_reason"
              class="mt-3 pt-3 border-t border-red-100 bg-red-50/50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
              <p class="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                <i class="pi pi-times-circle text-[10px]" />
                Cancellation Reason
              </p>
              <p class="text-xs text-red-600 italic">"{{ deployment.cancellation_reason }}"</p>
              <p v-if="deployment.cancelled_at" class="text-[10px] text-red-500 mt-1">
                Cancelled on {{ formatDate(deployment.cancelled_at) }}
              </p>
            </div>

            <!-- Notes -->
            <p v-if="deployment.deployment_notes" class="text-xs text-blueberry-500 mt-3 italic leading-relaxed">
              <i class="pi pi-comment text-[10px] mr-1" />
              {{ deployment.deployment_notes }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Empty state ──────────────────────────────── -->
    <div v-else class="text-center py-8">
      <div class="w-14 h-14 rounded-full bg-appleCore-50 flex items-center justify-center mx-auto mb-3">
        <i class="pi pi-send text-blueberry-300 text-lg" />
      </div>
      <p class="text-sm text-blueberry-500 font-medium">No deployment history</p>
      <p class="text-xs text-blueberry-400 mt-1">
        This applicant hasn't been deployed yet
      </p>
    </div>
  </section>
</template>