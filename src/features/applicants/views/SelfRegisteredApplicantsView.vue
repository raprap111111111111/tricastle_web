<script setup lang="ts">
import { onMounted, onActivated, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

// PrimeVue Components
import Button from 'primevue/button'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// Shared UI & Store
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useApplicantStore } from '../stores/applicant.store'
import { usePubNub } from '@shared/pubnub/usePubNub'
import { PubNubChannels } from '@shared/pubnub/channels'
import type { Applicant } from '../types'

// 📊 Excel Export
import {
  ALL_COLUMNS,
  DEFAULT_COLUMN_KEYS,
  exportApplicantList,
} from '@shared/utils/excel-export'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const store = useApplicantStore()

// ─── Search & Year Filters ────────────────────────────
const searchQuery = ref('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const currentYear = new Date().getFullYear()
const selectedYear = ref<number | null>(currentYear)
const yearOptions = [
  { label: 'All Years', value: null },
  { label: String(currentYear), value: currentYear },
  { label: String(currentYear - 1), value: currentYear - 1 },
  { label: String(currentYear - 2), value: currentYear - 2 },
]

// ─── Load Self-Registered Queue ───────────────────────
async function loadSelfRegistered() {
  store.setFilters({
    search: searchQuery.value.trim(),
    status: 'self_registered',
    gender: '',
    civil_status: '',
    nationality: '',
    quality_grade: '',
    assigned_staff_id: null,
    year: selectedYear.value ?? undefined,
    offset: 0,
    limit: 10,
  } as any)

  await store.fetchApplicants()
}

function onSearchInput() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    store.setPage(1)
    loadSelfRegistered()
  }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  loadSelfRegistered()
}

function onYearChange() {
  store.setPage(1)
  loadSelfRegistered()
}

onMounted(loadSelfRegistered)
onActivated(loadSelfRegistered)

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/applicants/self-registered') loadSelfRegistered()
  },
)

// ─── 📡 PubNub Real-time Updates ──────────────────────
usePubNub([PubNubChannels.APPLICANTS], (msg) => {
  switch (msg.event) {
    case 'applicant.status_changed':
    case 'applicant.created':
    case 'applicant.deleted':
      loadSelfRegistered()
      break
  }
})

// ─── Stats ────────────────────────────────────────────
const totalCount = computed(() => store.pagination?.total ?? store.applicants.length)
const skilledCount = computed(
  () => store.applicants.filter((a) => (a as any).skill_category === 'skilled').length,
)
const readyDeployCount = computed(
  () => store.applicants.filter((a) => (a as any).willing_to_be_deployed).length,
)
const japanExpCount = computed(
  () => store.applicants.filter((a) => (a as any).previous_japan_experience).length,
)

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 PROFILE REVIEW MODAL (Same logic as Profile Updates)
// ═══════════════════════════════════════════════════════════════════════════

const showReviewDialog = ref(false)
const selectedApplicant = ref<Applicant | null>(null)
const activeTab = ref<'personal' | 'passport' | 'deployment' | 'family'>('personal')

const isProcessing = ref(false)
const showRejectPrompt = ref(false)
const rejectionReason = ref('')

function openReviewModal(applicant: Applicant) {
  selectedApplicant.value = applicant
  activeTab.value = 'personal'
  showRejectPrompt.value = false
  rejectionReason.value = ''
  showReviewDialog.value = true
}

function closeReviewModal() {
  showReviewDialog.value = false
  selectedApplicant.value = null
  showRejectPrompt.value = false
  rejectionReason.value = ''
}

// ─── Approve Action (Approve submission -> Status = Pending & Portal Active)
async function handleApproveApplicant(applicant?: Applicant) {
  const target = applicant ?? selectedApplicant.value
  if (!target) return

  isProcessing.value = true
  try {
    await store.acceptSelfRegistered(target.id)

    toast.add({
      severity: 'success',
      summary: 'Applicant Approved',
      detail: `${target.first_name} ${target.last_name} (${target.applicant_code}) is now in Pending status. Portal login enabled.`,
      life: 5000,
    })

    closeReviewModal()
    await loadSelfRegistered()
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Approval Failed',
      detail: err?.response?.data?.message || 'Could not approve applicant',
      life: 4000,
    })
  } finally {
    isProcessing.value = false
  }
}

