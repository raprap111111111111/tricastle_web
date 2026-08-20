<script setup lang="ts">
import { onMounted, onActivated, computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useApplicants } from '../composables/useApplicants'
import { useApplicantStore } from '../stores/applicant.store'
import { usePubNub } from '@shared/pubnub/usePubNub'
import { PubNubChannels } from '@shared/pubnub/channels'
import ApplicantTable from '../components/ApplicantTable.vue'
import ApplicantFilters from '../components/ApplicantFilters.vue'
import type { ApplicantFilters as IFilters } from '../types'

// 📊 Excel Export
import {
  ALL_COLUMNS,
  DEFAULT_COLUMN_KEYS,
  COLUMN_PRESETS,
  exportByBatch,
  exportByLocation,
  exportByStatus,
  exportApplicantList,
  type ExcelColumn,
} from '@shared/utils/excel-export'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const store  = useApplicantStore()
const { handleDelete } = useApplicants()

// ─── Load applicants excluding final_list and rejected ─────
async function loadInProgress() {
  store.setFilters({
    search: '',
    status: '',
    gender: '',
    civil_status: '',
    nationality: '',
    quality_grade: '',
    assigned_staff_id: '',
    exclude_statuses: 'final_list,rejected',
    batch_id: '',
    batch_status: '',
    offset: 0,
    limit: 10,
  } as any)

  await store.fetchApplicants()
}

onMounted(loadInProgress)
onActivated(loadInProgress)

// 🎯 Watch route — reload whenever we land back on /applicants
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/applicants') loadInProgress()
  },
)

// ─── 📡 PubNub Real-time Updates ──────────────────────
usePubNub([PubNubChannels.APPLICANTS], (msg) => {
  console.log('📩 PubNub message received:', msg)
  switch (msg.event) {
    case 'applicant.status_changed': handleStatusChange(msg.payload);   break
    case 'applicant.created':        handleNewApplicant(msg.payload);   break
    case 'applicant.deleted':        handleDeletedApplicant(msg.payload); break
  }
})

function handleStatusChange(payload: any) {
  toast.add({
    severity: 'info',
    summary:  '📌 Applicant Updated',
    detail:   `${payload.name} → ${String(payload.new_status).replace(/_/g, ' ')}`,
    life:     4000,
  })
  loadInProgress()
}

function handleNewApplicant(payload: any) {
  toast.add({
    severity: 'success',
    summary:  '👤 New Applicant',
    detail:   `${payload.name} was just added by another staff`,
    life:     4000,
  })
  loadInProgress()
}

function handleDeletedApplicant(payload: any) {
  toast.add({
    severity: 'warn',
    summary:  '🗑️ Applicant Removed',
    detail:   `${payload.name} was deleted`,
    life:     3000,
  })
  loadInProgress()
}

// ─── Stats ────────────────────────────────────────────
const totalCount    = computed(() => store.pagination?.total ?? 0)
const pendingCount  = computed(() => store.applicants.filter((a) => a.status === 'pending').length)
const reviewCount   = computed(() => store.applicants.filter((a) => a.status === 'under_review').length)
const verifiedCount = computed(() => store.applicants.filter((a) => a.status === 'verified').length)

// ─── Filter / Pagination handlers ─────────────────────
function onFilter(filters: Partial<IFilters>) {
  store.setFilters({ ...filters, exclude_statuses: 'final_list,rejected' })
  store.fetchApplicants()
}

function onReset()                     { loadInProgress() }
function onPageChange(page: number)    { store.setPage(page);   store.fetchApplicants() }
function onLimitChange(limit: number)  { store.setLimit(limit); store.fetchApplicants() }
async function onDelete(id: number)    { await handleDelete(id) }

// ═══════════════════════════════════════════════════════════════════════════
// 📊 EXCEL EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const showExportDialog = ref(false)
const exporting        = ref(false)

