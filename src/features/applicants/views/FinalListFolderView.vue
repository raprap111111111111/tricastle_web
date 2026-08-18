<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import { AppCard, AppSearchBar } from '@shared/ui'
import { usePsgc } from '@shared/composables/usePsgc'
import { useApplicantStore } from '../stores/applicant.store'
import { groupApplicantsByDate } from '../utils/final-list.utils'
import ApplicantTable from '../components/ApplicantTable.vue'
import ExcelExportButton from '@shared/ui/export/ExcelExportButton.vue'
import type { FinalListGroupBy, BatchSummary } from '../types'

const props = defineProps<{
  folderKey: string
}>()

const router = useRouter()
const route  = useRoute()
const store  = useApplicantStore()

// ─── PSGC ──────────────────────────────────────────────
const {
  provinces: psgcProvinces,
  fetchAllProvinces,
  fetchCitiesByProvince,
  loadingProvinces,
  loadingCities,
} = usePsgc()

const psgcCities = ref<any[]>([])

// ─── Main filters ──────────────────────────────────────
const searchQuery    = ref('')
const selectedBatchId = ref<number | null>(null)

// ─── Advanced (staged) ─────────────────────────────────
const gender      = ref<string>('')
const civilStatus = ref<string>('')
const nationality = ref<string>('')
const qualityGrade = ref<string>('')
const city        = ref<string>('')
const province    = ref<string>('')
const address     = ref<string>('')

// ─── Applied advanced ──────────────────────────────────
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

// ─── Dialog visibility ─────────────────────────────────
const showAdvanced     = ref(false)
const showExportDialog = ref(false)

// ─── Export mode selection ─────────────────────────────
type ExportScope = 'current' | 'batch' | 'location' | 'status'
const exportScope     = ref<ExportScope>('current')
const exportBatchId   = ref<number | null>(null)
const exportLocation  = ref<string>('')
const exportStatus    = ref<string>('')

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

// ─── Load final_list applicants + PSGC ─────────────────
onMounted(async () => {
  store.resetFilters()
  store.setFilters({
    status:           'final_list',
    exclude_statuses: '',
    limit:            1000,
    offset:           0,
  })

  if (route.query.search)  searchQuery.value    = String(route.query.search)
  if (route.query.batchId) selectedBatchId.value = Number(route.query.batchId)

  await Promise.all([store.fetchApplicants(), fetchAllProvinces()])
})

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

// ─── Detect groupBy from folder key ────────────────────
const detectedGroupBy = computed<FinalListGroupBy>(() => {
  const key = props.folderKey
  if (/^\d{4}-W\d{2}$/.test(key))    return 'week'
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return 'day'
  if (/^\d{4}-\d{2}$/.test(key))     return 'month'
  if (/^\d{4}$/.test(key))           return 'year'
  return 'month'
})

// ─── Normalize applicants ──────────────────────────────
const applicants = computed(() =>
  store.applicants.map((a) => ({
    ...a,
    final_listed_at: a.final_listed_at ?? a.updated_at,
  })),
)

// ─── Find the folder ──────────────────────────────────
const folder = computed(() => {
  const folders = groupApplicantsByDate(applicants.value, detectedGroupBy.value)
  return folders.find((f) => f.key === props.folderKey)
})

// ─── Batches inside this folder ───────────────────────
const availableBatches = computed<BatchSummary[]>(() => {
  if (!folder.value) return []
  const map = new Map<number, BatchSummary>()
  folder.value.applicants.forEach((a) => {
    a.applicant_batches?.forEach((ab) => {
      if (ab.batch && !map.has(ab.batch.id)) map.set(ab.batch.id, ab.batch)
    })
  })
  return Array.from(map.values()).sort((a, b) => {
    if (a.is_active && !b.is_active) return -1
    if (!a.is_active && b.is_active) return 1
    return a.name.localeCompare(b.name)
  })
})

const batchOptions = computed(() => [
  { label: 'All Batches', value: null, isActive: false },
  ...availableBatches.value.map((b) => ({
    label:    `${b.name} (#${b.batch_number})${b.is_active ? ' • Active' : ''}`,
    value:    b.id,
    isActive: b.is_active ?? false,
  })),
])

