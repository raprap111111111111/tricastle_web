<script setup lang="ts">
import { ref, onMounted, onActivated, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Paginator, { type PageState } from 'primevue/paginator'
import { AppCard, AppStatCard, AppSearchBar } from '@shared/ui'
import { usePsgc } from '@shared/composables/usePsgc'
import { useApplicantStore } from '../stores/applicant.store.ts'
import ApplicantStatusBadge from '../components/ApplicantStatusBadge.vue'
import type { Applicant } from '../types/index.ts'

// 📊 Excel Export
import {
  ALL_COLUMNS,
  DEFAULT_COLUMN_KEYS,
  COLUMN_PRESETS,
  exportByLocation,
  exportApplicantList,
  type ExcelColumn,
} from '@shared/utils/excel-export'

const route   = useRoute()
const router  = useRouter()
const toast   = useToast()
const confirm = useConfirm()
const store   = useApplicantStore()

// ─── PSGC ──────────────────────────────────────────────
const {
  provinces: psgcProvinces,
  fetchAllProvinces,
  fetchCitiesByProvince,
  loadingProvinces,
  loadingCities,
} = usePsgc()

const psgcCities = ref<any[]>([])

// ─── Per-row loading ────────────────────────────────────
const loadingIds = ref<Set<number>>(new Set())

function isRowLoading(id: number): boolean {
  return loadingIds.value.has(id)
}

function setRowLoading(id: number, loading: boolean) {
  const next = new Set(loadingIds.value)
  loading ? next.add(id) : next.delete(id)
  loadingIds.value = next
}

// ─── Main filters ──────────────────────────────────────
const searchQuery = ref('')

// ─── Advanced (staged) ─────────────────────────────────
const gender       = ref<string>('')
const civilStatus  = ref<string>('')
const nationality  = ref<string>('')
const qualityGrade = ref<string>('')
const city         = ref<string>('')
const province     = ref<string>('')
const address      = ref<string>('')

type AdvancedFilters = {
  gender?: string
  civil_status?: string
  nationality?: string
  quality_grade?: string
  city?: string
  province?: string
  address?: string
}

const appliedAdvanced = ref<AdvancedFilters>({})
const showAdvanced    = ref(false)

// ─── Options ───────────────────────────────────────────
const genderOptions = [
  { label: 'All Genders', value: '' },
  { label: 'Male',        value: 'male' },
  { label: 'Female',      value: 'female' },
]

const civilStatusOptions = [
  { label: 'All Civil Status', value: '' },
  { label: 'Single',           value: 'single' },
  { label: 'Married',          value: 'married' },
  { label: 'Widowed',          value: 'widowed' },
  { label: 'Separated',        value: 'separated' },
  { label: 'Divorced',         value: 'divorced' },
]

const nationalityOptions = [
  { label: 'All Nationalities', value: '' },
  { label: 'Filipino',          value: 'Filipino' },
  { label: 'American',          value: 'American' },
  { label: 'Japanese',          value: 'Japanese' },
  { label: 'Chinese',           value: 'Chinese' },
  { label: 'Korean',            value: 'Korean' },
]

const qualityGradeOptions = [
  { label: 'All Grades', value: '' },
  { label: 'Grade A',    value: 'A' },
  { label: 'Grade B',    value: 'B' },
  { label: 'Grade C',    value: 'C' },
  { label: 'Grade D',    value: 'D' },
  { label: 'Grade F',    value: 'F' },
]

const provinceOptions = computed(() => [
  { label: 'All Provinces', value: '' },
  ...psgcProvinces.value.map((p) => ({ label: p.name, value: p.name })),
])

const cityOptions = computed(() => [
  {
    label: province.value ? 'All Cities' : 'Select province first',
    value: '',
    isCity: false,
    isMunicipality: false,
  },
  ...psgcCities.value.map((c) => ({
    label: c.name,
    value: c.name,
    isCity: c.isCity,
    isMunicipality: c.isMunicipality,
  })),
])

// ─── Watch province → load cities ──────────────────────
watch(province, async (newProvince) => {
  if (!newProvince) {
    psgcCities.value = []
    city.value       = ''
    return
  }
  const provinceObj = psgcProvinces.value.find((p) => p.name === newProvince)
  if (provinceObj) {
    psgcCities.value = await fetchCitiesByProvince(provinceObj.code)
    city.value       = ''
  }
})

// ─── Load only REJECTED applicants ─────────────────────
async function loadRejected() {
  store.setFilters({
    search:            '',
    status:            'rejected',
    gender:            '',
    civil_status:      '',
    nationality:       '',
    quality_grade:     '',
    assigned_staff_id: '',
    exclude_statuses:  '',
    batch_id:          '',
    batch_status:      '',
    offset:            0,
    limit:             10,
  } as any)
  await store.fetchApplicants()
}

onMounted(async () => {
  await Promise.all([loadRejected(), fetchAllProvinces()])
})

onActivated(loadRejected)

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/rejected') loadRejected()
  },
)