// ─── Reject Action (Reject submission with reason)
async function handleRejectApplicant() {
  if (!selectedApplicant.value || !rejectionReason.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Rejection Reason Required',
      detail: 'Please provide a brief reason for rejecting this registration.',
      life: 3000,
    })
    return
  }

  isProcessing.value = true
  const target = selectedApplicant.value

  try {
    await store.rejectApplicant(target.id, rejectionReason.value.trim())

    toast.add({
      severity: 'info',
      summary: 'Applicant Rejected',
      detail: `${target.first_name} ${target.last_name} has been marked as rejected.`,
      life: 4000,
    })

    closeReviewModal()
    await loadSelfRegistered()
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Rejection Failed',
      detail: err?.response?.data?.message || 'Could not reject applicant',
      life: 4000,
    })
  } finally {
    isProcessing.value = false
  }
}

// ─── 🔲 Bulk Selection & Approval ─────────────────────
const selectedRows = ref<Applicant[]>([])
const bulkSubmitting = ref(false)
const hasSelection = computed(() => selectedRows.value.length > 0)

function clearSelection() {
  selectedRows.value = []
}

async function handleBulkApprove() {
  if (!hasSelection.value) return

  const ids = selectedRows.value.map((a) => a.id)
  confirm.require({
    header: 'Bulk Approve Applicants',
    message: `Approve and activate portal accounts for ${ids.length} selected applicant(s)?`,
    icon: 'pi pi-users text-emerald-600',
    acceptLabel: `Approve ${ids.length} Applicant(s)`,
    rejectLabel: 'Cancel',
    acceptClass: '!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700 !text-white !font-bold !text-xs',
    rejectClass: '!text-slate-600 !border-none !text-xs',
    accept: async () => {
      bulkSubmitting.value = true
      try {
        const count = await store.bulkAcceptSelfRegistered(ids)
        toast.add({
          severity: 'success',
          summary: 'Bulk Approval Complete',
          detail: `${count} applicant(s) approved and moved to Pending.`,
          life: 4000,
        })
        selectedRows.value = []
        loadSelfRegistered()
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Bulk Approval Failed',
          detail: e?.response?.data?.message ?? 'Some applicants could not be approved.',
          life: 4000,
        })
      } finally {
        bulkSubmitting.value = false
      }
    },
  })
}

// ─── Helpers ──────────────────────────────────────────
function getInitials(first = '', last = ''): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'AP'
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ═══════════════════════════════════════════════════════
// 📊 EXCEL EXPORT
// ═══════════════════════════════════════════════════════
const showExportDialog = ref(false)
const exporting = ref(false)
const selectedColumnKeys = ref<string[]>([...DEFAULT_COLUMN_KEYS])

function openExportDialog() {
  selectedColumnKeys.value = [...DEFAULT_COLUMN_KEYS]
  showExportDialog.value = true
}

function closeExportDialog() {
  showExportDialog.value = false
}