// ─── Filtered applicants ──────────────────────────────
const filteredApplicants = computed(() => {
  if (!folder.value) return []
  let list = folder.value.applicants

  if (selectedBatchId.value) {
    list = list.filter((a) =>
      a.applicant_batches?.some((ab) => ab.batch_id === selectedBatchId.value),
    )
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((a) => {
      const fullName = `${a.first_name} ${a.middle_name ?? ''} ${a.last_name}`.toLowerCase()
      return (
        fullName.includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.applicant_code?.toLowerCase().includes(q)
      )
    })
  }

  const adv = appliedAdvanced.value
  if (adv.gender)        list = list.filter((a) => a.gender?.toLowerCase() === adv.gender)
  if (adv.civil_status)  list = list.filter((a) => a.civil_status?.toLowerCase() === adv.civil_status)
  if (adv.nationality)   list = list.filter((a) => a.nationality === adv.nationality)
  if (adv.quality_grade) list = list.filter((a) => a.quality_grade === adv.quality_grade)

  if (adv.province) {
    const target = adv.province.toLowerCase()
    list = list.filter((a) => {
      const rec = a as Record<string, any>
      return (
        rec.current_province === adv.province ||
        rec.permanent_province === adv.province ||
        (rec.current_address ?? '').toLowerCase().includes(target) ||
        (rec.permanent_address ?? '').toLowerCase().includes(target)
      )
    })
  }

  if (adv.city) {
    const target = adv.city.toLowerCase()
    list = list.filter((a) => {
      const rec = a as Record<string, any>
      return (
        rec.current_city === adv.city ||
        rec.permanent_city === adv.city ||
        (rec.current_address ?? '').toLowerCase().includes(target) ||
        (rec.permanent_address ?? '').toLowerCase().includes(target)
      )
    })
  }

  if (adv.address) {
    const keyword = adv.address.toLowerCase()
    list = list.filter((a) => {
      const rec = a as Record<string, any>
      return (
        (rec.current_address ?? '').toLowerCase().includes(keyword) ||
        (rec.permanent_address ?? '').toLowerCase().includes(keyword)
      )
    })
  }

  return list
})

// ─── Export helpers ───────────────────────────────────
/**
 * Build the list that will be exported depending on the chosen scope.
 */
const exportApplicants = computed(() => {
  if (!folder.value) return []

  switch (exportScope.value) {
    case 'current':
      // Respect the active search / filter so "what you see is what you export"
      return filteredApplicants.value

    case 'batch':
      if (!exportBatchId.value) return folder.value.applicants
      return folder.value.applicants.filter((a) =>
        a.applicant_batches?.some((ab) => ab.batch_id === exportBatchId.value),
      )

    case 'location':
      if (!exportLocation.value) return folder.value.applicants
      return folder.value.applicants.filter((a) => {
        const rec = a as Record<string, any>
        const loc = exportLocation.value.toLowerCase()
        return (
          (rec.province ?? '').toLowerCase() === loc ||
          (rec.city     ?? '').toLowerCase() === loc ||
          (rec.current_address  ?? '').toLowerCase().includes(loc) ||
          (rec.permanent_address ?? '').toLowerCase().includes(loc)
        )
      })

    case 'status':
      if (!exportStatus.value) return folder.value.applicants
      return folder.value.applicants.filter(
        (a) => (a as any).status === exportStatus.value,
      )

    default:
      return filteredApplicants.value
  }
})

/** Unique provinces present in this folder */
const folderProvinces = computed(() => {
  if (!folder.value) return []
  const set = new Set<string>()
  folder.value.applicants.forEach((a) => {
    const rec = a as Record<string, any>
    if (rec.province) set.add(rec.province)
    if (rec.city)     set.add(rec.city)
  })
  return Array.from(set).sort()
})

/** Unique statuses present in this folder */
const folderStatuses = computed(() => {
  if (!folder.value) return []
  const set = new Set<string>()
  folder.value.applicants.forEach((a) => {
    if ((a as any).status) set.add((a as any).status)
  })
  return Array.from(set).sort()
})