type ExportScope = 'current' | 'location' | 'status'
const exportScope    = ref<ExportScope>('current')
const exportLocation = ref<string>('')
const exportStatus   = ref<string>('')

// ─── Column Picker State ──────────────────────────────
const selectedColumnKeys = ref<string[]>([...DEFAULT_COLUMN_KEYS])

const columnGroups = computed(() => {
  const groups: Record<string, ExcelColumn[]> = {}
  ALL_COLUMNS.forEach((col) => {
    const g = col.group ?? 'Other'
    ;(groups[g] = groups[g] ?? []).push(col)
  })
  return Object.entries(groups).map(([name, columns]) => ({ name, columns }))
})

function toggleColumn(key: string): void {
  const idx = selectedColumnKeys.value.indexOf(key)
  if (idx >= 0) selectedColumnKeys.value.splice(idx, 1)
  else selectedColumnKeys.value.push(key)
}

function toggleGroup(groupName: string): void {
  const group = columnGroups.value.find((g) => g.name === groupName)
  if (!group) return
  const groupKeys  = group.columns.map((c) => c.key)
  const allChecked = groupKeys.every((k) => selectedColumnKeys.value.includes(k))
  if (allChecked) {
    selectedColumnKeys.value = selectedColumnKeys.value.filter((k) => !groupKeys.includes(k))
  } else {
    const merged = new Set([...selectedColumnKeys.value, ...groupKeys])
    selectedColumnKeys.value = Array.from(merged)
  }
}

function isGroupChecked(groupName: string): boolean {
  const group = columnGroups.value.find((g) => g.name === groupName)
  if (!group) return false
  return group.columns.every((c) => selectedColumnKeys.value.includes(c.key))
}

function isGroupPartial(groupName: string): boolean {
  const group = columnGroups.value.find((g) => g.name === groupName)
  if (!group) return false
  const some = group.columns.some((c) => selectedColumnKeys.value.includes(c.key))
  const all  = group.columns.every((c) => selectedColumnKeys.value.includes(c.key))
  return some && !all
}

function applyPreset(preset: keyof typeof COLUMN_PRESETS): void {
  selectedColumnKeys.value = [...COLUMN_PRESETS[preset]]
}

function selectAllColumns(): void {
  selectedColumnKeys.value = ALL_COLUMNS.map((c) => c.key)
}

function clearAllColumns(): void {
  selectedColumnKeys.value = []
}

// ─── Available filter values ──────────────────────────
const availableLocations = computed(() => {
  const set = new Set<string>()
  store.applicants.forEach((a) => {
    if (a.province) set.add(a.province)
    if (a.city)     set.add(a.city)
  })
  return Array.from(set).sort()
})

const availableStatuses = computed(() => {
  const set = new Set<string>()
  store.applicants.forEach((a) => {
    if (a.status) set.add(a.status)
  })
  return Array.from(set).sort()
})

// ─── Actual list to export based on scope ─────────────
const exportApplicants = computed(() => {
  switch (exportScope.value) {
    case 'current':
      return store.applicants

    case 'location':
      if (!exportLocation.value) return store.applicants
      return store.applicants.filter((a) => {
        const loc = exportLocation.value.toLowerCase()
        return (
          (a.province ?? '').toLowerCase() === loc ||
          (a.city     ?? '').toLowerCase() === loc ||
          (a.current_address  ?? '').toLowerCase().includes(loc) ||
          (a.permanent_address ?? '').toLowerCase().includes(loc)
        )
      })

    case 'status':
      if (!exportStatus.value) return store.applicants
      return store.applicants.filter((a) => a.status === exportStatus.value)

    default:
      return store.applicants
  }
})

function openExportDialog() {
  exportScope.value        = 'current'
  exportLocation.value     = ''
  exportStatus.value       = ''
  selectedColumnKeys.value = [...DEFAULT_COLUMN_KEYS]
  showExportDialog.value   = true
}