// ─── Handlers ──────────────────────────────────────────
function onSearch(value: string) {
  searchQuery.value = value.trim()
  store.setFilters({
    status: 'rejected',
    search: searchQuery.value,
    ...appliedAdvanced.value,
    offset: 0,
  } as any)
  store.fetchApplicants()
}

function applyAdvanced() {
  const advanced: AdvancedFilters = {
    gender:        gender.value || undefined,
    civil_status:  civilStatus.value || undefined,
    nationality:   nationality.value || undefined,
    quality_grade: qualityGrade.value || undefined,
    city:          city.value.trim() || undefined,
    province:      province.value || undefined,
    address:       address.value.trim() || undefined,
  }
  Object.keys(advanced).forEach((k) => {
    if (advanced[k as keyof AdvancedFilters] === undefined) {
      delete advanced[k as keyof AdvancedFilters]
    }
  })
  appliedAdvanced.value = advanced
  store.setFilters({
    status: 'rejected',
    search: searchQuery.value,
    ...advanced,
    offset: 0,
  } as any)
  store.fetchApplicants()
  showAdvanced.value = false
}

function clearAdvanced() {
  gender.value          = ''
  civilStatus.value     = ''
  nationality.value     = ''
  qualityGrade.value    = ''
  city.value            = ''
  province.value        = ''
  address.value         = ''
  psgcCities.value      = []
  appliedAdvanced.value = {}
}

function resetAll() {
  searchQuery.value = ''
  clearAdvanced()
  store.setFilters({
    status: 'rejected',
    search: '',
    offset: 0,
  } as any)
  store.fetchApplicants()
}

// ─── Counts ────────────────────────────────────────────
const appliedAdvancedCount = computed(() => Object.keys(appliedAdvanced.value).length)

const stagedAdvancedCount = computed(() => {
  let count = 0
  if (gender.value)         count++
  if (civilStatus.value)    count++
  if (nationality.value)    count++
  if (qualityGrade.value)   count++
  if (city.value.trim())    count++
  if (province.value)       count++
  if (address.value.trim()) count++
  return count
})

const hasUnsavedChanges = computed(() => {
  const current = JSON.stringify({
    gender:        gender.value || undefined,
    civil_status:  civilStatus.value || undefined,
    nationality:   nationality.value || undefined,
    quality_grade: qualityGrade.value || undefined,
    city:          city.value.trim() || undefined,
    province:      province.value || undefined,
    address:       address.value.trim() || undefined,
  })
  const applied = JSON.stringify({
    gender:        appliedAdvanced.value.gender || undefined,
    civil_status:  appliedAdvanced.value.civil_status || undefined,
    nationality:   appliedAdvanced.value.nationality || undefined,
    quality_grade: appliedAdvanced.value.quality_grade || undefined,
    city:          appliedAdvanced.value.city || undefined,
    province:      appliedAdvanced.value.province || undefined,
    address:       appliedAdvanced.value.address || undefined,
  })
  return current !== applied
})

const hasFilters = computed(
  () => searchQuery.value !== '' || appliedAdvancedCount.value > 0,
)

