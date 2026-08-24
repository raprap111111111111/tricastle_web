<!-- src/features/applicants/views/ApplicantDetail.vue -->
<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useApplicantStore } from '../stores/applicant.store'
import ApplicantStatusBadge from '../components/ApplicantStatusBadge.vue'
import AppAddressMap from '@shared/ui/map/AppAddressMap.vue'
import DeploymentHistorySection from '@features/deployments/components/DeploymentHistorySection.vue'

// ✅ NEW — barrel import (short and clean)
import {
  generateAIS,
  generateBulkAIS,
  mapApplicantToAIS,
  type AISData,
  type BulkProgress,
} from '@shared/utils/ais'

// ✅ NEW — Photo utilities
import { getApplicantPhoto, getDefaultAvatar } from '@shared/utils/applicant-photo'

const props = defineProps<{ id: number }>()

const router = useRouter()
const store  = useApplicantStore()
const toast  = useToast()

// ─── Map visibility (persists across sessions) ────────────────────────────────
const MAP_STORAGE_KEY = 'applicant_map_visible'
const showMap = ref<boolean>(localStorage.getItem(MAP_STORAGE_KEY) !== 'false')

watch(showMap, (v) => localStorage.setItem(MAP_STORAGE_KEY, String(v)))
function toggleMap() { showMap.value = !showMap.value }

onMounted(async () => {
  store.clearApplicant()
  await store.fetchApplicant(props.id)
})

const a = computed(() => store.applicant)

// ─── Extract deployments from applicant_batches ────────────────────────────────
const applicantDeployments = computed(() => {
  if (!a.value?.applicant_batches) return []
  return a.value.applicant_batches
    .filter((ab: any) => ab.deployment_country || ab.deployed_at)
    .map((ab: any) => ({
      id:                       ab.id,
      status:                   ab.cancelled_at ? 'cancelled'
                                : ab.completed_at ? 'completed'
                                : ab.returned_at  ? 'returned'
                                : ab.status === 'deployed' ? 'deployed' : 'active',
      deployment_country:       ab.deployment_country,
      deployment_company:       ab.deployment_company,
      deployment_position:      ab.deployment_position,
      deployed_at:              ab.deployed_at,
      contract_duration_months: ab.contract_duration_months,
      contract_start_date:      ab.contract_start_date,
      contract_end_date:        ab.contract_end_date,
      monthly_salary:           ab.monthly_salary,
      salary_currency:          ab.salary_currency,
      flight_date:              ab.flight_date,
      visa_type:                ab.visa_type,
      deployment_notes:         ab.deployment_notes,
      cancellation_reason:      ab.cancellation_reason,
      cancelled_at:             ab.cancelled_at,
      returned_at:              ab.returned_at,
      return_reason:            ab.return_reason,
      completed_at:             ab.completed_at,
      completion_notes:         ab.completion_notes,
      batch:                    ab.batch,
    }))
})

// ═══════════════════════════════════════════════════════════════════════════
// 📄 AIS PDF GENERATION
// ═══════════════════════════════════════════════════════════════════════════

const generatingAIS = ref(false)

/**
 * Convert a remote image URL to base64 so jsPDF can embed it.
 * Returns null on failure (e.g. CORS or 404) — AIS still generates without photo.
 */
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror   = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function handleGenerateAIS(): Promise<void> {
  if (!a.value || generatingAIS.value) return

  generatingAIS.value = true
  try {
    const aisData = mapApplicantToAIS(
      a.value,
      a.value.assigned_staff?.full_name,
    )

    // ✅ Embed real photo into PDF if available (ignoring ui-avatars fallback)
    const photoUrl = getApplicantPhoto(a.value)
    if (photoUrl && !photoUrl.includes('ui-avatars.com')) {
      const base64 = await urlToBase64(photoUrl)
      if (base64) aisData.photo = base64
    }

    await generateAIS(aisData)

    toast.add({
      severity: 'success',
      summary:  'AIS Generated',
      detail:   `${a.value.applicant_code} information sheet downloaded`,
      life:     3000,
    })
  } catch (err) {
    console.error('[AIS] Generation failed:', err)
    toast.add({
      severity: 'error',
      summary:  'AIS Failed',
      detail:   'Could not generate the information sheet. Please try again.',
      life:     4000,
    })
  } finally {
    generatingAIS.value = false
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return '—' }
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}

function display(val: any, fallback = '—'): string {
  if (val === null || val === undefined || val === '') return fallback
  return String(val)
}

function capitalize(val: string | null | undefined): string {
  if (!val) return '—'
  return val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ')
}

