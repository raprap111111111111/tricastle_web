<!-- src/features/applicants/views/SelfRegisteredView.vue -->
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
  () => store.applicants.filter((a) => (a as any).willing_to_be_deployed || (a as any).deployment?.willing_to_be_deployed).length,
)
const japanExpCount = computed(
  () => store.applicants.filter((a) => (a as any).previous_japan_experience || (a as any).deployment?.previous_japan_experience).length,
)

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 PROFILE REVIEW MODAL
// ═══════════════════════════════════════════════════════════════════════════
const showReviewDialog = ref(false)
const selectedApplicant = ref<any | null>(null)
const activeTab = ref<'all' | 'personal' | 'documents_deployment' | 'family_lifestyle' | 'education_work' | 'tattoos_japan'>('all')

const isProcessing = ref(false)
const showRejectPrompt = ref(false)
const rejectionReason = ref('')

function openReviewModal(applicant: Applicant) {
  selectedApplicant.value = applicant
  activeTab.value = 'all'
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

// ─── Approve Action ───────────────────────────────────
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

// ─── Reject Action ────────────────────────────────────
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

// ─── Review Display Helpers ───────────────────────────
function displayVal(val: any, fallback = '—'): string {
  if (val === null || val === undefined || val === '') return fallback
  return String(val)
}

function displayCurrency(amount: any, currency = 'PHP'): string {
  if (amount === null || amount === undefined || amount === '') return '—'
  return `${currency} ${Number(amount).toLocaleString()}`
}

function displayBool(val: any): string {
  if (val === true || val === 'true' || val === 1 || val === '1') return 'Yes'
  if (val === false || val === 'false' || val === 0 || val === '0') return 'No'
  return '—'
}

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
  <div class="flex flex-col gap-6 p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex items-start justify-between gap-4 flex-wrap pt-2">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2.5 flex-wrap">
          <h1 class="text-2xl sm:text-3xl font-serif font-semibold text-blueberry-800 tracking-tight flex items-center gap-2.5">
            <i class="pi pi-qrcode text-apricot-500 text-2xl" />
            Self-Registered Applicants
          </h1>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-apricot-50 text-apricot-700 rounded-full text-xs font-semibold border border-apricot-200">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-apricot-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-apricot-500" />
            </span>
            Pending Review
          </span>
        </div>
        <p class="text-xs sm:text-sm text-blueberry-500">
          Review applicants registered via public link/QR code, verify their information, and approve them into the pipeline.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-appleCore-200 shadow-xs">
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
    <div class="flex items-center gap-3 px-4 py-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 shadow-xs">
      <i class="pi pi-info-circle text-amber-600 text-base shrink-0" />
      <span>
        When an applicant submits their details via self-registration, search their record below and click <strong>Review & Approve</strong> to inspect their profile. Once approved, their status becomes <strong>Pending</strong> and their <strong>Applicant Portal Account</strong> is activated.
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
    <div class="bg-white p-3 rounded-2xl border border-appleCore-100 shadow-xs flex items-center gap-2.5">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-blueberry-400 text-sm" />
        <InputText
          v-model="searchQuery"
          placeholder="Search applicant name, email, or applicant code (e.g. TC-2026-00015)..."
          class="w-full !pl-10 !pr-10 !py-2 !text-sm !rounded-xl !border-appleCore-200 focus:!border-apricot-500 focus:!ring-apricot-200"
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
        class="!rounded-xl !px-5"
        @click="loadSelfRegistered"
      />
    </div>

    <!-- ─── Bulk Action Bar ────────────────────────── -->
    <Transition name="slide-down">
      <div
        v-if="hasSelection"
        class="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs"
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
              {{ searchQuery ? `No matches found for "${searchQuery}".` : 'New online registrations will appear here automatically.' }}
            </p>
          </div>
        </template>

        <Column selection-mode="multiple" header-style="width: 3rem" />

        <Column header="Code" field="applicant_code" header-style="min-width: 140px;">
          <template #body="{ data }">
            <span class="font-mono text-xs font-bold text-apricot-800 bg-apricot-50 px-2 py-1 rounded-md border border-apricot-200 whitespace-nowrap inline-block">
              {{ data.applicant_code }}
            </span>
          </template>
        </Column>

        <!-- Applicant Info -->
        <Column header="Applicant" header-style="min-width: 220px;">
          <template #body="{ data }">
            <div class="flex items-center gap-3 py-1">
              <div class="w-9 h-9 rounded-full bg-apricot-100 text-apricot-800 font-bold text-xs flex items-center justify-center shrink-0 border border-apricot-200">
                {{ getInitials(data.first_name, data.last_name) }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-semibold text-blueberry-900 hover:text-apricot-600 cursor-pointer truncate" @click="openReviewModal(data)">
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
        <Column header="Position / Trade" header-style="min-width: 150px;">
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
        <Column header="Location" header-style="min-width: 180px;">
          <template #body="{ data }">
            <div class="flex flex-col max-w-[220px] text-xs text-blueberry-600">
              <span class="truncate">{{ data.current_address || data.permanent_address || '—' }}</span>
              <span class="text-[11px] text-blueberry-400 truncate">{{ [data.city, data.province].filter(Boolean).join(', ') }}</span>
            </div>
          </template>
        </Column>

        <!-- Registered Date -->
        <Column header="Registered" header-style="min-width: 110px;">
          <template #body="{ data }">
            <span class="text-xs text-blueberry-500 font-mono">
              {{ formatDate(data.created_at || data.registered_at) }}
            </span>
          </template>
        </Column>

        <!-- Status Pill -->
        <Column header="Status" header-style="min-width: 130px;">
          <template #body="{ data }">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {{ data.status === 'self_registered' ? 'Self-Registered' : data.status }}
            </span>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" align-frozen="right" :frozen="true" header-style="min-width: 180px;">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Button
                label="Review & Approve"
                icon="pi pi-id-card"
                size="small"
                class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white !font-bold !text-xs !py-1.5 !px-3 !rounded-lg shadow-xs whitespace-nowrap"
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
        class="flex items-center justify-between px-6 py-4 border-t border-appleCore-100 text-xs text-blueberry-600"
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
         🔍 COMPLETE AIS REVIEW DIALOG (MATCHING ReviewTab.vue)
        ════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showReviewDialog"
      modal
      :draggable="false"
      :style="{ width: '920px' }"
      :closable="!isProcessing"
      :pt="{
        root: { class: 'rounded-2xl overflow-hidden' },
        header: { class: '!p-0' },
        content: { class: '!p-0' },
      }"
    >
      <template #container>
        <div v-if="selectedApplicant" class="bg-slate-50/50 rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">
          <!-- Dialog Header Banner -->
          <div class="flex items-center justify-between p-5 border-b border-appleCore-100 bg-white">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-xl bg-apricot-100 text-apricot-800 font-bold text-base flex items-center justify-center border border-apricot-200 shadow-xs">
                {{ getInitials(selectedApplicant.first_name, selectedApplicant.last_name) }}
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h3 class="text-base font-bold text-blueberry-900">
                    {{ displayVal(selectedApplicant.first_name) }}
                    {{ selectedApplicant.middle_name ? selectedApplicant.middle_name + ' ' : '' }}
                    {{ displayVal(selectedApplicant.last_name) }}
                    {{ selectedApplicant.suffix ? selectedApplicant.suffix : '' }}
                  </h3>
                  <span class="font-mono text-xs font-bold text-apricot-800 bg-apricot-50 px-2 py-0.5 rounded border border-apricot-200">
                    {{ selectedApplicant.applicant_code }}
                  </span>
                </div>
                <p class="text-xs text-blueberry-500 mt-0.5">
                  Registered: {{ formatDate(selectedApplicant.created_at || selectedApplicant.registered_at) }} • Status: <strong class="text-amber-700">Self-Registered</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500 transition-colors"
              @click="closeReviewModal"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>

          <!-- Section Navigation Tabs -->
          <div class="flex border-b border-appleCore-100 bg-white px-5 overflow-x-auto">
            <button
              v-for="tab in [
                { key: 'all', label: 'All Details', icon: 'pi-list' },
                { key: 'personal', label: 'Personal & Address', icon: 'pi-user' },
                { key: 'documents_deployment', label: 'Docs & Deployment', icon: 'pi-id-card' },
                { key: 'family_lifestyle', label: 'Family & Lifestyle', icon: 'pi-users' },
                { key: 'education_work', label: 'Education & Work', icon: 'pi-briefcase' },
                { key: 'tattoos_japan', label: 'Tattoos & Japan Contacts', icon: 'pi-globe' },
              ]"
              :key="tab.key"
              type="button"
              class="flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all"
              :class="activeTab === tab.key ? 'border-apricot-500 text-apricot-700 bg-apricot-50/30' : 'border-transparent text-blueberry-500 hover:text-blueberry-800'"
              @click="activeTab = tab.key as any"
            >
              <i :class="`pi ${tab.icon} text-xs`" />
              {{ tab.label }}
            </button>
          </div>

          <!-- Dialog Body Content -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5">
            <!-- 1️⃣ Personal Information (Matches ReviewTab) -->
            <section
              v-if="activeTab === 'all' || activeTab === 'personal'"
              class="bg-white rounded-xl border border-appleCore-100 p-5 shadow-xs"
            >
              <div class="flex items-center justify-between mb-3 border-b border-appleCore-100 pb-2.5">
                <h4 class="text-sm font-serif font-semibold text-blueberry-800 flex items-center gap-2">
                  <i class="pi pi-user text-apricot-500" />
                  Personal Information
                </h4>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Name</span>
                  <p class="font-medium text-blueberry-900">
                    {{ displayVal(selectedApplicant.first_name) }}
                    {{ selectedApplicant.middle_name ? selectedApplicant.middle_name + ' ' : '' }}
                    {{ displayVal(selectedApplicant.last_name) }}
                    {{ selectedApplicant.suffix ? selectedApplicant.suffix : '' }}
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Email</span>
                  <p class="font-medium text-blueberry-900 truncate">{{ displayVal(selectedApplicant.email) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Phone</span>
                  <p class="font-medium text-blueberry-900 font-mono">{{ displayVal(selectedApplicant.mobile || selectedApplicant.phone) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Gender</span>
                  <p class="font-medium text-blueberry-900 capitalize">{{ displayVal(selectedApplicant.gender) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Civil Status</span>
                  <p class="font-medium text-blueberry-900 capitalize">{{ displayVal(selectedApplicant.civil_status) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Date of Birth & Age</span>
                  <p class="font-medium text-blueberry-900">
                    {{ formatDate(selectedApplicant.date_of_birth) }}
                    <span v-if="selectedApplicant.age">({{ selectedApplicant.age }} yrs)</span>
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Children</span>
                  <p class="font-medium text-blueberry-900">{{ selectedApplicant.number_of_children ?? 0 }} Child(ren)</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Nationality & Religion</span>
                  <p class="font-medium text-blueberry-900">{{ displayVal(selectedApplicant.nationality, 'Filipino') }} · {{ displayVal(selectedApplicant.religion) }}</p>
                </div>
              </div>
            </section>

            <!-- 2️⃣ Physical & Address (Matches ReviewTab) -->
            <section
              v-if="activeTab === 'all' || activeTab === 'personal'"
              class="bg-white rounded-xl border border-appleCore-100 p-5 shadow-xs"
            >
              <div class="flex items-center justify-between mb-3 border-b border-appleCore-100 pb-2.5">
                <h4 class="text-sm font-serif font-semibold text-blueberry-800 flex items-center gap-2">
                  <i class="pi pi-heart text-apricot-500" />
                  Physical & Address
                </h4>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Height</span>
                  <p class="font-medium text-blueberry-900">{{ selectedApplicant.height_cm ? `${selectedApplicant.height_cm} cm` : '—' }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Weight</span>
                  <p class="font-medium text-blueberry-900">{{ selectedApplicant.weight_kg ? `${selectedApplicant.weight_kg} kg` : '—' }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Blood Type</span>
                  <p class="font-medium text-blueberry-900">Type {{ displayVal(selectedApplicant.blood_type) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Dominant Hand</span>
                  <p class="font-medium text-blueberry-900 capitalize">{{ displayVal(selectedApplicant.dominant_hand, 'Right') }} Hand</p>
                </div>
                <div class="md:col-span-2">
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Current Address</span>
                  <p class="font-medium text-blueberry-900">{{ displayVal(selectedApplicant.current_address) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">City</span>
                  <p class="font-medium text-blueberry-900">{{ displayVal(selectedApplicant.city) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Province</span>
                  <p class="font-medium text-blueberry-900">{{ displayVal(selectedApplicant.province) }}</p>
                </div>
              </div>
            </section>

            <!-- 3️⃣ Documents (Matches ReviewTab) -->
            <section
              v-if="activeTab === 'all' || activeTab === 'documents_deployment'"
              class="bg-white rounded-xl border border-appleCore-100 p-5 shadow-xs"
            >
              <div class="flex items-center justify-between mb-3 border-b border-appleCore-100 pb-2.5">
                <h4 class="text-sm font-serif font-semibold text-blueberry-800 flex items-center gap-2">
                  <i class="pi pi-id-card text-apricot-500" />
                  Documents & Identification
                </h4>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Passport Number</span>
                  <p class="font-medium font-mono text-apricot-700 font-bold">{{ displayVal(selectedApplicant.passport_number) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Passport Expiry</span>
                  <p class="font-medium text-blueberry-900">{{ formatDate(selectedApplicant.passport_expiry) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">DFA Issuing Office</span>
                  <p class="font-medium text-blueberry-900">{{ displayVal(selectedApplicant.passport_office?.name || selectedApplicant.passport_office_id) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">SSS Number</span>
                  <p class="font-medium font-mono text-blueberry-900">{{ displayVal(selectedApplicant.sss_number) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">TIN Number</span>
                  <p class="font-medium font-mono text-blueberry-900">{{ displayVal(selectedApplicant.tin_number) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">PhilHealth Number</span>
                  <p class="font-medium font-mono text-blueberry-900">{{ displayVal(selectedApplicant.philhealth_number) }}</p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Pag-IBIG Number</span>
                  <p class="font-medium font-mono text-blueberry-900">{{ displayVal(selectedApplicant.pagibig_number) }}</p>
                </div>
              </div>
            </section>

            <!-- 4️⃣ Japan Deployment Profile (Matches ReviewTab) -->
            <section
              v-if="activeTab === 'all' || activeTab === 'documents_deployment'"
              class="bg-white rounded-xl border border-appleCore-100 p-5 shadow-xs"
            >
              <div class="flex items-center justify-between mb-3 border-b border-appleCore-100 pb-2.5">
                <h4 class="text-sm font-serif font-semibold text-blueberry-800 flex items-center gap-2">
                  <i class="pi pi-send text-apricot-500" />
                  Japan Deployment Profile
                </h4>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Skill Category</span>
                  <p class="font-medium capitalize text-blueberry-900">
                    {{ displayVal(selectedApplicant.deployment?.skill_category || selectedApplicant.skill_category)?.replace('_', '-') }}
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Occupation / Trade</span>
                  <p class="font-medium text-blueberry-900">
                    {{ displayVal(selectedApplicant.deployment?.trade_or_occupation || selectedApplicant.trade_or_occupation || selectedApplicant.applied_position) }}
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Basic English</span>
                  <p class="font-medium text-blueberry-900">
                    {{ displayBool(selectedApplicant.deployment?.understands_basic_english ?? selectedApplicant.understands_basic_english) }}
                    <span v-if="selectedApplicant.english_proficiency_pct">({{ selectedApplicant.english_proficiency_pct }}%)</span>
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">JLPT Level</span>
                  <p class="font-medium text-blueberry-900 font-mono">
                    {{ displayVal(selectedApplicant.deployment?.jlpt_level || selectedApplicant.language?.jlpt_level, 'None') }}
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Willing to Deploy</span>
                  <p class="font-medium" :class="(selectedApplicant.deployment?.willing_to_be_deployed ?? selectedApplicant.willing_to_be_deployed) ? 'text-emerald-700 font-bold' : 'text-slate-600'">
                    {{ displayBool(selectedApplicant.deployment?.willing_to_be_deployed ?? selectedApplicant.willing_to_be_deployed) }}
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Preferred Location</span>
                  <p class="font-medium text-blueberry-900">
                    {{ displayVal(selectedApplicant.deployment?.preferred_work_location || selectedApplicant.preferred_work_location) }}
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Japan Experience</span>
                  <p class="font-medium text-blueberry-900">
                    {{ displayBool(selectedApplicant.deployment?.previous_japan_experience ?? selectedApplicant.previous_japan_experience) }}
                    <span v-if="selectedApplicant.deployment?.years_japan_experience || selectedApplicant.years_japan_experience">
                      ({{ selectedApplicant.deployment?.years_japan_experience || selectedApplicant.years_japan_experience }} yrs)
                    </span>
                  </p>
                </div>
                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">TITP Certificate</span>
                  <p class="font-medium text-blueberry-900">
                    {{ displayBool(selectedApplicant.deployment?.has_titp_certificate ?? selectedApplicant.has_titp_certificate) }}
                    <span v-if="selectedApplicant.deployment?.titp_occupation || selectedApplicant.titp_occupation">
                      ({{ selectedApplicant.deployment?.titp_occupation || selectedApplicant.titp_occupation }})
                    </span>
                  </p>
                </div>
                <div class="col-span-2">
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Expected Salary</span>
                  <p class="font-medium text-emerald-700">
                    {{ displayCurrency(selectedApplicant.deployment?.expected_salary ?? selectedApplicant.expected_salary, selectedApplicant.deployment?.expected_salary_currency || selectedApplicant.expected_salary_currency || 'JPY') }}
                  </p>
                </div>
                <div class="col-span-2">
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Current Salary</span>
                  <p class="font-medium text-blue-700">
                    {{ displayCurrency(selectedApplicant.deployment?.current_salary ?? selectedApplicant.current_salary, selectedApplicant.deployment?.current_salary_currency || selectedApplicant.current_salary_currency || 'PHP') }}
                  </p>
                </div>
              </div>
            </section>

            <!-- 5️⃣ Family Background (Matches ReviewTab) -->
            <section
              v-if="activeTab === 'all' || activeTab === 'family_lifestyle'"
              class="bg-white rounded-xl border border-appleCore-100 p-5 shadow-xs"
            >
              <div class="flex items-center justify-between mb-3 border-b border-appleCore-100 pb-2.5">
                <h4 class="text-sm font-serif font-semibold text-blueberry-800 flex items-center gap-2">
                  <i class="pi pi-users text-apricot-500" />
                  Family Background
                </h4>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div class="md:col-span-3 bg-appleCore-50/70 p-3 rounded-lg border border-appleCore-100">
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Living Situation & Siblings</span>
                  <p class="font-medium text-blueberry-900">
                    {{ displayVal(selectedApplicant.family?.living_arrangement || selectedApplicant.family?.living_situation || selectedApplicant.living_arrangement || selectedApplicant.living_situation, 'Living with parents') }}
                  </p>
                  <p v-if="selectedApplicant.family?.birth_order" class="text-blueberry-700 mt-1">
                    <strong>Birth Order:</strong> Child #{{ selectedApplicant.family.birth_order }} of {{ selectedApplicant.family.siblings_count ?? '—' }} siblings
                    <span v-if="selectedApplicant.family.siblings_description">({{ selectedApplicant.family.siblings_description }})</span>
                  </p>
                </div>

                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-1 border-b border-appleCore-100 pb-1">Father</span>
                  <p class="font-medium text-blueberry-900">{{ displayVal(selectedApplicant.family?.father?.name || selectedApplicant.family?.father_name) }}</p>
                  <p class="text-[11px] text-blueberry-500">{{ displayVal(selectedApplicant.family?.father?.occupation || selectedApplicant.family?.father_occupation) }}</p>
                  <p class="text-[11px] text-blueberry-600 font-mono mt-0.5">{{ displayVal(selectedApplicant.family?.father?.contact || selectedApplicant.family?.father_contact) }}</p>
                </div>

                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-1 border-b border-appleCore-100 pb-1">Mother</span>
                  <p class="font-medium text-blueberry-900">{{ displayVal(selectedApplicant.family?.mother?.name || selectedApplicant.family?.mother_name) }}</p>
                  <p class="text-[11px] text-blueberry-500">{{ displayVal(selectedApplicant.family?.mother?.occupation || selectedApplicant.family?.mother_occupation) }}</p>
                  <p class="text-[11px] text-blueberry-600 font-mono mt-0.5">{{ displayVal(selectedApplicant.family?.mother?.contact || selectedApplicant.family?.mother_contact) }}</p>
                </div>

                <div>
                  <span class="text-blueberry-500 block text-[10px] uppercase font-bold tracking-wider mb-1 border-b border-appleCore-100 pb-1">Spouse</span>
                  <p class="font-medium text-blueberry-900">{{ displayVal(selectedApplicant.family?.spouse?.name || selectedApplicant.family?.spouse_name, 'None') }}</p>
                  <p class="text-[11px] text-blueberry-500">{{ displayVal(selectedApplicant.family?.spouse?.occupation || selectedApplicant.family?.spouse_occupation) }}</p>
                  <p v-if="selectedApplicant.family?.spouse?.salary || selectedApplicant.family?.spouse_salary" class="text-emerald-700 font-medium text-[11px] mt-0.5">
                    {{ displayCurrency(selectedApplicant.family?.spouse?.salary || selectedApplicant.family?.spouse_salary) }}/mo
                  </p>
                </div>

                <div class="md:col-span-3 mt-1 border-t border-appleCore-100 pt-3">
                  <span class="text-red-700 block text-[10px] uppercase font-bold tracking-wider mb-1">Emergency Contact</span>
                  <p class="font-bold text-blueberry-900">
                    {{ displayVal(selectedApplicant.family?.emergency_contact?.name || selectedApplicant.family?.emergency_contact_name) }}
                    <span class="font-normal text-xs text-blueberry-500 ml-1">
                      ({{ displayVal(selectedApplicant.family?.emergency_contact?.relationship || selectedApplicant.family?.emergency_contact_relationship) }})
                    </span>
                  </p>
                  <p class="font-medium text-red-700 mt-0.5">
                    <i class="pi pi-phone text-xs mr-1" />
                    {{ displayVal(selectedApplicant.family?.emergency_contact?.phone || selectedApplicant.family?.emergency_contact_phone) }}
                  </p>
                  <p class="text-xs text-blueberry-500 mt-0.5">
                    {{ displayVal(selectedApplicant.family?.emergency_contact?.address || selectedApplicant.family?.emergency_contact_address) }}
                  </p>
                </div>
              </div>
            </section>

            <!-- 6️⃣ Lifestyle (Matches ReviewTab) -->
            <section
              v-if="activeTab === 'all' || activeTab === 'family_lifestyle'"
              class="bg-white rounded-xl border border-appleCore-100 p-5 shadow-xs"
            >
              <div class="flex items-center justify-between mb-3 border-b border-appleCore-100 pb-2.5">
                <h4 class="text-sm font-serif font-semibold text-blueberry-800 flex items-center gap-2">
                  <i class="pi pi-shield text-apricot-500" />
                  Lifestyle & Health
                </h4>
              </div>

              <div class="flex flex-wrap gap-2.5 text-xs">
                <span
                  v-if="selectedApplicant.lifestyle?.is_smoking"
                  class="px-3 py-1.5 bg-orange-50 text-orange-800 rounded-lg border border-orange-200 shadow-xs font-medium"
                >
                  🚬 Smoking <span v-if="selectedApplicant.lifestyle.smoking_frequency">({{ selectedApplicant.lifestyle.smoking_frequency }})</span>
                </span>
                <span
                  v-if="selectedApplicant.lifestyle?.is_drinking_alcohol"
                  class="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 shadow-xs font-medium"
                >
                  🍺 Drinking <span v-if="selectedApplicant.lifestyle.drinking_frequency">({{ selectedApplicant.lifestyle.drinking_frequency }})</span>
                </span>
                <span
                  v-if="selectedApplicant.lifestyle?.has_medical_condition"
                  class="px-3 py-1.5 bg-red-50 text-red-800 rounded-lg border border-red-200 shadow-xs font-semibold"
                >
                  🏥 Medical Condition: {{ selectedApplicant.lifestyle.medical_condition_details || 'Yes' }}
                </span>
                <span
                  v-if="selectedApplicant.lifestyle?.has_allergies"
                  class="px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 shadow-xs font-semibold"
                >
                  ⚠️ Allergies: {{ selectedApplicant.lifestyle.allergies_details || 'Yes' }}
                </span>
                <span
                  v-if="!selectedApplicant.lifestyle?.is_smoking && !selectedApplicant.lifestyle?.is_drinking_alcohol && !selectedApplicant.lifestyle?.has_medical_condition && !selectedApplicant.lifestyle?.has_allergies"
                  class="text-blueberry-500 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200"
                >
                  No notable lifestyle habits or medical concerns reported
                </span>
              </div>
            </section>

            <!-- 7️⃣ Education & Work Records -->
            <section
              v-if="activeTab === 'all' || activeTab === 'education_work'"
              class="bg-white rounded-xl border border-appleCore-100 p-5 shadow-xs space-y-4"
            >
              <div class="flex items-center justify-between border-b border-appleCore-100 pb-2.5">
                <h4 class="text-sm font-serif font-semibold text-blueberry-800 flex items-center gap-2">
                  <i class="pi pi-book text-apricot-500" />
                  Education & Work Experience
                </h4>
              </div>

              <!-- Education History -->
              <div>
                <span class="text-blueberry-600 block text-[11px] uppercase font-bold tracking-wider mb-2">Education History ({{ selectedApplicant.educations?.length ?? 0 }})</span>
                <div v-if="selectedApplicant.educations?.length" class="space-y-2">
                  <div
                    v-for="edu in selectedApplicant.educations"
                    :key="edu.id"
                    class="p-3 bg-appleCore-50/60 rounded-xl border border-appleCore-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span class="font-semibold text-blueberry-900">{{ edu.school_name }}</span>
                      <p class="text-[11px] text-blueberry-500 capitalize">{{ edu.education_level }} <span v-if="edu.course">· {{ edu.course }}</span></p>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                      {{ edu.education_status || 'GRADUATED' }}
                    </span>
                  </div>
                </div>
                <p v-else class="text-blueberry-400 italic text-xs">No education records provided.</p>
              </div>

              <!-- Employment History -->
              <div class="pt-3 border-t border-appleCore-100">
                <span class="text-blueberry-600 block text-[11px] uppercase font-bold tracking-wider mb-2">Work Experience ({{ selectedApplicant.employments?.length ?? 0 }})</span>
                <div v-if="selectedApplicant.employments?.length" class="space-y-2">
                  <div
                    v-for="emp in selectedApplicant.employments"
                    :key="emp.id"
                    class="p-3 bg-appleCore-50/60 rounded-xl border border-appleCore-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span class="font-semibold text-blueberry-900">{{ emp.position }}</span>
                      <p class="text-[11px] text-blueberry-500">{{ emp.company_name }} <span v-if="emp.country">({{ emp.country }})</span></p>
                    </div>
                    <span v-if="emp.is_current" class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">Current</span>
                  </div>
                </div>
                <p v-else class="text-blueberry-400 italic text-xs">No previous employment records provided.</p>
              </div>
            </section>

            <!-- 8️⃣ Tattoos & Japan Contacts (AIS Specific) -->
            <section
              v-if="activeTab === 'all' || activeTab === 'tattoos_japan'"
              class="bg-white rounded-xl border border-appleCore-100 p-5 shadow-xs space-y-4"
            >
              <div class="flex items-center justify-between border-b border-appleCore-100 pb-2.5">
                <h4 class="text-sm font-serif font-semibold text-blueberry-800 flex items-center gap-2">
                  <i class="pi pi-globe text-apricot-500" />
                  Tattoos & Japan Contacts
                </h4>
              </div>

              <!-- Tattoos Section -->
              <div>
                <span class="text-blueberry-600 block text-[11px] uppercase font-bold tracking-wider mb-2">Tattoo Records ({{ selectedApplicant.tattoos?.length ?? 0 }})</span>
                <div v-if="selectedApplicant.tattoos?.length" class="space-y-2">
                  <div
                    v-for="tat in selectedApplicant.tattoos"
                    :key="tat.id"
                    class="p-3 bg-appleCore-50/60 rounded-xl border border-appleCore-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span class="font-semibold text-blueberry-900">Location: {{ tat.location || 'Body' }}</span>
                      <p class="text-[11px] text-blueberry-500">{{ tat.description }}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800">
                      {{ tat.can_be_removed ? 'Removable' : 'Permanent' }}
                    </span>
                  </div>
                </div>
                <p v-else class="text-blueberry-400 italic text-xs">No tattoos declared.</p>
              </div>

              <!-- Japan Contacts -->
              <div class="pt-3 border-t border-appleCore-100 space-y-3">
                <span class="text-blueberry-600 block text-[11px] uppercase font-bold tracking-wider">Japan Connections</span>

                <!-- Marucon -->
                <div class="p-3 bg-appleCore-50/60 rounded-xl text-xs">
                  <span class="text-blueberry-700 block text-[10px] font-bold uppercase tracking-wider mb-1.5">Marucon Japan Contact</span>
                  <div v-if="selectedApplicant.japan_contacts?.find((jc: any) => jc.affiliation_type === 'marucon')" class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div><span class="text-blueberry-400 block text-[10px]">Name</span><strong class="text-blueberry-900">{{ selectedApplicant.japan_contacts.find((jc: any) => jc.affiliation_type === 'marucon')?.name }}</strong></div>
                    <div><span class="text-blueberry-400 block text-[10px]">Batch</span><strong class="text-blueberry-900">{{ selectedApplicant.japan_contacts.find((jc: any) => jc.affiliation_type === 'marucon')?.batch_no || '—' }}</strong></div>
                    <div><span class="text-blueberry-400 block text-[10px]">Company</span><strong class="text-blueberry-900">{{ selectedApplicant.japan_contacts.find((jc: any) => jc.affiliation_type === 'marucon')?.company_name || '—' }}</strong></div>
                    <div><span class="text-blueberry-400 block text-[10px]">Relation</span><strong class="text-blueberry-900">{{ selectedApplicant.japan_contacts.find((jc: any) => jc.affiliation_type === 'marucon')?.relation || '—' }}</strong></div>
                  </div>
                  <p v-else class="text-blueberry-400 italic text-xs">No Marucon contacts declared.</p>
                </div>

                <!-- Non-Marucon -->
                <div class="p-3 bg-appleCore-50/60 rounded-xl text-xs">
                  <span class="text-blueberry-700 block text-[10px] font-bold uppercase tracking-wider mb-1.5">Non-Marucon Japan Contact</span>
                  <div v-if="selectedApplicant.japan_contacts?.find((jc: any) => jc.affiliation_type === 'non_marucon')" class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div><span class="text-blueberry-400 block text-[10px]">Name</span><strong class="text-blueberry-900">{{ selectedApplicant.japan_contacts.find((jc: any) => jc.affiliation_type === 'non_marucon')?.name }}</strong></div>
                    <div><span class="text-blueberry-400 block text-[10px]">Contact</span><strong class="text-blueberry-900">{{ selectedApplicant.japan_contacts.find((jc: any) => jc.affiliation_type === 'non_marucon')?.contact_number || '—' }}</strong></div>
                    <div><span class="text-blueberry-400 block text-[10px]">Company</span><strong class="text-blueberry-900">{{ selectedApplicant.japan_contacts.find((jc: any) => jc.affiliation_type === 'non_marucon')?.company_name || '—' }}</strong></div>
                    <div><span class="text-blueberry-400 block text-[10px]">Relation</span><strong class="text-blueberry-900">{{ selectedApplicant.japan_contacts.find((jc: any) => jc.affiliation_type === 'non_marucon')?.relation || '—' }}</strong></div>
                  </div>
                  <p v-else class="text-blueberry-400 italic text-xs">No non-Marucon contacts declared.</p>
                </div>
              </div>
            </section>

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
          <div class="flex items-center justify-between p-4 border-t border-appleCore-100 bg-white shrink-0">
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
                label="Approve & Activate Account"
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
          <i class="pi pi-file-excel text-apricot-500 text-xl" />
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
          class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white !text-xs"
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