// ─── Misc filter helpers (unchanged) ──────────────────
const appliedAdvancedCount = computed(() => Object.keys(appliedAdvanced.value).length)

const hasFilters = computed(
  () =>
    searchQuery.value !== '' ||
    selectedBatchId.value !== null ||
    appliedAdvancedCount.value > 0,
)

const stagedAdvancedCount = computed(() => {
  let count = 0
  if (gender.value)             count++
  if (civilStatus.value)        count++
  if (nationality.value)        count++
  if (qualityGrade.value)       count++
  if (city.value.trim())        count++
  if (province.value)           count++
  if (address.value.trim())     count++
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
    if (advanced[k as keyof AdvancedFilters] === undefined)
      delete advanced[k as keyof AdvancedFilters]
  })
  appliedAdvanced.value = advanced
  showAdvanced.value    = false
}

function clearAdvanced() {
  gender.value        = ''
  civilStatus.value   = ''
  nationality.value   = ''
  qualityGrade.value  = ''
  city.value          = ''
  province.value      = ''
  address.value       = ''
  psgcCities.value    = []
  appliedAdvanced.value = {}
}

const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []
  if (searchQuery.value.trim())
    filters.push({ key: 'search', label: 'Search', value: searchQuery.value })
  if (selectedBatchId.value !== null) {
    const found = batchOptions.value.find((o) => o.value === selectedBatchId.value)
    if (found) filters.push({ key: 'batch', label: 'Batch', value: found.label })
  }
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
  if (key === 'search') { searchQuery.value = ''; return }
  if (key === 'batch')  { selectedBatchId.value = null; return }

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
      delete appliedAdvanced.value.city
      break
    case 'address': address.value = ''; break
  }
  delete appliedAdvanced.value[key as keyof AdvancedFilters]
}

function onSearch(value: string) { searchQuery.value = value.trim() }

function resetFilters() {
  searchQuery.value    = ''
  selectedBatchId.value = null
  clearAdvanced()
}

function goBack() { router.push({ name: 'applicants.final-list' }) }

// ─── Export dialog handlers ───────────────────────────
function openExportDialog() {
  // Pre-fill scope defaults from current active filters
  exportScope.value    = 'current'
  exportBatchId.value  = selectedBatchId.value
  exportLocation.value = appliedAdvanced.value.province ?? appliedAdvanced.value.city ?? ''
  exportStatus.value   = ''
  showExportDialog.value = true
}