// ─── Active chips ──────────────────────────────────────
const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []
  if (searchQuery.value.trim()) filters.push({ key: 'search', label: 'Search', value: searchQuery.value })
  const adv = appliedAdvanced.value
  if (adv.gender)        filters.push({ key: 'gender',        label: 'Gender',      value: adv.gender })
  if (adv.civil_status)  filters.push({ key: 'civil_status',  label: 'Civil',       value: adv.civil_status })
  if (adv.nationality)   filters.push({ key: 'nationality',   label: 'Nationality', value: adv.nationality })
  if (adv.quality_grade) filters.push({ key: 'quality_grade', label: 'Grade',       value: adv.quality_grade })
  if (adv.city)          filters.push({ key: 'city',          label: 'City',        value: adv.city })
  if (adv.province)      filters.push({ key: 'province',      label: 'Province',    value: adv.province })
  if (adv.address)       filters.push({ key: 'address',       label: 'Address',     value: adv.address })
  return filters
})

function removeFilter(key: string) {
  if (key === 'search') {
    searchQuery.value = ''
  } else {
    switch (key) {
      case 'gender':        gender.value = '';       break
      case 'civil_status':  civilStatus.value = '';  break
      case 'nationality':   nationality.value = '';  break
      case 'quality_grade': qualityGrade.value = ''; break
      case 'city':          city.value = '';         break
      case 'province':
        province.value   = ''
        psgcCities.value = []
        city.value       = ''
        break
      case 'address':       address.value = '';      break
    }
    delete appliedAdvanced.value[key as keyof AdvancedFilters]
    if (key === 'province') delete appliedAdvanced.value.city
  }
  store.setFilters({
    status: 'rejected',
    search: searchQuery.value,
    ...appliedAdvanced.value,
    offset: 0,
  } as any)
  store.fetchApplicants()
}

// ─── Pagination ─────────────────────────────────────────
const currentLimit = computed(
  () => store.pagination?.per_page ?? store.pagination?.limit ?? 10,
)

const currentFirst = computed(() => {
  if (store.pagination?.current_page && currentLimit.value) {
    return (store.pagination.current_page - 1) * currentLimit.value
  }
  return store.pagination?.offset ?? 0
})

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    store.setLimit(event.rows)
  } else {
    store.setPage(event.page + 1)
  }
  store.fetchApplicants()
}

// ─── Actions ────────────────────────────────────────────
function goToView(id: number) {
  router.push({ name: 'applicants.show', params: { id } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToView((event.data as Applicant).id)
}

function handleRestore(applicant: Applicant) {
  confirm.require({
    header:      'Restore Applicant',
    message:     `Restore ${applicant.first_name} ${applicant.last_name} back to Pending status?`,
    icon:        'pi pi-refresh',
    acceptLabel: 'Yes, Restore',
    rejectLabel: 'Cancel',
    acceptClass: '!bg-blue-600 !border-blue-600',
    accept: async () => {
      setRowLoading(applicant.id, true)
      try {
        await store.updateStatus(applicant.id, 'pending')
        const idx = store.applicants.findIndex((a) => a.id === applicant.id)
        if (idx !== -1) store.applicants.splice(idx, 1)
        toast.add({
          severity: 'success',
          summary:  'Restored',
          detail:   `${applicant.applicant_code} is back in the review queue`,
          life:     4000,
        })
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary:  'Failed',
          detail:   e?.response?.data?.message ?? 'Could not restore applicant',
          life:     4000,
        })
      } finally {
        setRowLoading(applicant.id, false)
      }
    },
  })
}

// ─── Formatters ─────────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-CA')
  } catch { return '—' }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 EXCEL EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const showExportDialog = ref(false)
const exporting        = ref(false)

type ExportScope = 'current' | 'location'
const exportScope    = ref<ExportScope>('current')
const exportLocation = ref<string>('')

// ─── Column Picker State ──────────────────────────────
// Rejected list defaults include rejection reason + rejected_at
const REJECTED_DEFAULT_COLUMNS = [
  'applicant_code',
  'first_name',
  'last_name',
  'email',
  'phone',
  'gender',
  'nationality',
  'city',
  'province',
  'rejection_reason',
]

const selectedColumnKeys = ref<string[]>([...REJECTED_DEFAULT_COLUMNS])

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

