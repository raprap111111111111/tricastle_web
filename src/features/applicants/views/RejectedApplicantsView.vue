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

const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const store = useApplicantStore()

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
const gender = ref<string>('')
const civilStatus = ref<string>('')
const nationality = ref<string>('')
const qualityGrade = ref<string>('')
const city = ref<string>('')
const province = ref<string>('')
const address = ref<string>('')

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
const showAdvanced = ref(false)

// ─── Options ───────────────────────────────────────────
const genderOptions = [
  { label: 'All Genders', value: '' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

const civilStatusOptions = [
  { label: 'All Civil Status', value: '' },
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Widowed', value: 'widowed' },
  { label: 'Separated', value: 'separated' },
  { label: 'Divorced', value: 'divorced' },
]

const nationalityOptions = [
  { label: 'All Nationalities', value: '' },
  { label: 'Filipino', value: 'Filipino' },
  { label: 'American', value: 'American' },
  { label: 'Japanese', value: 'Japanese' },
  { label: 'Chinese', value: 'Chinese' },
  { label: 'Korean', value: 'Korean' },
]

const qualityGradeOptions = [
  { label: 'All Grades', value: '' },
  { label: 'Grade A', value: 'A' },
  { label: 'Grade B', value: 'B' },
  { label: 'Grade C', value: 'C' },
  { label: 'Grade D', value: 'D' },
  { label: 'Grade F', value: 'F' },
]

const provinceOptions = computed(() => [
  { label: 'All Provinces', value: '' },
  ...psgcProvinces.value.map((p) => ({
    label: p.name,
    value: p.name,
  })),
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
    city.value = ''
    return
  }

  const provinceObj = psgcProvinces.value.find((p) => p.name === newProvince)
  if (provinceObj) {
    psgcCities.value = await fetchCitiesByProvince(provinceObj.code)
    city.value = ''
  }
})

// ─── Load only REJECTED applicants ─────────────────────
async function loadRejected() {
  store.setFilters({
    search: '',
    status: 'rejected',
    gender: '',
    civil_status: '',
    nationality: '',
    quality_grade: '',
    assigned_staff_id: '',
    exclude_statuses: '',
    batch_id: '',
    batch_status: '',
    offset: 0,
    limit: 10,
  } as any)

  await store.fetchApplicants()
}

onMounted(async () => {
  await Promise.all([
    loadRejected(),
    fetchAllProvinces(),
  ])
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
    gender: gender.value || undefined,
    civil_status: civilStatus.value || undefined,
    nationality: nationality.value || undefined,
    quality_grade: qualityGrade.value || undefined,
    city: city.value.trim() || undefined,
    province: province.value || undefined,
    address: address.value.trim() || undefined,
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
  gender.value = ''
  civilStatus.value = ''
  nationality.value = ''
  qualityGrade.value = ''
  city.value = ''
  province.value = ''
  address.value = ''
  psgcCities.value = []
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
  if (gender.value) count++
  if (civilStatus.value) count++
  if (nationality.value) count++
  if (qualityGrade.value) count++
  if (city.value.trim()) count++
  if (province.value) count++
  if (address.value.trim()) count++
  return count
})

const hasUnsavedChanges = computed(() => {
  const current = JSON.stringify({
    gender: gender.value || undefined,
    civil_status: civilStatus.value || undefined,
    nationality: nationality.value || undefined,
    quality_grade: qualityGrade.value || undefined,
    city: city.value.trim() || undefined,
    province: province.value || undefined,
    address: address.value.trim() || undefined,
  })
  const applied = JSON.stringify({
    gender: appliedAdvanced.value.gender || undefined,
    civil_status: appliedAdvanced.value.civil_status || undefined,
    nationality: appliedAdvanced.value.nationality || undefined,
    quality_grade: appliedAdvanced.value.quality_grade || undefined,
    city: appliedAdvanced.value.city || undefined,
    province: appliedAdvanced.value.province || undefined,
    address: appliedAdvanced.value.address || undefined,
  })
  return current !== applied
})

const hasFilters = computed(
  () => searchQuery.value !== '' || appliedAdvancedCount.value > 0,
)

// ─── Active chips ──────────────────────────────────────
const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []

  if (searchQuery.value.trim()) {
    filters.push({ key: 'search', label: 'Search', value: searchQuery.value })
  }

  const adv = appliedAdvanced.value
  if (adv.gender) filters.push({ key: 'gender', label: 'Gender', value: adv.gender })
  if (adv.civil_status) filters.push({ key: 'civil_status', label: 'Civil', value: adv.civil_status })
  if (adv.nationality) filters.push({ key: 'nationality', label: 'Nationality', value: adv.nationality })
  if (adv.quality_grade) filters.push({ key: 'quality_grade', label: 'Grade', value: adv.quality_grade })
  if (adv.city) filters.push({ key: 'city', label: 'City', value: adv.city })
  if (adv.province) filters.push({ key: 'province', label: 'Province', value: adv.province })
  if (adv.address) filters.push({ key: 'address', label: 'Address', value: adv.address })

  return filters
})