function closeExportDialog() {
  showExportDialog.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Loading ─────────────────────────────────── -->
    <template v-if="store.loading">
      <Skeleton height="60px"  border-radius="12px" />
      <Skeleton height="400px" border-radius="16px" />
    </template>

    <!-- ─── Not Found ──────────────────────────────── -->
    <template v-else-if="!folder">
      <div class="text-center py-16">
        <i class="pi pi-folder-open text-4xl text-blueberry-300 mb-3" />
        <p class="text-blueberry-500">Folder not found</p>
        <Button label="Back to Final List" icon="pi pi-arrow-left" text class="mt-4" @click="goBack" />
      </div>
    </template>

    <!-- ─── Folder Contents ────────────────────────── -->
    <template v-else>

      <!-- Header -->
      <header class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <Button icon="pi pi-arrow-left" text rounded @click="goBack" />
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-apricot-100 to-apricot-200
                        flex items-center justify-center">
              <i class="pi pi-folder-open text-2xl text-apricot-600" />
            </div>
            <div>
              <h1 class="text-3xl font-serif font-semibold text-blueberry-800">
                {{ folder.label }}
              </h1>
              <p class="text-sm text-blueberry-500 mt-1">
                {{ filteredApplicants.length }} of {{ folder.count }}
                applicant{{ folder.count > 1 ? 's' : '' }} in final list
              </p>
            </div>
          </div>
        </div>

        <!-- ✅ Export Button -->
        <Button
          label="Export Excel"
          icon="pi pi-file-excel"
          severity="secondary"
          outlined
          @click="openExportDialog"
        />
      </header>

      <!-- ─── Filters ──────────────────────────────── -->
      <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">
        <div class="flex flex-wrap items-center gap-3">

          <!-- Search -->
          <AppSearchBar
            v-model="searchQuery"
            placeholder="Search by name, email, or code..."
            button-label=""
            class="flex-1 min-w-[280px]"
            @search="onSearch"
          />

          <!-- Batch Filter -->
          <div class="min-w-[240px]">
            <Select
              v-model="selectedBatchId"
              :options="batchOptions"
              option-label="label"
              option-value="value"
              placeholder="Filter by batch..."
              class="w-full"
              show-clear
            >
              <template #option="{ option }">
                <div class="flex items-center gap-2 w-full">
                  <i
                    v-if="option.value === null"
                    class="pi pi-list text-blueberry-400 text-xs"
                  />
                  <i
                    v-else
                    class="pi pi-graduation-cap text-xs"
                    :class="option.isActive ? 'text-green-500' : 'text-blueberry-400'"
                  />
                  <span class="flex-1 truncate">{{ option.label }}</span>
                  <span
                    v-if="option.isActive"
                    class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium"
                  >
                    ACTIVE
                  </span>
                </div>
              </template>
              <template #value="{ value, placeholder }">
                <div v-if="value" class="flex items-center gap-2">
                  <i
                    class="pi pi-graduation-cap text-xs"
                    :class="batchOptions.find(o => o.value === value)?.isActive
                      ? 'text-green-500' : 'text-blueberry-400'"
                  />
                  <span class="truncate">
                    {{ batchOptions.find(o => o.value === value)?.label }}
                  </span>
                </div>
                <span v-else class="text-blueberry-400">{{ placeholder }}</span>
              </template>
            </Select>
          </div>

          <!-- Advanced button -->
          <Button severity="secondary" outlined @click="showAdvanced = true">
            <template #default>
              <i class="pi pi-sliders-h mr-2" />
              <span>Advanced</span>
              <span
                v-if="appliedAdvancedCount > 0"
                class="ml-2 px-1.5 py-0.5 rounded-full bg-apricot-500 text-white
                       text-[10px] font-bold min-w-[20px] text-center"
              >
                {{ appliedAdvancedCount }}
              </span>
            </template>
          </Button>

          <!-- Reset -->
          <Button
            v-if="hasFilters"
            icon="pi pi-refresh"
            severity="secondary"
            text rounded
            v-tooltip.top="'Reset all filters'"
            @click="resetFilters"
          />
        </div>

        <!-- Active filter chips -->
        <div
          v-if="hasFilters"
          class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100"
        >
          <span class="text-xs text-blueberry-500 font-medium">Active:</span>
          <span
            v-for="f in activeFilters"
            :key="f.key"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700
                   rounded-full text-xs font-medium ring-1 ring-apricot-200"
          >
            <span class="font-semibold">{{ f.label }}:</span>
            <span>{{ f.value }}</span>
            <button
              type="button"
              class="ml-0.5 hover:text-apricot-900 transition-colors"
              @click="removeFilter(f.key)"
            >
              <i class="pi pi-times text-[10px]" />
            </button>
          </span>
        </div>
      </div>

      <!-- ─── Table ─────────────────────────────────── -->
      <AppCard :padding="'none'" :shadow="'soft'">
        <ApplicantTable
          :applicants="filteredApplicants"
          :pagination="null"
          :loading="store.loading"
          :submitting="false"
          @page-change="() => {}"
          @limit-change="() => {}"
          @delete="() => {}"
        />
      </AppCard>

      <!-- ─── Empty after filtering ─────────────────── -->
      <div
        v-if="filteredApplicants.length === 0 && !store.loading && hasFilters"
        class="text-center py-8 bg-white border border-dashed border-appleCore-200 rounded-xl"
      >
        <i class="pi pi-filter-slash text-3xl text-blueberry-300 mb-2" />
        <p class="text-sm text-blueberry-500 mb-2">No applicants match your filters</p>
        <Button label="Clear Filters" icon="pi pi-times" text @click="resetFilters" />
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════
         🎯 Advanced Filter Dialog
    ════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showAdvanced"
      modal
      :draggable="false"
      :dismissable-mask="false"
      :closable="false"
      :style="{ width: '500px' }"
      :pt="{
        root:    { class: 'rounded-2xl overflow-hidden' },
        header:  { class: '!p-0' },
        content: { class: '!p-0' },
      }"
    >
      <template #container>
        <div class="bg-white rounded-2xl overflow-hidden">
          <!-- Header -->
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
              <button
                v-if="stagedAdvancedCount > 0"
                type="button"
                class="text-[11px] text-red-500 hover:text-red-700 hover:underline"
                @click="clearAdvanced"
              >
                Clear
              </button>
              <button
                type="button"
                class="w-7 h-7 rounded-full flex items-center justify-center
                       hover:bg-appleCore-100 text-blueberry-500"
                @click="showAdvanced = false"
              >
                <i class="pi pi-times text-xs" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <!-- Demographics -->
            <div>
              <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider
                         mb-2 flex items-center gap-1.5">
                <i class="pi pi-user text-blueberry-400 text-xs" />
                Demographics
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Gender</label>
                  <Select v-model="gender" :options="genderOptions"
                    option-label="label" option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Civil Status</label>
                  <Select v-model="civilStatus" :options="civilStatusOptions"
                    option-label="label" option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Nationality</label>
                  <Select v-model="nationality" :options="nationalityOptions"
                    option-label="label" option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Quality Grade</label>
                  <Select v-model="qualityGrade" :options="qualityGradeOptions"
                    option-label="label" option-value="value" class="w-full" size="small" />
                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="pt-4 border-t border-appleCore-100">
              <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider
                         mb-2 flex items-center gap-1.5">
                <i class="pi pi-map-marker text-apricot-500 text-xs" />
                Location
              </p>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>Province</span>
                    <span v-if="!loadingProvinces && psgcProvinces.length > 0"
                      class="text-[10px] text-blueberry-400 font-normal">
                      ({{ psgcProvinces.length }} available)
                    </span>
                  </label>
                  <Select
                    v-model="province"
                    :options="provinceOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="loadingProvinces ? 'Loading provinces...' : 'Select province...'"
                    class="w-full"
                    size="small"
                    filter
                    show-clear
                    :loading="loadingProvinces"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>City / Municipality</span>
                    <span v-if="province && !loadingCities && psgcCities.length > 0"
                      class="text-[10px] text-blueberry-400 font-normal">
                      ({{ psgcCities.length }} available)
                    </span>
                    <i v-if="loadingCities" class="pi pi-spin pi-spinner text-[10px] text-apricot-500" />
                  </label>
                  <Select
                    v-model="city"
                    :options="cityOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="!province
                      ? 'Select province first...'
                      : loadingCities
                        ? 'Loading cities...'
                        : 'Select city or municipality...'"
                    class="w-full"
                    size="small"
                    filter
                    show-clear
                    :loading="loadingCities"
                    :disabled="!province || loadingCities"
                  >
                    <template #option="{ option }">
                      <div class="flex items-center gap-2 w-full">
                        <i v-if="option.value === ''" class="pi pi-list text-blueberry-400 text-xs" />
                        <i v-else class="pi pi-building text-blueberry-400 text-xs" />
                        <span class="flex-1 truncate">{{ option.label }}</span>
                        <span v-if="option.isCity"
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                          CITY
                        </span>
                        <span v-else-if="option.isMunicipality"
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                          MUN.
                        </span>
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
                    <InputText
                      v-model="address"
                      placeholder="e.g. Bonifacio Street..."
                      class="w-full !pl-9"
                      size="small"
                      @keyup.enter="applyAdvanced"
                    />
                  </div>
                  <p class="text-[10px] text-blueberry-400 mt-1 flex items-center gap-1">
                    <i class="pi pi-info-circle text-[9px]" />
                    Searches both current and permanent address
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-2 px-5 py-4
                       border-t border-appleCore-100 bg-appleCore-50/50">
            <span class="text-xs text-blueberry-500">
              <span v-if="stagedAdvancedCount > 0">
                <strong class="text-apricot-600">{{ stagedAdvancedCount }}</strong>
                {{ stagedAdvancedCount === 1 ? 'filter' : 'filters' }} staged
              </span>
              <span v-if="hasUnsavedChanges" class="ml-1 text-amber-600">(unsaved)</span>
            </span>
            <div class="flex items-center gap-2">
              <Button label="Cancel" severity="secondary" text size="small" @click="showAdvanced = false" />
              <Button
                label="Apply Filters"
                icon="pi pi-check"
                size="small"
                class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500"
                @click="applyAdvanced"
              />
            </div>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- ═══════════════════════════════════════════════════
         📊 Export Dialog
    ════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showExportDialog"
      modal
      :draggable="false"
      :dismissable-mask="true"
      :closable="false"
      :style="{ width: '480px' }"
      :pt="{
        root:    { class: 'rounded-2xl overflow-hidden' },
        header:  { class: '!p-0' },
        content: { class: '!p-0' },
      }"
    >
      <template #container>
        <div class="bg-white rounded-2xl overflow-hidden">

          <!-- Dialog Header -->
          <div class="flex items-center justify-between p-5 border-b border-appleCore-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <i class="pi pi-file-excel text-green-600 text-lg" />
              </div>
              <div>
                <p class="text-sm font-semibold text-blueberry-800">Export to Excel</p>
                <p class="text-[11px] text-blueberry-500">
                  Choose what to export from <strong>{{ folder?.label }}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              class="w-7 h-7 rounded-full flex items-center justify-center
                     hover:bg-appleCore-100 text-blueberry-500"
              @click="closeExportDialog"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>

          <!-- Dialog Body -->
          <div class="p-5 space-y-4">

            <!-- Scope selector -->
            <div>
              <p class="text-xs font-bold text-blueberry-500 uppercase tracking-wider mb-3">
                Export Scope
              </p>
              <div class="grid grid-cols-2 gap-2">

                <!-- Current view -->
                <button
                  type="button"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="exportScope === 'current'
                    ? 'border-apricot-400 bg-apricot-50'
                    : 'border-appleCore-100 hover:border-appleCore-300'"
                  @click="exportScope = 'current'"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="exportScope === 'current' ? 'bg-apricot-100' : 'bg-appleCore-100'">
                      <i class="pi pi-table text-xs"
                        :class="exportScope === 'current' ? 'text-apricot-600' : 'text-blueberry-500'" />
                    </div>
                    <span class="text-xs font-semibold text-blueberry-800">Current View</span>
                  </div>
                  <p class="text-[11px] text-blueberry-500 leading-snug">
                    Export exactly what's shown now
                    ({{ filteredApplicants.length }} applicants)
                  </p>
                </button>

                <!-- By Batch -->
                <button
                  type="button"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="exportScope === 'batch'
                    ? 'border-apricot-400 bg-apricot-50'
                    : 'border-appleCore-100 hover:border-appleCore-300'"
                  @click="exportScope = 'batch'"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="exportScope === 'batch' ? 'bg-apricot-100' : 'bg-appleCore-100'">
                      <i class="pi pi-sitemap text-xs"
                        :class="exportScope === 'batch' ? 'text-apricot-600' : 'text-blueberry-500'" />
                    </div>
                    <span class="text-xs font-semibold text-blueberry-800">By Batch</span>
                  </div>
                  <p class="text-[11px] text-blueberry-500 leading-snug">
                    Filter by a specific batch assignment
                  </p>
                </button>

                <!-- By Location -->
                <button
                  type="button"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="exportScope === 'location'
                    ? 'border-apricot-400 bg-apricot-50'
                    : 'border-appleCore-100 hover:border-appleCore-300'"
                  @click="exportScope = 'location'"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="exportScope === 'location' ? 'bg-apricot-100' : 'bg-appleCore-100'">
                      <i class="pi pi-map-marker text-xs"
                        :class="exportScope === 'location' ? 'text-apricot-600' : 'text-blueberry-500'" />
                    </div>
                    <span class="text-xs font-semibold text-blueberry-800">By Location</span>
                  </div>
                  <p class="text-[11px] text-blueberry-500 leading-snug">
                    Group sheets by province / city
                  </p>
                </button>

                <!-- By Status -->
                <button
                  type="button"
                  class="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all"
                  :class="exportScope === 'status'
                    ? 'border-apricot-400 bg-apricot-50'
                    : 'border-appleCore-100 hover:border-appleCore-300'"
                  @click="exportScope = 'status'"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center"
                      :class="exportScope === 'status' ? 'bg-apricot-100' : 'bg-appleCore-100'">
                      <i class="pi pi-tag text-xs"
                        :class="exportScope === 'status' ? 'text-apricot-600' : 'text-blueberry-500'" />
                    </div>
                    <span class="text-xs font-semibold text-blueberry-800">By Status</span>
                  </div>
                  <p class="text-[11px] text-blueberry-500 leading-snug">
                    One sheet per applicant status
                  </p>
                </button>
              </div>
            </div>

            <!-- Scope sub-options -->

            <!-- Batch picker -->
            <div v-if="exportScope === 'batch'" class="pt-2">
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                Select Batch
              </label>
              <Select
                v-model="exportBatchId"
                :options="[
                  { label: 'All Batches', value: null },
                  ...availableBatches.map(b => ({
                    label: `${b.name} (#${b.batch_number})`,
                    value: b.id,
                  }))
                ]"
                option-label="label"
                option-value="value"
                placeholder="Choose a batch..."
                class="w-full"
                size="small"
              />
              <p class="text-[11px] text-blueberry-400 mt-1">
                Leave blank to export all batches
              </p>
            </div>

            <!-- Location picker -->
            <div v-if="exportScope === 'location'" class="pt-2">
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                Filter by Province / City
                <span class="text-blueberry-400 font-normal">(optional)</span>
              </label>
              <Select
                v-model="exportLocation"
                :options="[
                  { label: 'All Locations (grouped by province)', value: '' },
                  ...folderProvinces.map(l => ({ label: l, value: l }))
                ]"
                option-label="label"
                option-value="value"
                placeholder="All locations..."
                class="w-full"
                size="small"
                filter
                show-clear
              />
              <p class="text-[11px] text-blueberry-400 mt-1">
                Each province gets its own sheet when exporting all
              </p>
            </div>

            <!-- Status picker -->
            <div v-if="exportScope === 'status'" class="pt-2">
              <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                Filter by Status
                <span class="text-blueberry-400 font-normal">(optional)</span>
              </label>
              <Select
                v-model="exportStatus"
                :options="[
                  { label: 'All Statuses (one sheet each)', value: '' },
                  ...folderStatuses.map(s => ({
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

            <!-- Preview count -->
            <div class="flex items-center gap-2 px-3 py-2 bg-appleCore-50 rounded-lg">
              <i class="pi pi-info-circle text-blueberry-400 text-xs" />
              <p class="text-xs text-blueberry-600">
                <strong class="text-blueberry-800">{{ exportApplicants.length }}</strong>
                applicant{{ exportApplicants.length !== 1 ? 's' : '' }} will be exported
              </p>
            </div>
          </div>

          <!-- Dialog Footer -->
          <div class="flex items-center justify-end gap-2 px-5 py-4
                       border-t border-appleCore-100 bg-appleCore-50/50">
            <Button
              label="Cancel"
              severity="secondary"
              text
              size="small"
              @click="closeExportDialog"
            />
            <ExcelExportButton
              :mode="exportScope === 'batch' ? 'batch'
                   : exportScope === 'location' ? 'location'
                   : exportScope === 'status' ? 'status'
                   : 'list'"
              :applicants="exportApplicants"
              :batch-id="exportBatchId ?? undefined"
              :batch-name="availableBatches.find(b => b.id === exportBatchId)?.name
                         ?? folder?.label"
              :location="exportLocation || folder?.label"
              :status="exportStatus || undefined"
              label="Download .xlsx"
              @exported="closeExportDialog"
            />
          </div>
        </div>
      </template>
    </Dialog>

  </div>
</template>