// ─── Available locations ──────────────────────────────
const availableLocations = computed(() => {
  const set = new Set<string>()
  store.applicants.forEach((a) => {
    if (a.province) set.add(a.province)
    if (a.city)     set.add(a.city)
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

    default:
      return store.applicants
  }
})

function openExportDialog() {
  exportScope.value        = 'current'
  exportLocation.value     = ''
  selectedColumnKeys.value = [...REJECTED_DEFAULT_COLUMNS]
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
          exportLocation.value || 'Rejected Applicants',
          selectedColumnKeys.value,
        )
        break

      case 'current':
      default:
        exportApplicantList(
          exportApplicants.value,
          'rejected_applicants',
          'Rejected',
          selectedColumnKeys.value,
        )
        break
    }

    toast.add({
      severity: 'success',
      summary:  'Exported',
      detail:   `${exportApplicants.value.length} rejected applicant${exportApplicants.value.length !== 1 ? 's' : ''} × ${selectedColumnKeys.value.length} columns exported`,
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
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <Button icon="pi pi-arrow-left" text rounded @click="router.push({ name: 'applicants.index' })" />
        <div>
          <h1 class="text-3xl font-serif font-semibold text-red-700 tracking-tight">
            Rejected Applicants
          </h1>
          <p class="text-sm text-blueberry-500 mt-1">
            Applicants that were rejected. You can restore them if needed.
          </p>
        </div>
      </div>

      <!-- ✅ Action buttons -->
      <div class="flex items-center gap-2">
        <Button
          label="Export Excel"
          icon="pi pi-file-excel"
          severity="secondary"
          outlined
          :disabled="store.applicants.length === 0"
          @click="openExportDialog"
        />
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="store.loading"
          @click="loadRejected"
        />
      </div>
    </header>

    <!-- ─── Stats ──────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AppStatCard label="Total Rejected" :value="store.pagination?.total ?? 0" icon="pi pi-times-circle" variant="apricot" />
      <div class="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-xl">
        <i class="pi pi-info-circle text-red-500 text-2xl" />
        <div>
          <p class="text-sm font-semibold text-red-800">Rejection Reasons</p>
          <p class="text-xs text-red-600 mt-0.5">Hover over each row to see the rejection reason</p>
        </div>
      </div>
    </div>

    <!-- ─── Filters ────────────────────────────────── -->
    <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">
      <div class="flex flex-wrap items-center gap-3">
        <AppSearchBar
          v-model="searchQuery"
          placeholder="Search by name, email, or code..."
          button-label=""
          class="flex-1 min-w-[280px]"
          @search="onSearch"
        />
        <Button severity="secondary" outlined @click="showAdvanced = true">
          <template #default>
            <i class="pi pi-sliders-h mr-2" />
            <span>Advanced</span>
            <span v-if="appliedAdvancedCount > 0"
              class="ml-2 px-1.5 py-0.5 rounded-full bg-apricot-500 text-white text-[10px] font-bold min-w-[20px] text-center">
              {{ appliedAdvancedCount }}
            </span>
          </template>
        </Button>
        <Button v-if="hasFilters" icon="pi pi-refresh" severity="secondary" text rounded
          v-tooltip.top="'Reset all filters'" @click="resetAll" />
      </div>

      <div v-if="hasFilters" class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100">
        <span class="text-xs text-blueberry-500 font-medium">Active:</span>
        <span v-for="f in activeFilters" :key="f.key"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700
                 rounded-full text-xs font-medium ring-1 ring-apricot-200">
          <span class="font-semibold">{{ f.label }}:</span>
          <span>{{ f.value }}</span>
          <button type="button" class="ml-0.5 hover:text-apricot-900 transition-colors" @click="removeFilter(f.key)">
            <i class="pi pi-times text-[10px]" />
          </button>
        </span>
      </div>
    </div>

    <!-- ─── Table ──────────────────────────────────── -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <DataTable
        :value="store.applicants"
        :loading="store.loading"
        :row-hover="true"
        class="!border-none"
        size="small"
        @row-click="onRowClick"
        :pt="{
          header: '!bg-red-50/50 !text-red-700 !font-semibold !text-xs !uppercase !tracking-wider',
          headerRow: '!bg-red-50/50 !border-b !border-red-100',
          bodyRow: 'cursor-pointer hover:!bg-red-50/40 !border-b !border-appleCore-100/60 transition-colors',
        }"
      >
        <Column field="applicant_code" header="Code" style="width: 150px">
          <template #body="{ data }">
            <span class="font-mono text-xs text-red-600 font-semibold">
              {{ data.applicant_code }}
            </span>
          </template>
        </Column>

        <Column header="Applicant">
          <template #body="{ data }">
            <div class="flex flex-col items-start">
              <span class="font-medium text-blueberry-800 hover:text-red-600 transition-colors">
                {{ data.first_name }} {{ data.last_name }}
              </span>
              <span class="text-xs text-blueberry-400">{{ data.email }}</span>
            </div>
          </template>
        </Column>

        <Column header="Rejection Reason">
          <template #body="{ data }">
            <span class="text-xs text-red-700 italic" v-tooltip.top="data.rejection_reason || 'No reason provided'">
              {{
                data.rejection_reason
                  ? (data.rejection_reason.length > 40
                    ? data.rejection_reason.slice(0, 40) + '...'
                    : data.rejection_reason)
                  : '—'
              }}
            </span>
          </template>
        </Column>

        <Column field="rejected_at" header="Rejected On" style="width: 150px">
          <template #body="{ data }">
            <span class="text-sm text-blueberry-600">{{ formatDate(data.rejected_at) }}</span>
          </template>
        </Column>

        <Column field="status" header="Status" style="width: 120px">
          <template #body="{ data }">
            <ApplicantStatusBadge :status="data.status" />
          </template>
        </Column>

        <Column header="Actions" style="width: 140px">
          <template #body="{ data }">
            <div class="flex items-center gap-1" @click.stop>
              <Button icon="pi pi-eye" text rounded size="small"
                class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50" v-tooltip.top="'View Details'"
                :disabled="isRowLoading(data.id)" @click="goToView(data.id)" />
              <Button icon="pi pi-refresh" text rounded size="small"
                class="!text-blueberry-500 hover:!text-green-600 hover:!bg-green-50"
                v-tooltip.top="'Restore to Pending'" :loading="isRowLoading(data.id)" @click="handleRestore(data)" />
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <i class="pi pi-check-circle text-2xl text-green-500" />
            </div>
            <p class="text-sm text-blueberry-600 font-medium">No rejected applicants</p>
            <p class="text-xs text-blueberry-400">Great — nobody has been rejected!</p>
          </div>
        </template>
      </DataTable>

      <!-- Pagination -->
      <div v-if="store.pagination && store.pagination.total > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30">
        <div class="text-xs text-blueberry-500">
          Showing
          <span class="font-semibold text-blueberry-700">
            {{ store.pagination.from ?? currentFirst + 1 }}
          </span>
          to
          <span class="font-semibold text-blueberry-700">
            {{ store.pagination.to ?? Math.min(currentFirst + currentLimit, store.pagination.total) }}
          </span>
          of
          <span class="font-semibold text-blueberry-700">{{ store.pagination.total }}</span>
          entries
        </div>
        <Paginator :rows="currentLimit" :total-records="store.pagination.total" :first="currentFirst"
          :rows-per-page-options="[10, 25, 50, 100]" template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
          class="!bg-transparent !p-0" @page="onPageChange" />
      </div>
    </AppCard>

    <!-- ═══════════════════════════════════════════════════
         🎯 Advanced Filter Dialog
    ════════════════════════════════════════════════════ -->
    <Dialog v-model:visible="showAdvanced" modal :draggable="false" :dismissable-mask="false" :closable="false"
      :style="{ width: '500px' }" :pt="{
        root:    { class: 'rounded-2xl overflow-hidden' },
        header:  { class: '!p-0' },
        content: { class: '!p-0' },
      }">
      <template #container>
        <div class="bg-white rounded-2xl overflow-hidden">
          <div class="flex items-center justify-between p-5 border-b border-appleCore-100">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-lg bg-apricot-100 flex items-center justify-center">
                <i class="pi pi-sliders-h text-apricot-600 text-sm" />
              </div>
              <div>
                <p class="text-sm font-semibold text-blueberry-800">Advanced Filters</p>
                <p class="text-[11px] text-blueberry-500">Set criteria and click Apply</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button v-if="stagedAdvancedCount > 0" type="button"
                class="text-[11px] text-red-500 hover:text-red-700 hover:underline" @click="clearAdvanced">
                Clear
              </button>
              <button type="button"
                class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
                @click="showAdvanced = false">
                <i class="pi pi-times text-xs" />
              </button>
            </div>
          </div>

          <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="pi pi-user text-blueberry-400 text-xs" />
                Demographics
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Gender</label>
                  <Select v-model="gender" :options="genderOptions" option-label="label" option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Civil Status</label>
                  <Select v-model="civilStatus" :options="civilStatusOptions" option-label="label" option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Nationality</label>
                  <Select v-model="nationality" :options="nationalityOptions" option-label="label" option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Quality Grade</label>
                  <Select v-model="qualityGrade" :options="qualityGradeOptions" option-label="label" option-value="value" class="w-full" size="small" />
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-appleCore-100">
              <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="pi pi-map-marker text-apricot-500 text-xs" />
                Location
              </p>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>Province</span>
                    <span v-if="!loadingProvinces && psgcProvinces.length > 0" class="text-[10px] text-blueberry-400 font-normal">
                      ({{ psgcProvinces.length }} available)
                    </span>
                  </label>
                  <Select v-model="province" :options="provinceOptions" option-label="label" option-value="value"
                    :placeholder="loadingProvinces ? 'Loading provinces...' : 'Select province...'"
                    class="w-full" size="small" filter show-clear :loading="loadingProvinces" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>City / Municipality</span>
                    <span v-if="province && !loadingCities && psgcCities.length > 0" class="text-[10px] text-blueberry-400 font-normal">
                      ({{ psgcCities.length }} available)
                    </span>
                    <i v-if="loadingCities" class="pi pi-spin pi-spinner text-[10px] text-apricot-500" />
                  </label>
                  <Select v-model="city" :options="cityOptions" option-label="label" option-value="value"
                    :placeholder="!province ? 'Select province first...' : loadingCities ? 'Loading cities...' : 'Select city or municipality...'"
                    class="w-full" size="small" filter show-clear :loading="loadingCities"
                    :disabled="!province || loadingCities">
                    <template #option="{ option }">
                      <div class="flex items-center gap-2 w-full">
                        <i v-if="option.value === ''" class="pi pi-list text-blueberry-400 text-xs" />
                        <i v-else class="pi pi-building text-blueberry-400 text-xs" />
                        <span class="flex-1 truncate">{{ option.label }}</span>
                        <span v-if="option.isCity" class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">CITY</span>
                        <span v-else-if="option.isMunicipality" class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">MUN.</span>
                      </div>
                    </template>
                  </Select>
                  <p v-if="!province" class="text-[10px] text-blueberry-400 mt-1 flex items-center gap-1">
                    <i class="pi pi-info-circle text-[9px]" />
                    Choose a province to enable city selection
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Address Keyword</label>
                  <div class="relative">
                    <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-blueberry-400 text-xs z-10" />
                    <InputText v-model="address" placeholder="e.g. Bonifacio Street..." class="w-full !pl-9" size="small" @keyup.enter="applyAdvanced" />
                  </div>
                  <p class="text-[10px] text-blueberry-400 mt-1 flex items-center gap-1">
                    <i class="pi pi-info-circle text-[9px]" />
                    Searches both current and permanent address
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
            <span class="text-xs text-blueberry-500">
              <span v-if="stagedAdvancedCount > 0">
                <strong class="text-apricot-600">{{ stagedAdvancedCount }}</strong>
                {{ stagedAdvancedCount === 1 ? 'filter' : 'filters' }} staged
              </span>
              <span v-if="hasUnsavedChanges" class="ml-1 text-amber-600">(unsaved)</span>
            </span>
            <div class="flex items-center gap-2">
              <Button label="Cancel" severity="secondary" text size="small" @click="showAdvanced = false" />
              <Button label="Apply Filters" icon="pi pi-check" size="small"
                class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500" @click="applyAdvanced" />
            </div>
          </div>
        </div>
      </template>
    </Dialog>

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
              <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i class="pi pi-file-excel text-red-600 text-lg" />
              </div>
              <div>
                <p class="text-sm font-semibold text-blueberry-800">Export Rejected Applicants</p>
                <p class="text-[11px] text-blueberry-500">Configure your export</p>
              </div>
            </div>
            <button type="button"
              class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
              @click="closeExportDialog">
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
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="opt in [
                    { key: 'current',  icon: 'pi-table',      title: 'Current View',  desc: `Current page (${store.applicants.length})` },
                    { key: 'location', icon: 'pi-map-marker', title: 'By Location',   desc: 'Group by province' },
                  ]"
                  :key="opt.key"
                  type="button"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="exportScope === opt.key
                    ? 'border-red-400 bg-red-50'
                    : 'border-appleCore-100 hover:border-appleCore-300'"
                  @click="exportScope = opt.key as any"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="exportScope === opt.key ? 'bg-red-100' : 'bg-appleCore-100'">
                      <i class="pi text-xs"
                        :class="[opt.icon, exportScope === opt.key ? 'text-red-600' : 'text-blueberry-500']" />
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

              <div class="mt-3 flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                <i class="pi pi-info-circle text-blue-500 text-xs mt-0.5" />
                <p class="text-[11px] text-blue-700 leading-snug">
                  <strong>Note:</strong> Only applicants loaded on this page are available for export.
                </p>
              </div>
            </div>

            <!-- 2️⃣ Column Picker -->
            <div class="pt-4 border-t border-appleCore-100">
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider">
                  2. Columns to Include
                  <span class="ml-1 text-red-600 normal-case">
                    ({{ selectedColumnKeys.length }}/{{ ALL_COLUMNS.length }})
                  </span>
                </p>
                <div class="flex items-center gap-1">
                  <button type="button" class="text-[11px] text-red-600 hover:underline" @click="selectAllColumns">
                    Select all
                  </button>
                  <span class="text-blueberry-300">•</span>
                  <button type="button" class="text-[11px] text-red-500 hover:underline" @click="clearAllColumns">
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
                         bg-appleCore-50 hover:bg-red-50 hover:text-red-700
                         text-blueberry-700 font-medium transition-colors"
                  @click="applyPreset(preset.key as any)"
                >
                  <i :class="`pi ${preset.icon} text-[9px]`" />
                  {{ preset.label }}
                </button>
              </div>

              <div class="border border-appleCore-100 rounded-lg max-h-[280px] overflow-y-auto">
                <div v-for="group in columnGroups" :key="group.name"
                  class="border-b border-appleCore-100 last:border-b-0">
                  <label class="flex items-center gap-2 px-3 py-2 bg-appleCore-50/70 cursor-pointer
                         hover:bg-appleCore-100 transition-colors sticky top-0 z-10">
                    <input type="checkbox" class="w-3.5 h-3.5 rounded accent-red-500 cursor-pointer"
                      :checked="isGroupChecked(group.name)" :indeterminate.prop="isGroupPartial(group.name)"
                      @change="toggleGroup(group.name)" />
                    <span class="text-xs font-bold text-blueberry-700 uppercase tracking-wider">
                      {{ group.name }}
                    </span>
                    <span class="text-[10px] text-blueberry-400 ml-auto">
                      {{ group.columns.filter(c => selectedColumnKeys.includes(c.key)).length }}
                      / {{ group.columns.length }}
                    </span>
                  </label>

                  <div class="grid grid-cols-2 gap-x-2 p-2">
                    <label v-for="col in group.columns" :key="col.key"
                      class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-appleCore-50
                             cursor-pointer text-xs text-blueberry-700 transition-colors">
                      <input type="checkbox" class="w-3 h-3 rounded accent-red-500 cursor-pointer"
                        :checked="selectedColumnKeys.includes(col.key)" @change="toggleColumn(col.key)" />
                      <span class="flex-1 truncate">{{ col.header }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
              <i class="pi pi-info-circle text-red-500 text-xs" />
              <p class="text-xs text-red-700">
                <strong>{{ exportApplicants.length }}</strong>
                rejected applicant{{ exportApplicants.length !== 1 ? 's' : '' }}
                × <strong>{{ selectedColumnKeys.length }}</strong>
                column{{ selectedColumnKeys.length !== 1 ? 's' : '' }} will be exported
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50 shrink-0">
            <Button label="Cancel" severity="secondary" text size="small" @click="closeExportDialog" />
            <Button
              label="Download .xlsx"
              icon="pi pi-file-excel"
              :loading="exporting"
              :disabled="selectedColumnKeys.length === 0 || exportApplicants.length === 0"
              class="!bg-red-600 hover:!bg-red-700 !border-red-600 !text-white"
              @click="handleDownload"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>