function closeExportDialog() {
  showExportDialog.value = false
}

async function handleDownload(): Promise<void> {
  if (selectedColumnKeys.value.length === 0) return
  if (exportApplicants.value.length === 0) return

  exporting.value = true
  try {
    switch (exportScope.value) {
      case 'location':
        exportByLocation(
          exportApplicants.value,
          exportLocation.value || 'All Applicants',
          selectedColumnKeys.value,
        )
        break

      case 'status':
        exportByStatus(
          exportApplicants.value,
          exportStatus.value || undefined,
          selectedColumnKeys.value,
        )
        break

      case 'current':
      default:
        exportApplicantList(
          exportApplicants.value,
          'applicants_in_progress',
          'Applicants',
          selectedColumnKeys.value,
        )
        break
    }

    toast.add({
      severity: 'success',
      summary:  'Exported',
      detail:   `${exportApplicants.value.length} applicant${exportApplicants.value.length !== 1 ? 's' : ''} × ${selectedColumnKeys.value.length} columns exported`,
      life:     3000,
    })
    closeExportDialog()
  } catch (err) {
    console.error('[Export]', err)
    toast.add({
      severity: 'error',
      summary:  'Export Failed',
      detail:   'Something went wrong.',
      life:     4000,
    })
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
          <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
            Applicants
          </h1>
          <!-- Live indicator -->
          <span
            class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50
                   text-green-700 rounded-full text-xs font-medium ring-1 ring-green-200"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live
          </span>
        </div>
        <p class="text-sm text-blueberry-500">
          Applicants currently in the review process
        </p>
      </div>

      <!-- 🎯 Action Buttons Group -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- ✅ NEW — Export Excel -->
        <AppButton
          label="Export Excel"
          icon="pi pi-file-excel"
          variant="secondary"
          :disabled="store.applicants.length === 0"
          @click="openExportDialog"
        />

        <!-- Quick shortcut: View Final List -->
        <AppButton
          label="Final List"
          icon="pi pi-folder-open"
          variant="secondary"
          class="!text-green-700 !border-green-200 hover:!bg-green-50"
          @click="router.push('/applicants/final-list')"
        />

        <!-- Quick shortcut: View Rejected -->
        <AppButton
          label="Rejected"
          icon="pi pi-times-circle"
          variant="secondary"
          class="!text-red-600 !border-red-200 hover:!bg-red-50"
          @click="router.push('/applicants/rejected')"
        />

        <!-- Primary CTA: New Applicant -->
        <AppButton
          label="New Applicant"
          icon="pi pi-plus"
          variant="accent"
          @click="router.push({ name: 'applicants.create' })"
        />
      </div>
    </header>

    <!-- ─── Info Banner ────────────────────────────── -->
    <div class="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
      <i class="pi pi-info-circle text-blue-500" />
      Approved applicants are moved to the
      <strong class="mx-1">Final List</strong>
      and rejected ones go to
      <strong class="mx-1">Rejected</strong>
      — they are no longer shown here.
    </div>

    <!-- ─── Stats Cards ───────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="In Progress"  :value="totalCount"    icon="pi pi-users"     variant="blueberry" />
      <AppStatCard label="Pending"      :value="pendingCount"  icon="pi pi-hourglass" variant="apricot" />
      <AppStatCard label="Under Review" :value="reviewCount"   icon="pi pi-clock"     variant="citrus" />
      <AppStatCard label="Verified"     :value="verifiedCount" icon="pi pi-check"     variant="green" />
    </div>

    <!-- ─── Filters ────────────────────────────────── -->
    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
      <ApplicantFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- ─── Table ──────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <ApplicantTable
        :applicants="store.applicants"
        :pagination="store.pagination"
        :loading="store.loading"
        :submitting="store.submitting"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
        @delete="onDelete"
      />
    </AppCard>

    <!-- ═══════════════════════════════════════════════════
         📊 Excel Export Dialog
    ════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showExportDialog"
      modal
      :draggable="false"
      :dismissable-mask="true"
      :closable="false"
      :style="{ width: '640px' }"
      :pt="{
        root:    { class: 'rounded-2xl overflow-hidden' },
        header:  { class: '!p-0' },
        content: { class: '!p-0' },
      }"
    >
      <template #container>
        <div class="bg-white rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">

          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-appleCore-100 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <i class="pi pi-file-excel text-green-600 text-lg" />
              </div>
              <div>
                <p class="text-sm font-semibold text-blueberry-800">
                  Export Applicants to Excel
                </p>
                <p class="text-[11px] text-blueberry-500">Configure your export</p>
              </div>
            </div>
            <button
              type="button"
              class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
              @click="closeExportDialog"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5">

            <!-- 1️⃣ Scope -->
            <div>
              <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-3">
                1. Export Scope
              </p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="opt in [
                    { key: 'current',  icon: 'pi-table',      title: 'Current View',  desc: `Current page (${store.applicants.length})` },
                    { key: 'location', icon: 'pi-map-marker', title: 'By Location',   desc: 'Group by province' },
                    { key: 'status',   icon: 'pi-tag',        title: 'By Status',     desc: 'One sheet per status' },
                  ]"
                  :key="opt.key"
                  type="button"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="exportScope === opt.key
                    ? 'border-apricot-400 bg-apricot-50'
                    : 'border-appleCore-100 hover:border-appleCore-300'"
                  @click="exportScope = opt.key as any"
                >
                  <div class="flex items-center gap-2">
                    <div
                      class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="exportScope === opt.key ? 'bg-apricot-100' : 'bg-appleCore-100'"
                    >
                      <i
                        class="pi text-xs"
                        :class="[opt.icon, exportScope === opt.key ? 'text-apricot-600' : 'text-blueberry-500']"
                      />
                    </div>
                    <span class="text-xs font-semibold text-blueberry-800">{{ opt.title }}</span>
                  </div>
                  <p class="text-[11px] text-blueberry-500 leading-snug">{{ opt.desc }}</p>
                </button>
              </div>

              <!-- Location picker -->
              <div v-if="exportScope === 'location'" class="pt-3">
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                  Filter Location <span class="text-blueberry-400 font-normal">(optional)</span>
                </label>
                <Select
                  v-model="exportLocation"
                  :options="[
                    { label: 'All Locations (grouped by province)', value: '' },
                    ...availableLocations.map(l => ({ label: l, value: l }))
                  ]"
                  option-label="label"
                  option-value="value"
                  placeholder="All locations..."
                  class="w-full"
                  size="small"
                  filter
                  show-clear
                />
              </div>

              <!-- Status picker -->
              <div v-if="exportScope === 'status'" class="pt-3">
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                  Filter Status <span class="text-blueberry-400 font-normal">(optional)</span>
                </label>
                <Select
                  v-model="exportStatus"
                  :options="[
                    { label: 'All Statuses (one sheet each)', value: '' },
                    ...availableStatuses.map(s => ({
                      label: s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' '),
                      value: s,
                    }))
                  ]"
                  option-label="label"
                  option-value="value"
                  placeholder="All statuses..."
                  class="w-full"
                  size="small"
                  show-clear
                />
              </div>

              <!-- Note about pagination -->
              <div class="mt-3 flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                <i class="pi pi-info-circle text-blue-500 text-xs mt-0.5" />
                <p class="text-[11px] text-blue-700 leading-snug">
                  <strong>Note:</strong> Only applicants loaded on this page are available for export.
                  To export more, increase the page size or use filters.
                </p>
              </div>
            </div>

            <!-- 2️⃣ Column Picker -->
            <div class="pt-4 border-t border-appleCore-100">
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider">
                  2. Columns to Include
                  <span class="ml-1 text-apricot-600 normal-case">
                    ({{ selectedColumnKeys.length }}/{{ ALL_COLUMNS.length }})
                  </span>
                </p>
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    class="text-[11px] text-apricot-600 hover:underline"
                    @click="selectAllColumns"
                  >
                    Select all
                  </button>
                  <span class="text-blueberry-300">•</span>
                  <button
                    type="button"
                    class="text-[11px] text-red-500 hover:underline"
                    @click="clearAllColumns"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-1.5 mb-3">
                <span class="text-[11px] text-blueberry-500 font-medium">Presets:</span>
                <button
                  v-for="preset in [
                    { key: 'minimal',    label: 'Minimal (5)',  icon: 'pi-file' },
                    { key: 'contact',    label: 'Contact Info', icon: 'pi-id-card' },
                    { key: 'deployment', label: 'Deployment',   icon: 'pi-send' },
                    { key: 'full',       label: 'Everything',   icon: 'pi-list' },
                  ]"
                  :key="preset.key"
                  type="button"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px]
                         bg-appleCore-50 hover:bg-apricot-50 hover:text-apricot-700
                         text-blueberry-700 font-medium transition-colors"
                  @click="applyPreset(preset.key as any)"
                >
                  <i :class="`pi ${preset.icon} text-[9px]`" />
                  {{ preset.label }}
                </button>
              </div>

              <div class="border border-appleCore-100 rounded-lg max-h-[280px] overflow-y-auto">
                <div
                  v-for="group in columnGroups"
                  :key="group.name"
                  class="border-b border-appleCore-100 last:border-b-0"
                >
                  <label
                    class="flex items-center gap-2 px-3 py-2 bg-appleCore-50/70 cursor-pointer
                           hover:bg-appleCore-100 transition-colors sticky top-0 z-10"
                  >
                    <input
                      type="checkbox"
                      class="w-3.5 h-3.5 rounded accent-apricot-500 cursor-pointer"
                      :checked="isGroupChecked(group.name)"
                      :indeterminate.prop="isGroupPartial(group.name)"
                      @change="toggleGroup(group.name)"
                    />
                    <span class="text-xs font-bold text-blueberry-700 uppercase tracking-wider">
                      {{ group.name }}
                    </span>
                    <span class="text-[10px] text-blueberry-400 ml-auto">
                      {{ group.columns.filter(c => selectedColumnKeys.includes(c.key)).length }}
                      / {{ group.columns.length }}
                    </span>
                  </label>

                  <div class="grid grid-cols-2 gap-x-2 p-2">
                    <label
                      v-for="col in group.columns"
                      :key="col.key"
                      class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-appleCore-50
                             cursor-pointer text-xs text-blueberry-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        class="w-3 h-3 rounded accent-apricot-500 cursor-pointer"
                        :checked="selectedColumnKeys.includes(col.key)"
                        @change="toggleColumn(col.key)"
                      />
                      <span class="flex-1 truncate">{{ col.header }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="flex items-center gap-2 px-3 py-2 bg-appleCore-50 rounded-lg">
              <i class="pi pi-info-circle text-blueberry-400 text-xs" />
              <p class="text-xs text-blueberry-600">
                <strong class="text-blueberry-800">{{ exportApplicants.length }}</strong>
                applicant{{ exportApplicants.length !== 1 ? 's' : '' }}
                × <strong class="text-blueberry-800">{{ selectedColumnKeys.length }}</strong>
                column{{ selectedColumnKeys.length !== 1 ? 's' : '' }} will be exported
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50 shrink-0"
          >
            <Button
              label="Cancel"
              severity="secondary"
              text
              size="small"
              @click="closeExportDialog"
            />
            <Button
              label="Download .xlsx"
              icon="pi pi-file-excel"
              :loading="exporting"
              :disabled="selectedColumnKeys.length === 0 || exportApplicants.length === 0"
              class="!bg-green-600 hover:!bg-green-700 !border-green-600 !text-white"
              @click="handleDownload"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>