async function handleDownload(): Promise<void> {
  if (store.applicants.length === 0) return
  exporting.value = true
  try {
    exportApplicantList(
      store.applicants,
      'self_registered_applicants',
      'Self-Registered Review Queue',
      selectedColumnKeys.value,
    )
    toast.add({
      severity: 'success',
      summary: 'Exported',
      detail: `${store.applicants.length} applicants exported to Excel.`,
      life: 3000,
    })
    closeExportDialog()
  } catch (err) {
    console.error('[Export]', err)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex items-start justify-between gap-6 flex-wrap">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight flex items-center gap-2.5">
            <i class="pi pi-qrcode text-purple-600 text-2xl" />
            Self-Registered Applicants
          </h1>
          <span
            class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium ring-1 ring-purple-200"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            Pending Staff Approval
          </span>
        </div>
        <p class="text-sm text-blueberry-500">
          Review new applicants registered via QR code or direct link, inspect their information, and approve them into the pipeline
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-appleCore-200/80 shadow-sm">
          <span class="text-xs font-bold text-blueberry-700">Year:</span>
          <Select
            v-model="selectedYear"
            :options="yearOptions"
            option-label="label"
            option-value="value"
            placeholder="Year"
            class="!border-none !text-xs !p-0 !bg-transparent focus:!ring-0"
            size="small"
            @change="onYearChange"
          />
        </div>

        <AppButton
          label="Export Excel"
          icon="pi pi-file-excel"
          variant="neutral"
          outlined
          :disabled="store.applicants.length === 0"
          @click="openExportDialog"
        />

        <AppButton
          label="In-Progress List"
          icon="pi pi-users"
          variant="neutral"
          outlined
          class="!text-blueberry-700 !border-blueberry-200 hover:!bg-blueberry-50"
          @click="router.push('/applicants')"
        />

        <AppButton
          label="New Staff Applicant"
          icon="pi pi-plus"
          variant="accent"
          @click="router.push({ name: 'applicants.create' })"
        />
      </div>
    </header>

    <!-- ─── Banner ─────────────────────────────────── -->
    <div class="flex items-center gap-3 px-4 py-3 bg-purple-50/80 border border-purple-200 rounded-xl text-xs text-purple-900 shadow-sm">
      <i class="pi pi-info-circle text-purple-600 text-base shrink-0" />
      <span>
        When an applicant submits their details via QR registration, search their name below and click <strong>Review & Approve</strong> to inspect their profile. Once approved, their status becomes <strong>Pending</strong> and their <strong>Applicant Portal Account</strong> is activated.
      </span>
    </div>

    <!-- ─── Stats Cards ───────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Pending Approval" :value="totalCount" icon="pi pi-qrcode" variant="blueberry" />
      <AppStatCard label="Skilled Candidates" :value="skilledCount" icon="pi pi-wrench" variant="apricot" />
      <AppStatCard label="Deployment Ready" :value="readyDeployCount" icon="pi pi-send" variant="citrus" />
      <AppStatCard label="Japan Experience" :value="japanExpCount" icon="pi pi-globe" variant="green" />
    </div>

    <!-- ─── Search Bar ────────────────────────────── -->
    <div class="bg-white p-3.5 rounded-2xl border border-appleCore-200 shadow-sm flex items-center gap-3">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-blueberry-400 text-sm" />
        <InputText
          v-model="searchQuery"
          placeholder="Search applicant name (e.g. Ralph Barioga), email, or applicant code (TC-2026-00011)..."
          class="w-full !pl-10 !pr-10 !py-2.5 !text-sm !rounded-xl !border-appleCore-200 focus:!border-purple-500 focus:!ring-purple-200"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-blueberry-400 hover:text-blueberry-700"
          @click="clearSearch"
        >
          <i class="pi pi-times-circle text-sm" />
        </button>
      </div>

      <AppButton
        label="Search"
        icon="pi pi-search"
        variant="accent"
        class="!bg-purple-600 hover:!bg-purple-700 !border-purple-600 !rounded-xl !px-5"
        @click="loadSelfRegistered"
      />
    </div>

    <!-- ─── Bulk Action Bar ────────────────────────── -->
    <Transition name="slide-down">
      <div
        v-if="hasSelection"
        class="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl"
      >
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold">
            {{ selectedRows.length }}
          </span>
          <span class="text-sm font-medium text-emerald-900">
            applicant{{ selectedRows.length !== 1 ? 's' : '' }} selected
          </span>
        </div>

        <div class="flex items-center gap-2">
          <AppButton
            label="Approve Selected & Activate Accounts"
            icon="pi pi-check-circle"
            variant="accent"
            :loading="bulkSubmitting"
            class="!bg-emerald-600 !border-emerald-600 hover:!bg-emerald-700"
            @click="handleBulkApprove"
          />
          <Button label="Clear" text size="small" severity="secondary" @click="clearSelection" />
        </div>
      </div>
    </Transition>

    <!-- ─── Queue Table ────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <DataTable
        v-model:selection="selectedRows"
        :value="store.applicants"
        :loading="store.loading"
        data-key="id"
        class="p-datatable-sm"
        :row-hover="true"
        responsive-layout="scroll"
      >
        <template #empty>
          <div class="p-12 text-center text-blueberry-400 flex flex-col items-center justify-center gap-2">
            <i class="pi pi-users text-4xl text-appleCore-300" />
            <p class="text-base font-semibold text-blueberry-700">No self-registered applicants pending approval</p>
            <p class="text-xs text-blueberry-400">
              {{ searchQuery ? `No matches found for "${searchQuery}".` : 'New QR code registrations will appear here automatically.' }}
            </p>
          </div>
        </template>

        <Column selection-mode="multiple" header-style="width: 3rem" />

        <!-- Code Column -->
        <Column header="Code" field="applicant_code">
          <template #body="{ data }">
            <span class="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              {{ data.applicant_code }}
            </span>
          </template>
        </Column>

        <!-- Applicant Info -->
        <Column header="Applicant">
          <template #body="{ data }">
            <div class="flex items-center gap-3 py-1">
              <div class="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
                {{ getInitials(data.first_name, data.last_name) }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-semibold text-blueberry-900 hover:text-purple-600 cursor-pointer" @click="openReviewModal(data)">
                  {{ data.full_name || `${data.first_name} ${data.last_name}` }}
                </span>
                <span class="text-xs text-blueberry-400 truncate">{{ data.email }}</span>
                <span v-if="data.mobile || data.phone" class="text-[11px] text-blueberry-500 font-mono">
                  {{ data.mobile || data.phone }}
                </span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Applied Position -->
        <Column header="Position / Trade">
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="text-xs font-medium text-blueberry-800">
                {{ data.applied_position || data.trade_or_occupation || 'General Applicant' }}
              </span>
              <span v-if="data.skill_category" class="text-[10px] text-blueberry-400 capitalize">
                {{ data.skill_category }}
              </span>
            </div>
          </template>
        </Column>

        <!-- Address -->
        <Column header="Location">
          <template #body="{ data }">
            <div class="flex flex-col max-w-[200px] text-xs text-blueberry-600">
              <span class="truncate">{{ data.current_address || data.permanent_address || '—' }}</span>
              <span class="text-[11px] text-blueberry-400">{{ [data.city, data.province].filter(Boolean).join(', ') }}</span>
            </div>
          </template>
        </Column>

        <!-- Registered Date -->
        <Column header="Registered">
          <template #body="{ data }">
            <span class="text-xs text-blueberry-500 font-mono">
              {{ formatDate(data.created_at) }}
            </span>
          </template>
        </Column>

        <!-- Status Pill -->
        <Column header="Status">
          <template #body="{ data }">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-500" />
              {{ data.status }}
            </span>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" align-frozen="right" :frozen="true">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Button
                label="Review & Approve"
                icon="pi pi-id-card"
                size="small"
                class="!bg-purple-600 hover:!bg-purple-700 !border-purple-600 !text-white !font-bold !text-xs !py-1.5 !px-3 !rounded-lg shadow-sm whitespace-nowrap"
                @click="openReviewModal(data)"
              />
              <Button
                icon="pi pi-check"
                text
                rounded
                severity="success"
                v-tooltip.top="'Quick Approve'"
                @click="handleApproveApplicant(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Pagination Footer -->
      <div
        v-if="store.pagination"
        class="flex items-center justify-between px-6 py-4 border-t border-appleCore-200 text-xs text-blueberry-600"
      >
        <span>
          Showing <strong>{{ store.applicants.length }}</strong> of <strong>{{ store.pagination.total }}</strong> self-registered entries
        </span>
        <div class="flex items-center gap-2">
          <Button
            label="Previous"
            icon="pi pi-chevron-left"
            text
            size="small"
            :disabled="store.pagination.current_page <= 1"
            @click="store.setPage(store.pagination.current_page - 1); loadSelfRegistered()"
          />
          <span class="font-bold text-blueberry-800">
            Page {{ store.pagination.current_page }} of {{ store.pagination.last_page }}
          </span>
          <Button
            label="Next"
            icon="pi pi-chevron-right"
            icon-pos="right"
            text
            size="small"
            :disabled="store.pagination.current_page >= store.pagination.last_page"
            @click="store.setPage(store.pagination.current_page + 1); loadSelfRegistered()"
          />
        </div>
      </div>
    </AppCard>

    <!-- ═══════════════════════════════════════════════════
         🔍 PROFILE REVIEW DIALOG (Profile Update Logic)
    ════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showReviewDialog"
      modal
      :draggable="false"
      :style="{ width: '740px' }"
      :closable="!isProcessing"
      :pt="{
        root: { class: 'rounded-2xl overflow-hidden' },
        header: { class: '!p-0' },
        content: { class: '!p-0' },
      }"
    >
      <template #container>
        <div v-if="selectedApplicant" class="bg-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Dialog Header -->
          <div class="flex items-center justify-between p-6 border-b border-appleCore-100 bg-purple-50/50">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center border border-purple-200">
                {{ getInitials(selectedApplicant.first_name, selectedApplicant.last_name) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-blueberry-900">
                    {{ selectedApplicant.full_name || `${selectedApplicant.first_name} ${selectedApplicant.last_name}` }}
                  </h3>
                  <span class="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    {{ selectedApplicant.applicant_code }}
                  </span>
                </div>
                <p class="text-xs text-blueberry-500">Submitted on {{ formatDate(selectedApplicant.created_at) }} • Status: <strong class="text-purple-700">Self-Registered</strong></p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
              @click="closeReviewModal"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>

          <!-- Section Navigation Tabs -->
          <div class="flex border-b border-appleCore-100 bg-white px-6">
            <button
              v-for="tab in [
                { key: 'personal', label: 'Personal & Contact', icon: 'pi-user' },
                { key: 'passport', label: 'Passport & IDs', icon: 'pi-id-card' },
                { key: 'deployment', label: 'Skills & Readiness', icon: 'pi-briefcase' },
                { key: 'family', label: 'Family & Emergency', icon: 'pi-users' },
              ]"
              :key="tab.key"
              type="button"
              class="flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-bold transition-all"
              :class="activeTab === tab.key ? 'border-purple-600 text-purple-700 bg-purple-50/50' : 'border-transparent text-blueberry-500 hover:text-blueberry-800'"
              @click="activeTab = tab.key as any"
            >
              <i :class="`pi ${tab.icon} text-xs`" />
              {{ tab.label }}
            </button>
          </div>

          <!-- Dialog Body Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <!-- TAB 1: Personal & Contact -->
            <div v-if="activeTab === 'personal'" class="grid grid-cols-2 gap-4 text-xs">
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Full Name</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.first_name }} {{ selectedApplicant.middle_name ? selectedApplicant.middle_name + ' ' : '' }}{{ selectedApplicant.last_name }} {{ selectedApplicant.suffix || '' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Email</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.email }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Phone / Mobile</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.mobile || selectedApplicant.phone || '—' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Birthdate & Age</span>
                <span class="font-semibold text-blueberry-900">{{ formatDate(selectedApplicant.date_of_birth) }} {{ selectedApplicant.age ? `(${selectedApplicant.age} y/o)` : '' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Gender / Civil Status</span>
                <span class="font-semibold text-blueberry-900 capitalize">{{ selectedApplicant.gender || '—' }} / {{ selectedApplicant.civil_status || '—' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Nationality / Religion</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.nationality || 'Filipino' }} / {{ selectedApplicant.religion || '—' }}</span>
              </div>
              <div class="col-span-2 p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Current Address</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.current_address || '—' }} ({{ [selectedApplicant.city, selectedApplicant.province].filter(Boolean).join(', ') }})</span>
              </div>
            </div>

            <!-- TAB 2: Passport & IDs -->
            <div v-else-if="activeTab === 'passport'" class="grid grid-cols-2 gap-4 text-xs">
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Passport Number</span>
                <span class="font-semibold text-blueberry-900 font-mono">{{ selectedApplicant.passport_number || 'No Passport Provided' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Passport Expiry</span>
                <span class="font-semibold text-blueberry-900">{{ formatDate(selectedApplicant.passport_expiry) }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">SSS Number</span>
                <span class="font-semibold text-blueberry-900 font-mono">{{ selectedApplicant.sss_number || '—' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">PhilHealth Number</span>
                <span class="font-semibold text-blueberry-900 font-mono">{{ selectedApplicant.philhealth_number || '—' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Pag-IBIG Number</span>
                <span class="font-semibold text-blueberry-900 font-mono">{{ selectedApplicant.pagibig_number || '—' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">TIN Number</span>
                <span class="font-semibold text-blueberry-900 font-mono">{{ selectedApplicant.tin_number || '—' }}</span>
              </div>
            </div>

            <!-- TAB 3: Skills & Readiness -->
            <div v-else-if="activeTab === 'deployment'" class="grid grid-cols-2 gap-4 text-xs">
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Applied Position / Trade</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.applied_position || selectedApplicant.trade_or_occupation || 'General Worker' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Skill Category</span>
                <span class="font-semibold text-blueberry-900 capitalize">{{ selectedApplicant.skill_category || 'Unspecified' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Willing To Be Deployed</span>
                <span class="font-semibold" :class="selectedApplicant.deployment?.willing_to_be_deployed ? 'text-emerald-700' : 'text-slate-600'">
                  {{ selectedApplicant.deployment?.willing_to_be_deployed ? 'Yes (Ready)' : 'No' }}
                </span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Previous Japan Experience</span>
                <span class="font-semibold text-blueberry-900">
                  {{ selectedApplicant.deployment?.previous_japan_experience ? `Yes (${selectedApplicant.deployment?.years_japan_experience ?? 0} yrs)` : 'None' }}
                </span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">TITP Certificate / SSW Eligible</span>
                <span class="font-semibold text-blueberry-900">
                  TITP: {{ selectedApplicant.deployment?.has_titp_certificate ? 'Yes' : 'No' }} | SSW: {{ selectedApplicant.deployment?.ssw_eligible ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">JLPT Level / English %</span>
                <span class="font-semibold text-blueberry-900">
                  JLPT: {{ selectedApplicant.language?.jlpt_level || 'None' }} | English: {{ selectedApplicant.english_proficiency_pct ?? '—' }}%
                </span>
              </div>
            </div>

            <!-- TAB 4: Family & Emergency -->
            <div v-else-if="activeTab === 'family'" class="grid grid-cols-2 gap-4 text-xs">
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Father's Name & Contact</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.family?.father?.name || '—' }} ({{ selectedApplicant.family?.father?.contact || 'No contact' }})</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Mother's Name & Contact</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.family?.mother?.name || '—' }} ({{ selectedApplicant.family?.mother?.contact || 'No contact' }})</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Spouse Name</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.family?.spouse?.name || '—' }}</span>
              </div>
              <div class="p-3 bg-appleCore-50/60 rounded-xl">
                <span class="text-blueberry-400 block text-[10px] uppercase font-bold tracking-wider">Emergency Contact Person</span>
                <span class="font-semibold text-blueberry-900">{{ selectedApplicant.family?.emergency_contact?.name || '—' }} ({{ selectedApplicant.family?.emergency_contact?.relationship || '—' }})</span>
              </div>
            </div>

            <!-- Rejection Prompt Accordion -->
            <div v-if="showRejectPrompt" class="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2.5">
              <span class="text-xs font-bold text-red-900 block">Reason for Rejection</span>
              <Textarea
                v-model="rejectionReason"
                rows="2"
                placeholder="Specify why this applicant cannot be approved (e.g. Incomplete details, underaged, duplicate entry)..."
                class="w-full !text-xs !p-2 !rounded-lg"
              />
              <div class="flex justify-end gap-2">
                <Button label="Cancel" text size="small" severity="secondary" @click="showRejectPrompt = false" />
                <Button
                  label="Confirm Rejection"
                  icon="pi pi-times"
                  size="small"
                  class="!bg-red-600 hover:!bg-red-700 !border-red-600 !text-white !font-bold !text-xs"
                  :loading="isProcessing"
                  @click="handleRejectApplicant"
                />
              </div>
            </div>
          </div>

          <!-- Dialog Footer Actions (Approve / Reject) -->
          <div class="flex items-center justify-between p-5 border-t border-appleCore-100 bg-appleCore-50/50 shrink-0">
            <Button
              v-if="!showRejectPrompt"
              label="Reject Application"
              icon="pi pi-times"
              severity="danger"
              text
              size="small"
              :disabled="isProcessing"
              @click="showRejectPrompt = true"
            />
            <div v-else />

            <div class="flex items-center gap-2">
              <Button
                label="Cancel"
                severity="secondary"
                text
                size="small"
                :disabled="isProcessing"
                @click="closeReviewModal"
              />
              <Button
                label="Approve Applicant"
                icon="pi pi-check"
                :loading="isProcessing"
                class="!bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 !text-white !font-bold !text-xs !px-5 !py-2.5 !rounded-xl shadow-md"
                @click="handleApproveApplicant()"
              />
            </div>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- ═══════════════════════════════════════════════════
         📊 EXCEL EXPORT DIALOG
    ════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showExportDialog"
      modal
      :draggable="false"
      :style="{ width: '500px' }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-file-excel text-purple-600 text-xl" />
          <span class="font-bold text-sm text-blueberry-800">Export Self-Registered Queue</span>
        </div>
      </template>
      <div class="p-4 space-y-3">
        <p class="text-xs text-blueberry-600">
          Download the current list of <strong>{{ store.applicants.length }}</strong> self-registered entries into an Excel (.xlsx) spreadsheet.
        </p>
      </div>
      <template #footer>
        <Button label="Cancel" text severity="secondary" size="small" @click="closeExportDialog" />
        <Button
          label="Download Excel"
          icon="pi pi-file-excel"
          :loading="exporting"
          class="!bg-purple-600 hover:!bg-purple-700 !border-purple-600 !text-white !text-xs"
          @click="handleDownload"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>