function removeFilter(key: string) {
  if (key === 'search') {
    searchQuery.value = ''
  } else {
    switch (key) {
      case 'gender': gender.value = ''; break
      case 'civil_status': civilStatus.value = ''; break
      case 'nationality': nationality.value = ''; break
      case 'quality_grade': qualityGrade.value = ''; break
      case 'city': city.value = ''; break
      case 'province':
        province.value = ''
        psgcCities.value = []
        city.value = ''
        break
      case 'address': address.value = ''; break
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

// 👇 Row click handler — makes entire row clickable
function onRowClick(event: DataTableRowClickEvent) {
  // Ignore clicks on buttons or interactive elements
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return

  goToView((event.data as Applicant).id)
}

function handleRestore(applicant: Applicant) {
  confirm.require({
    header: 'Restore Applicant',
    message: `Restore ${applicant.first_name} ${applicant.last_name} back to Pending status?`,
    icon: 'pi pi-refresh',
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
          summary: 'Restored',
          detail: `${applicant.applicant_code} is back in the review queue`,
          life: 4000,
        })
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Failed',
          detail: e?.response?.data?.message ?? 'Could not restore applicant',
          life: 4000,
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
  } catch {
    return '—'
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

      <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined :loading="store.loading"
        @click="loadRejected" />
    </header>

    <!-- ─── Stats ──────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AppStatCard label="Total Rejected" :value="store.pagination?.total ?? 0" icon="pi pi-times-circle"
        variant="apricot" />
      <div class="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-xl">
        <i class="pi pi-info-circle text-red-500 text-2xl" />
        <div>
          <p class="text-sm font-semibold text-red-800">Rejection Reasons</p>
          <p class="text-xs text-red-600 mt-0.5">
            Hover over each row to see the rejection reason
          </p>
        </div>
      </div>
    </div>

    <!-- ─── Filters ────────────────────────────────── -->
    <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">

      <!-- Row 1: Search + Advanced + Reset -->
      <div class="flex flex-wrap items-center gap-3">

        <!-- Search -->
        <AppSearchBar v-model="searchQuery" placeholder="Search by name, email, or code..." button-label=""
          class="flex-1 min-w-[280px]" @search="onSearch" />

        <!-- Advanced -->
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

        <!-- Reset -->
        <Button v-if="hasFilters" icon="pi pi-refresh" severity="secondary" text rounded
          v-tooltip.top="'Reset all filters'" @click="resetAll" />
      </div>

      <!-- Active filter chips -->
      <div v-if="hasFilters" class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100">
        <span class="text-xs text-blueberry-500 font-medium">Active:</span>

        <span v-for="f in activeFilters" :key="f.key" class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700
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
              <span class="text-xs text-blueberry-400">
                {{ data.email }}
              </span>
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
            <span class="text-sm text-blueberry-600">
              {{ formatDate(data.rejected_at) }}
            </span>
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

    <!-- 🎯 Advanced Filter Dialog -->
    <Dialog v-model:visible="showAdvanced" modal :draggable="false" :dismissable-mask="false" :closable="false"
      :style="{ width: '500px' }" :pt="{
        root: { class: 'rounded-2xl overflow-hidden' },
        header: { class: '!p-0' },
        content: { class: '!p-0' },
      }">
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

          <!-- Body -->
          <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <!-- Demographics -->
            <div>
              <p
                class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="pi pi-user text-blueberry-400 text-xs" />
                Demographics
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Gender</label>
                  <Select v-model="gender" :options="genderOptions" option-label="label" option-value="value"
                    class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Civil Status</label>
                  <Select v-model="civilStatus" :options="civilStatusOptions" option-label="label" option-value="value"
                    class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Nationality</label>
                  <Select v-model="nationality" :options="nationalityOptions" option-label="label" option-value="value"
                    class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Quality Grade</label>
                  <Select v-model="qualityGrade" :options="qualityGradeOptions" option-label="label"
                    option-value="value" class="w-full" size="small" />
                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="pt-4 border-t border-appleCore-100">
              <p
                class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="pi pi-map-marker text-apricot-500 text-xs" />
                Location
              </p>

              <div class="space-y-3">
                <!-- Province -->
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>Province</span>
                    <span v-if="!loadingProvinces && psgcProvinces.length > 0"
                      class="text-[10px] text-blueberry-400 font-normal">
                      ({{ psgcProvinces.length }} available)
                    </span>
                  </label>
                  <Select v-model="province" :options="provinceOptions" option-label="label" option-value="value"
                    :placeholder="loadingProvinces ? 'Loading provinces...' : 'Select province...'" class="w-full"
                    size="small" filter show-clear :loading="loadingProvinces" />
                </div>

                <!-- City -->
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>City / Municipality</span>
                    <span v-if="province && !loadingCities && psgcCities.length > 0"
                      class="text-[10px] text-blueberry-400 font-normal">
                      ({{ psgcCities.length }} available)
                    </span>
                    <i v-if="loadingCities" class="pi pi-spin pi-spinner text-[10px] text-apricot-500" />
                  </label>
                  <Select v-model="city" :options="cityOptions" option-label="label" option-value="value" :placeholder="!province
                    ? 'Select province first...'
                    : loadingCities
                      ? 'Loading cities...'
                      : 'Select city or municipality...'
                    " class="w-full" size="small" filter show-clear :loading="loadingCities"
                    :disabled="!province || loadingCities">
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

                <!-- Address keyword -->
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Address Keyword</label>
                  <div class="relative">
                    <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-blueberry-400 text-xs z-10" />
                    <InputText v-model="address" placeholder="e.g. Bonifacio Street..." class="w-full !pl-9"
                      size="small" @keyup.enter="applyAdvanced" />
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
          <div
            class="flex items-center justify-between gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
            <span class="text-xs text-blueberry-500">
              <span v-if="stagedAdvancedCount > 0">
                <strong class="text-apricot-600">{{ stagedAdvancedCount }}</strong>
                {{ stagedAdvancedCount === 1 ? 'filter' : 'filters' }} staged
              </span>
              <span v-if="hasUnsavedChanges" class="ml-1 text-amber-600">
                (unsaved)
              </span>
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
  </div>
</template>