function gradeColor(grade: string): string {
  const map: Record<string, string> = {
    A: 'text-green-600 bg-green-50 ring-green-200',
    B: 'text-blue-600 bg-blue-50 ring-blue-200',
    C: 'text-yellow-600 bg-yellow-50 ring-yellow-200',
    D: 'text-orange-600 bg-orange-50 ring-orange-200',
    F: 'text-red-500 bg-red-50 ring-red-200',
  }
  return map[grade] ?? 'text-gray-600 bg-gray-50 ring-gray-200'
}

function skillCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    skilled:      'bg-green-50 text-green-700 ring-green-200',
    semi_skilled: 'bg-blue-50 text-blue-700 ring-blue-200',
    unskilled:    'bg-gray-50 text-gray-700 ring-gray-200',
  }
  return map[cat] ?? 'bg-gray-50 text-gray-700 ring-gray-200'
}

const fullAddress = computed(() => {
  if (!a.value) return ''
  return [a.value.current_address, a.value.city, a.value.province, a.value.postal_code]
    .filter(Boolean).join(', ')
})

function batchStatusColor(status?: string): string {
  const map: Record<string, string> = {
    assigned:             'bg-blue-50 text-blue-700 ring-blue-200',
    interview_scheduled:  'bg-cyan-50 text-cyan-700 ring-cyan-200',
    interview_passed:     'bg-teal-50 text-teal-700 ring-teal-200',
    interview_failed:     'bg-red-50 text-red-700 ring-red-200',
    medical_pending:      'bg-yellow-50 text-yellow-700 ring-yellow-200',
    medical_passed:       'bg-teal-50 text-teal-700 ring-teal-200',
    medical_failed:       'bg-red-50 text-red-700 ring-red-200',
    exam_pending:         'bg-yellow-50 text-yellow-700 ring-yellow-200',
    exam_passed:          'bg-teal-50 text-teal-700 ring-teal-200',
    exam_failed:          'bg-red-50 text-red-700 ring-red-200',
    accepted:             'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected:             'bg-red-50 text-red-700 ring-red-200',
    withdrawn:            'bg-gray-50 text-gray-700 ring-gray-200',
    deployed:             'bg-indigo-50 text-indigo-700 ring-indigo-200',
  }
  return map[status ?? ''] ?? 'bg-gray-50 text-gray-700 ring-gray-200'
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-6xl mx-auto">

    <!-- ─── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button icon="pi pi-arrow-left" text rounded @click="router.push({ name: 'applicants.index' })" />
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-800">Applicant Details</h1>
          <p v-if="a" class="text-sm text-blueberry-500">View complete applicant information</p>
        </div>
      </div>
      <div v-if="a" class="flex items-center gap-2">
        <Button
          v-if="a.city || a.current_address"
          :label="showMap ? 'Hide Map' : 'Show Map'"
          :icon="showMap ? 'pi pi-eye-slash' : 'pi pi-map-marker'"
          severity="secondary"
          text
          @click="toggleMap"
        />

        <Button
          label="Generate AIS"
          icon="pi pi-file-pdf"
          severity="secondary"
          outlined
          :loading="generatingAIS"
          class="!text-red-600 !border-red-300 hover:!bg-red-50"
          v-tooltip.top="'Download Applicant Information Sheet (PDF)'"
          @click="handleGenerateAIS"
        />

        <Button
          label="Edit"
          icon="pi pi-pencil"
          severity="secondary"
          outlined
          @click="router.push({ name: 'applicants.edit', params: { id: a.id } })"
        />
      </div>
    </div>

    <!-- ─── Loading ──────────────────────────────────────────────────────────── -->
    <template v-if="store.loading">
      <Skeleton height="200px" border-radius="16px" />
      <Skeleton height="300px" border-radius="16px" />
      <Skeleton height="300px" border-radius="16px" />
    </template>

    <!-- ─── Not Found ─────────────────────────────────────────────────────────── -->
    <template v-else-if="!a">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-exclamation-circle text-4xl mb-3" />
        <p>Applicant not found</p>
      </div>
    </template>

    <!-- ─── Full Details ──────────────────────────────────────────────────────── -->
    <template v-else>

      <!-- Map -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4 max-h-0"
        enter-to-class="opacity-100 translate-y-0 max-h-[500px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[500px]"
        leave-to-class="opacity-0 -translate-y-4 max-h-0"
      >
        <section
          v-if="showMap && (a.city || a.current_address)"
          class="bg-white rounded-2xl border border-appleCore-100 overflow-hidden"
        >
          <div class="flex items-center justify-between px-5 py-3 border-b border-appleCore-100 bg-appleCore-50/50">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-apricot-100 flex items-center justify-center">
                <i class="pi pi-map-marker text-apricot-600 text-sm" />
              </div>
              <div>
                <p class="text-sm font-semibold text-blueberry-800">Applicant Location</p>
                <p class="text-xs text-blueberry-500 truncate max-w-md">{{ fullAddress || 'No address' }}</p>
              </div>
            </div>
            <Button icon="pi pi-times" severity="secondary" text rounded size="small" @click="showMap = false" v-tooltip.top="'Hide map'" />
          </div>
          <div class="h-[320px] w-full">
            <AppAddressMap
              label="Current Address"
              :address="a.current_address"
              :city="a.city"
              :province="a.province"
              :postal-code="a.postal_code"
              country="Philippines"
              height="100%"
              :zoom="14"
              class="h-full [&>div:first-child]:hidden [&>div:last-child]:h-full [&>div:last-child]:rounded-none [&>div:last-child]:ring-0"
            />
          </div>
        </section>
      </Transition>

      <button
        v-if="!showMap && (a.city || a.current_address)"
        type="button"
        class="w-full py-3 px-4 rounded-xl border-2 border-dashed border-appleCore-200
               hover:border-apricot-300 hover:bg-apricot-50/30 transition-all
               flex items-center justify-center gap-2 text-sm font-medium
               text-blueberry-500 hover:text-apricot-600 group"
        @click="showMap = true"
      >
        <i class="pi pi-map-marker group-hover:text-apricot-500" />
        <span>Show applicant location on map</span>
        <i class="pi pi-chevron-down text-xs" />
      </button>

      <!-- ─── Profile Header ─────────────────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start gap-5">
          <!-- 🖼️ APPLICANT PHOTO AVATAR -->
          <div class="w-24 h-24 rounded-full bg-appleCore-50 border border-appleCore-200 flex-shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
            <img
              :src="getApplicantPhoto(a)"
              :alt="a.full_name || `${a.first_name} ${a.last_name}`"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).src = getDefaultAvatar(a.full_name || `${a.first_name} ${a.last_name}`)"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded">
                {{ a.applicant_code }}
              </span>
              <ApplicantStatusBadge :status="a.status" />
              <span
                v-if="a.deployment?.japan_deployment_ready"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                       font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
              >
                <i class="pi pi-send text-[10px]" />
                JP Ready
              </span>
            </div>
            <h2 class="text-2xl font-serif font-semibold text-blueberry-800">
              {{ a.first_name }}
              {{ a.middle_name ? a.middle_name + ' ' : '' }}
              {{ a.last_name }}
              {{ a.suffix ?? '' }}
            </h2>
            <div class="flex flex-wrap gap-4 mt-2 text-sm text-blueberry-500">
              <span class="flex items-center gap-1.5">
                <i class="pi pi-envelope text-xs" />
                {{ a.email }}
              </span>
              <span v-if="a.phone" class="flex items-center gap-1.5">
                <i class="pi pi-phone text-xs" />
                {{ a.phone }}
              </span>
              <span v-if="a.nationality" class="flex items-center gap-1.5">
                <i class="pi pi-globe text-xs" />
                {{ a.nationality }}
              </span>
              <span
                v-if="a.city"
                class="flex items-center gap-1.5 cursor-pointer hover:text-apricot-600"
                @click="showMap = true"
              >
                <i class="pi pi-map-marker text-xs text-apricot-500" />
                {{ [a.city, a.province].filter(Boolean).join(', ') }}
              </span>
              <span v-if="a.trade_or_occupation" class="flex items-center gap-1.5">
                <i class="pi pi-briefcase text-xs text-apricot-500" />
                {{ a.trade_or_occupation }}
              </span>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-xs text-blueberry-400 uppercase font-medium tracking-wider">Quality Score</p>
            <p class="text-3xl font-serif font-bold text-blueberry-800 mt-1">{{ a.quality_score }}%</p>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ring-1 ring-inset mt-1"
              :class="gradeColor(a.quality_grade)"
            >
              Grade {{ a.quality_grade }}
            </span>
          </div>
        </div>

        <div v-if="a.final_listed_at || a.rejected_at || a.rejection_reason" class="mt-4 pt-4 border-t border-appleCore-100">
          <div v-if="a.status === 'final_list' && a.final_listed_at" class="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <i class="pi pi-check-circle text-green-600" />
            <span>
              Moved to Final List on <strong>{{ formatDateTime(a.final_listed_at) }}</strong>
              <span v-if="a.reviewer"> by <strong>{{ a.reviewer?.full_name }}</strong></span>
            </span>
          </div>
          <div v-if="a.status === 'rejected'" class="flex flex-col gap-1 bg-red-50 px-3 py-2 rounded-lg">
            <div class="flex items-center gap-2 text-sm text-red-700">
              <i class="pi pi-times-circle text-red-600" />
              <span>
                Rejected on <strong>{{ formatDateTime(a.rejected_at) }}</strong>
                <span v-if="a.reviewer"> by <strong>{{ a.reviewer?.full_name }}</strong></span>
              </span>
            </div>
            <p v-if="a.rejection_reason" class="text-sm text-red-600 ml-6 italic">"{{ a.rejection_reason }}"</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-appleCore-100">
          <div>
            <p class="text-xs text-blueberry-400 uppercase tracking-wider">Assigned Staff</p>
            <p class="text-sm font-medium text-blueberry-800 mt-1">{{ a.assigned_staff?.full_name ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-blueberry-400 uppercase tracking-wider">Created By</p>
            <p class="text-sm font-medium text-blueberry-800 mt-1">{{ a.creator?.full_name ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-blueberry-400 uppercase tracking-wider">Created At</p>
            <p class="text-sm font-medium text-blueberry-800 mt-1">{{ formatDate(a.created_at) }}</p>
          </div>
        </div>
      </section>

      <!-- ─── Personal Information ───────────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-user text-apricot-500" />
          Personal Information
        </h3>
        <dl class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">First Name</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.first_name) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Middle Name</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.middle_name) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Last Name</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.last_name) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Suffix</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.suffix) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Email</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.email) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Phone</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.phone) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Mobile</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.mobile) }}</dd></div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Date of Birth</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ formatDate(a.date_of_birth) }}
              <span v-if="a.age" class="text-blueberry-500 text-xs">({{ a.age }} yrs)</span>
            </dd>
          </div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Gender</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ capitalize(a.gender) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Civil Status</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ capitalize(a.civil_status) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Children</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ a.number_of_children ?? 0 }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Nationality</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.nationality) }}</dd></div>
        </dl>
      </section>

      <!-- ─── Physical Information ───────────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-heart text-apricot-500" />
          Physical Information
        </h3>
        <dl class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Height</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ a.height_cm ? `${a.height_cm} cm` : '—' }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Weight</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ a.weight_kg ? `${a.weight_kg} kg` : '—' }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Blood Type</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.blood_type) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Dominant Hand</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ capitalize(a.dominant_hand) }}</dd></div>
        </dl>
      </section>

      <!-- ─── Address ──────────────────────────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-serif font-semibold text-blueberry-800 flex items-center gap-2">
            <i class="pi pi-map-marker text-apricot-500" />
            Address Details
          </h3>
          <button
            v-if="a.city || a.current_address"
            type="button"
            class="text-xs text-apricot-600 hover:text-apricot-700 hover:underline flex items-center gap-1"
            @click="showMap = true"
          >
            <i class="pi pi-map text-[10px]" />
            View on map
          </button>
        </div>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Current Address</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.current_address) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Permanent Address</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.permanent_address) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">City</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.city) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Province</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.province) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Postal Code</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.postal_code) }}</dd></div>
        </dl>
      </section>

      <!-- ─── Documents & Government IDs ────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-id-card text-apricot-500" />
          Documents &amp; Government IDs
        </h3>
        <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Passport Number</dt><dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.passport_number) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Passport Expiry</dt><dd class="text-sm font-medium text-blueberry-800 mt-1">{{ formatDate(a.passport_expiry) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">SSS Number</dt><dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.sss_number) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">TIN Number</dt><dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.tin_number) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">PhilHealth Number</dt><dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.philhealth_number) }}</dd></div>
          <div><dt class="text-xs text-blueberry-400 uppercase tracking-wider">Pag-IBIG Number</dt><dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.pagibig_number) }}</dd></div>
        </dl>
      </section>

      <!-- ─── Japan Deployment Profile (Phase 1) ───────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-5 flex items-center gap-2">
          <i class="pi pi-send text-apricot-500" />
          Japan Deployment Profile
        </h3>

        <div class="mb-5">
          <p class="text-[11px] font-bold text-blueberry-400 uppercase tracking-wider mb-3">Skill &amp; Trade</p>
          <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Skill Category</dt>
              <dd class="mt-1">
                <span
                  v-if="a.skill_category"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset"
                  :class="skillCategoryColor(a.skill_category)"
                >
                  {{ capitalize(a.skill_category) }}
                </span>
                <span v-else class="text-sm text-blueberry-400">—</span>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Trade / Occupation</dt>
              <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.trade_or_occupation) }}</dd>
            </div>
          </dl>
        </div>

        <div class="mb-5 pt-4 border-t border-appleCore-100">
          <p class="text-[11px] font-bold text-blueberry-400 uppercase tracking-wider mb-3">Language</p>
          <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Basic English</dt>
              <dd class="mt-1">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset"
                  :class="a.language?.understands_basic_english
                    ? 'bg-green-50 text-green-700 ring-green-200'
                    : 'bg-red-50 text-red-600 ring-red-200'"
                >
                  <i :class="a.language?.understands_basic_english ? 'pi pi-check' : 'pi pi-times'" class="text-[10px]" />
                  {{ a.language?.understands_basic_english ? 'Yes' : 'No' }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">JLPT Level</dt>
              <dd class="mt-1">
                <span
                  v-if="a.language?.jlpt_level"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                         bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                >
                  {{ a.language.jlpt_level }}
                </span>
                <span v-else class="text-sm text-blueberry-400">Not tested</span>
              </dd>
            </div>
          </dl>
        </div>

        <div class="mb-5 pt-4 border-t border-appleCore-100">
          <p class="text-[11px] font-bold text-blueberry-400 uppercase tracking-wider mb-3">Deployment Readiness</p>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div class="flex items-center gap-2 p-3 rounded-lg bg-appleCore-50">
              <i class="text-sm" :class="a.deployment?.willing_to_be_deployed ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-400'" />
              <div>
                <p class="text-xs font-semibold text-blueberry-700">Willing to Deploy</p>
                <p class="text-xs text-blueberry-500">{{ a.deployment?.willing_to_be_deployed ? 'Yes' : 'No' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 p-3 rounded-lg bg-appleCore-50">
              <i class="text-sm" :class="a.deployment?.japan_deployment_ready ? 'pi pi-check-circle text-green-500' : 'pi pi-clock text-amber-400'" />
              <div>
                <p class="text-xs font-semibold text-blueberry-700">Deployment Ready</p>
                <p class="text-xs text-blueberry-500">{{ a.deployment?.japan_deployment_ready ? 'Cleared' : 'Pending' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 p-3 rounded-lg bg-appleCore-50">
              <i class="text-sm" :class="a.deployment?.ssw_eligible ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-400'" />
              <div>
                <p class="text-xs font-semibold text-blueberry-700">SSW Eligible</p>
                <p class="text-xs text-blueberry-500">{{ a.deployment?.ssw_eligible ? 'Yes' : 'No' }}</p>
              </div>
            </div>
          </div>

          <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Preferred Location</dt>
              <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.deployment?.preferred_work_location) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Japan Experience</dt>
              <dd class="text-sm font-medium text-blueberry-800 mt-1">
                <span v-if="a.deployment?.previous_japan_experience">
                  ✅ Yes — <strong>{{ a.deployment.years_japan_experience }}</strong>
                  yr{{ a.deployment.years_japan_experience !== 1 ? 's' : '' }}
                </span>
                <span v-else class="text-blueberry-400">None</span>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">TITP Certificate</dt>
              <dd class="text-sm font-medium text-blueberry-800 mt-1">
                <span v-if="a.deployment?.has_titp_certificate">
                  ✅ {{ display(a.deployment.titp_occupation) }}
                </span>
                <span v-else class="text-blueberry-400">None</span>
              </dd>
            </div>
          </dl>
        </div>

        <div class="pt-4 border-t border-appleCore-100">
          <p class="text-[11px] font-bold text-blueberry-400 uppercase tracking-wider mb-3">Salary</p>
          <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Expected Salary</dt>
              <dd class="text-sm font-medium text-blueberry-800 mt-1">
                <span v-if="a.salary?.expected_salary">
                  {{ a.salary.expected_salary_currency }} {{ a.salary.expected_salary.toLocaleString() }}
                </span>
                <span v-else class="text-blueberry-400">—</span>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Current Salary</dt>
              <dd class="text-sm font-medium text-blueberry-800 mt-1">
                <span v-if="a.salary?.current_salary">
                  {{ a.salary.current_salary_currency }} {{ a.salary.current_salary.toLocaleString() }}
                </span>
                <span v-else class="text-blueberry-400">—</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- ─── Family & Emergency Contact (Phase 1) ──────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-users text-apricot-500" />
          Family &amp; Emergency Contact
        </h3>

        <template v-if="a.family">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="border border-appleCore-100 rounded-lg p-4">
              <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-2">Father</p>
              <p class="text-sm font-semibold text-blueberry-800">{{ display(a.family.father.name) }}</p>
              <p class="text-xs text-blueberry-500 mt-0.5">{{ display(a.family.father.occupation) }}</p>
              <p v-if="a.family.father.contact" class="text-xs text-blueberry-500 mt-1 flex items-center gap-1">
                <i class="pi pi-phone text-[10px]" />
                {{ a.family.father.contact }}
              </p>
            </div>

            <div class="border border-appleCore-100 rounded-lg p-4">
              <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-2">Mother</p>
              <p class="text-sm font-semibold text-blueberry-800">{{ display(a.family.mother.name) }}</p>
              <p class="text-xs text-blueberry-500 mt-0.5">{{ display(a.family.mother.occupation) }}</p>
              <p v-if="a.family.mother.contact" class="text-xs text-blueberry-500 mt-1 flex items-center gap-1">
                <i class="pi pi-phone text-[10px]" />
                {{ a.family.mother.contact }}
              </p>
            </div>

            <div
              v-if="a.civil_status === 'married' || a.family.spouse.name"
              class="border border-appleCore-100 rounded-lg p-4"
            >
              <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-2">Spouse</p>
              <p class="text-sm font-semibold text-blueberry-800">{{ display(a.family.spouse.name) }}</p>
              <p class="text-xs text-blueberry-500 mt-0.5">{{ display(a.family.spouse.occupation) }}</p>
              <p v-if="a.family.spouse.contact" class="text-xs text-blueberry-500 mt-1 flex items-center gap-1">
                <i class="pi pi-phone text-[10px]" />
                {{ a.family.spouse.contact }}
              </p>
            </div>
          </div>

          <div v-if="a.family.emergency_contact.name" class="mt-2 pt-4 border-t border-appleCore-100">
            <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-3">Emergency Contact</p>
            <div class="flex flex-wrap gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
              <div>
                <p class="text-xs text-blueberry-400">Name</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">{{ display(a.family.emergency_contact.name) }}</p>
              </div>
              <div>
                <p class="text-xs text-blueberry-400">Relationship</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">{{ display(a.family.emergency_contact.relationship) }}</p>
              </div>
              <div>
                <p class="text-xs text-blueberry-400">Phone</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">{{ display(a.family.emergency_contact.phone) }}</p>
              </div>
              <div v-if="a.family.emergency_contact.address">
                <p class="text-xs text-blueberry-400">Address</p>
                <p class="text-sm font-semibold text-blueberry-800 mt-0.5">{{ a.family.emergency_contact.address }}</p>
              </div>
            </div>
          </div>
        </template>

        <p v-else class="text-blueberry-400 italic text-sm">No family information recorded</p>
      </section>

      <!-- ─── Lifestyle ─────────────────────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-shield text-apricot-500" />
          Lifestyle &amp; Health
        </h3>
        <template v-if="a.lifestyle">
          <div class="mb-4">
            <p class="text-xs text-blueberry-400 uppercase tracking-wider mb-2">Current Habits</p>
            <div class="flex flex-wrap gap-2">
              <span v-if="a.lifestyle.is_smoking" class="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium ring-1 ring-orange-200">
                🚬 Smoking
                <span v-if="a.lifestyle.smoking_frequency" class="text-orange-500">· {{ a.lifestyle.smoking_frequency }}</span>
              </span>
              <span v-if="a.lifestyle.is_drinking_alcohol" class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium ring-1 ring-blue-200">
                🍺 Drinking
                <span v-if="a.lifestyle.drinking_frequency" class="text-blue-500">· {{ a.lifestyle.drinking_frequency }}</span>
              </span>
              <span v-if="a.lifestyle.is_using_drugs" class="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium ring-1 ring-red-200">
                💊 Drug Use
              </span>
              <span v-if="!a.lifestyle.is_smoking && !a.lifestyle.is_drinking_alcohol && !a.lifestyle.is_using_drugs" class="text-blueberry-400 italic text-sm">
                No current habits reported
              </span>
            </div>
          </div>
          <div class="mb-4">
            <p class="text-xs text-blueberry-400 uppercase tracking-wider mb-2">Past Habits</p>
            <div class="flex flex-wrap gap-2">
              <span v-if="a.lifestyle.was_smoking" class="px-3 py-1 bg-appleCore-50 text-blueberry-700 rounded-full text-xs font-medium">Was smoking</span>
              <span v-if="a.lifestyle.was_drinking_alcohol" class="px-3 py-1 bg-appleCore-50 text-blueberry-700 rounded-full text-xs font-medium">Was drinking</span>
              <span v-if="a.lifestyle.was_using_drugs" class="px-3 py-1 bg-appleCore-50 text-blueberry-700 rounded-full text-xs font-medium">Was using drugs</span>
              <span v-if="!a.lifestyle.was_smoking && !a.lifestyle.was_drinking_alcohol && !a.lifestyle.was_using_drugs" class="text-blueberry-400 italic text-sm">None</span>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-appleCore-50/50 rounded-lg p-3">
              <div class="flex items-center gap-2 mb-1">
                <i :class="a.lifestyle.has_medical_condition ? 'pi pi-exclamation-triangle text-red-500' : 'pi pi-check-circle text-green-500'" class="text-sm" />
                <span class="text-xs font-semibold text-blueberry-700 uppercase tracking-wider">Medical Condition</span>
              </div>
              <p class="text-sm text-blueberry-800">{{ a.lifestyle.has_medical_condition ? (a.lifestyle.medical_notes || 'Yes (no notes)') : 'None' }}</p>
            </div>
            <div class="bg-appleCore-50/50 rounded-lg p-3">
              <div class="flex items-center gap-2 mb-1">
                <i :class="a.lifestyle.has_allergies ? 'pi pi-exclamation-triangle text-yellow-500' : 'pi pi-check-circle text-green-500'" class="text-sm" />
                <span class="text-xs font-semibold text-blueberry-700 uppercase tracking-wider">Allergies</span>
              </div>
              <p class="text-sm text-blueberry-800">{{ a.lifestyle.has_allergies ? (a.lifestyle.allergies_notes || 'Yes (no notes)') : 'None' }}</p>
            </div>
          </div>
        </template>
        <p v-else class="text-blueberry-400 italic text-sm">No lifestyle information recorded</p>
      </section>

      <!-- ─── Education ─────────────────────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-book text-apricot-500" />
          Education
          <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">({{ a.educations?.length ?? 0 }})</span>
        </h3>
        <div v-if="a.educations && a.educations.length > 0" class="space-y-3">
          <div v-for="edu in a.educations" :key="edu.id" class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors">
            <p class="font-semibold text-blueberry-800">{{ edu.school_name }}</p>
            <p class="text-sm text-blueberry-600 mt-0.5">
              {{ capitalize(edu.education_level) }}
              <span v-if="edu.course"> · {{ edu.course }}</span>
            </p>
            <div class="flex flex-wrap items-center gap-2 mt-2 text-xs text-blueberry-500">
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">{{ capitalize(edu.education_status) }}</span>
              <span v-if="edu.year_started || edu.year_ended">
                <i class="pi pi-calendar text-[10px] mr-1" />
                {{ edu.year_started ?? '?' }} — {{ edu.year_ended ?? 'Present' }}
              </span>
              <span v-if="edu.honors" class="text-yellow-600 font-medium">🏆 {{ edu.honors }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-blueberry-400 italic text-sm">No education records</p>
      </section>

      <!-- ─── Employment ────────────────────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-briefcase text-apricot-500" />
          Employment History
          <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">({{ a.employments?.length ?? 0 }})</span>
        </h3>
        <div v-if="a.employments && a.employments.length > 0" class="space-y-3">
          <div v-for="emp in a.employments" :key="emp.id" class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors">
            <div class="flex items-center gap-2">
              <p class="font-semibold text-blueberry-800">{{ emp.position }}</p>
              <span v-if="emp.is_current" class="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium ring-1 ring-green-200">Current</span>
            </div>
            <p class="text-sm text-blueberry-600 mt-0.5">
              {{ emp.company_name }}
              <span v-if="emp.industry" class="text-blueberry-400"> · {{ emp.industry }}</span>
            </p>
            <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-blueberry-500">
              <span>
                <i class="pi pi-calendar text-[10px] mr-1" />
                {{ formatDate(emp.date_started) }} — {{ emp.date_ended ? formatDate(emp.date_ended) : 'Present' }}
              </span>
              <span v-if="emp.city || emp.country">
                <i class="pi pi-map-marker text-[10px] mr-1" />
                {{ [emp.city, emp.country].filter(Boolean).join(', ') }}
              </span>
              <span v-if="emp.salary">
                <i class="pi pi-money-bill text-[10px] mr-1" />
                {{ emp.salary_currency }} {{ emp.salary.toLocaleString() }}
              </span>
            </div>
            <p v-if="emp.job_description" class="text-sm text-blueberry-600 mt-2 leading-relaxed">{{ emp.job_description }}</p>
            <p v-if="emp.reason_for_leaving" class="text-xs text-blueberry-500 mt-2 italic">Reason for leaving: {{ emp.reason_for_leaving }}</p>
          </div>
        </div>
        <p v-else class="text-blueberry-400 italic text-sm">No employment history</p>
      </section>

      <!-- ─── Tattoos ───────────────────────────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-palette text-apricot-500" />
          Tattoo Records
          <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">({{ a.tattoos?.length ?? 0 }})</span>
        </h3>
        <div v-if="a.tattoos && a.tattoos.length > 0" class="space-y-3">
          <div v-for="tattoo in a.tattoos" :key="tattoo.id" class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors">
            <p class="font-semibold text-blueberry-800">{{ tattoo.location }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-1 text-xs text-blueberry-500">
              <span v-if="tattoo.size" class="capitalize">
                <i class="pi pi-info-circle text-[10px] mr-1" />
                {{ tattoo.size }}
              </span>
              <span :class="tattoo.is_visible ? 'text-red-600' : 'text-green-600'">
                <i :class="tattoo.is_visible ? 'pi pi-eye' : 'pi pi-eye-slash'" class="text-[10px] mr-1" />
                {{ tattoo.is_visible ? 'Visible' : 'Hidden' }}
              </span>
            </div>
            <p v-if="tattoo.description" class="text-sm text-blueberry-600 mt-2">{{ tattoo.description }}</p>
          </div>
        </div>
        <p v-else class="text-blueberry-400 italic text-sm">No tattoo records</p>
      </section>

      <!-- ─── Batch Assignments ─────────────────────────────────────────────── -->
      <section
        v-if="a.applicant_batches && a.applicant_batches.length > 0"
        class="bg-white rounded-2xl border border-appleCore-100 p-6"
      >
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-users text-apricot-500" />
          Batch Assignments
          <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">({{ a.applicant_batches.length }})</span>
        </h3>
        <div class="space-y-3">
          <div
            v-for="ab in a.applicant_batches"
            :key="ab.id"
            class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors"
          >
            <div class="flex items-center gap-2 flex-wrap mb-2">
              <span class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded">
                Batch #{{ ab.batch?.batch_number ?? ab.batch_id }}
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset"
                :class="batchStatusColor(ab.status)"
              >
                {{ capitalize(ab.status) }}
              </span>
            </div>

            <p class="font-semibold text-blueberry-800">{{ ab.batch?.name ?? '—' }}</p>
            <p v-if="ab.batch?.country" class="text-sm text-blueberry-500 mt-0.5">
              <i class="pi pi-globe text-xs mr-1" />
              {{ ab.batch.country }}
            </p>

            <div class="flex flex-wrap gap-3 mt-2 text-xs text-blueberry-500">
              <span v-if="ab.assigned_at"><i class="pi pi-calendar text-[10px] mr-1" />Assigned: {{ formatDateTime(ab.assigned_at) }}</span>
              <span v-if="ab.interview_date"><i class="pi pi-comments text-[10px] mr-1" />Interview: {{ formatDate(ab.interview_date) }}</span>
              <span v-if="ab.medical_date"><i class="pi pi-heart text-[10px] mr-1" />Medical: {{ formatDate(ab.medical_date) }}</span>
              <span v-if="ab.exam_date"><i class="pi pi-book text-[10px] mr-1" />Exam: {{ formatDate(ab.exam_date) }}</span>
              <span v-if="ab.accepted_at"><i class="pi pi-check-circle text-[10px] mr-1" />Accepted: {{ formatDateTime(ab.accepted_at) }}</span>
              <span v-if="ab.deployed_at"><i class="pi pi-send text-[10px] mr-1" />Deployed: {{ formatDateTime(ab.deployed_at) }}</span>
            </div>

            <div v-if="ab.exam_score" class="mt-2 text-sm">
              <span class="text-blueberry-500">Exam Score:</span>
              <span class="font-semibold text-blueberry-800 ml-1">{{ ab.exam_score }}%</span>
            </div>

            <p v-if="ab.interview_notes" class="text-sm text-blueberry-600 mt-2 italic"><strong>Interview notes:</strong> {{ ab.interview_notes }}</p>
            <p v-if="ab.medical_notes"   class="text-sm text-blueberry-600 mt-1 italic"><strong>Medical notes:</strong> {{ ab.medical_notes }}</p>
            <p v-if="ab.remarks"         class="text-sm text-blueberry-600 mt-1 italic"><strong>Remarks:</strong> {{ ab.remarks }}</p>
            <p v-if="ab.rejection_reason" class="text-sm text-red-600 mt-2"><strong>Rejection reason:</strong> {{ ab.rejection_reason }}</p>
            <p v-if="ab.processed_by"    class="text-xs text-blueberry-400 mt-2">Processed by: {{ ab.processed_by?.full_name }}</p>
          </div>
        </div>
      </section>

      <section
        v-else-if="a.status !== 'final_list'"
        class="bg-appleCore-50 rounded-2xl border border-dashed border-appleCore-200 p-6 text-center"
      >
        <i class="pi pi-info-circle text-blueberry-400 text-2xl mb-2" />
        <p class="text-sm text-blueberry-500">
          This applicant has not been assigned to a batch yet.
          <span v-if="a.status !== 'rejected'">
            Move the applicant to <strong>Final List</strong> to enable batch assignment.
          </span>
        </p>
      </section>

      <!-- 🚀 Deployment History -->
      <DeploymentHistorySection :deployments="applicantDeployments" />

    </template>
  </div>
</template>