<!-- src/features/applicants/components/ApplicantFilters.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import { AppSearchBar } from '@shared/ui'
import { usePsgc } from '@shared/composables/usePsgc'
import type {
  ApplicantFilters as IFilters,
  ApplicantStatus,
  ApplicantGender,
  CivilStatus,
  QualityGrade,
} from '../types'

const emit = defineEmits<{
  (e: 'filter', value: Partial<IFilters>): void
  (e: 'reset'): void
}>()

// ─── PSGC (Philippine geographic data) ────────────────
const {
  provinces: psgcProvinces,
  fetchAllProvinces,
  fetchCitiesByProvince,
  loadingProvinces,
  loadingCities,
} = usePsgc()

const psgcCities = ref<any[]>([])

// ─── Main filters ─────────────────────────────────────
const search = ref('')
const status = ref<ApplicantStatus | ''>('')

// ─── Advanced (staged) ────────────────────────────────
const gender       = ref<ApplicantGender | ''>('')
const civilStatus  = ref<CivilStatus | ''>('')
const nationality  = ref<string>('')
const qualityGrade = ref<QualityGrade | ''>('')
const city         = ref<string>('')
const province     = ref<string>('')
const address      = ref<string>('')

const appliedAdvanced = ref<Partial<IFilters>>({})

// 🔥 Simple boolean for Dialog visibility
const showAdvanced = ref(false)

// ─── Options ──────────────────────────────────────────
const statusOptions = [
  { label: 'All Status',   value: '' },
  { label: 'Pending',      value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Verified',     value: 'verified' },
  { label: 'Incomplete',   value: 'incomplete' },
]

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

// ─── Watch province → load cities ─────────────────────
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

// ─── Handlers ─────────────────────────────────────────
function onSearch(value: string) {
  emit('filter', {
    ...appliedAdvanced.value,
    search: value.trim() || undefined,
    status: status.value || undefined,
  })
}

function onStatusChange() {
  emit('filter', {
    ...appliedAdvanced.value,
    search: search.value.trim() || undefined,
    status: status.value || undefined,
  })
}

function applyAdvanced() {
  const advanced: Partial<IFilters> = {
    gender:        gender.value || undefined,
    civil_status:  civilStatus.value || undefined,
    nationality:   nationality.value || undefined,
    quality_grade: qualityGrade.value || undefined,
    city:          city.value.trim() || undefined,
    province:      province.value || undefined,
    address:       address.value.trim() || undefined,
  }

  Object.keys(advanced).forEach((k) => {
    if (advanced[k as keyof IFilters] === undefined) {
      delete advanced[k as keyof IFilters]
    }
  })

  appliedAdvanced.value = advanced

  emit('filter', {
    ...advanced,
    search: search.value.trim() || undefined,
    status: status.value || undefined,
  })

  showAdvanced.value = false
}

function clearAdvanced() {
  gender.value       = ''
  civilStatus.value  = ''
  nationality.value  = ''
  qualityGrade.value = ''
  city.value         = ''
  province.value     = ''
  address.value      = ''
  psgcCities.value   = []
  appliedAdvanced.value = {}

  emit('filter', {
    search: search.value.trim() || undefined,
    status: status.value || undefined,
  })
}

function resetAll() {
  search.value       = ''
  status.value       = ''
  gender.value       = ''
  civilStatus.value  = ''
  nationality.value  = ''
  qualityGrade.value = ''
  city.value         = ''
  province.value     = ''
  address.value      = ''
  psgcCities.value   = []
  appliedAdvanced.value = {}
  emit('reset')
}

// ─── Counts ───────────────────────────────────────────
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

const appliedAdvancedCount = computed(() => Object.keys(appliedAdvanced.value).length)

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

// ─── Active chips ─────────────────────────────────────
const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []
  if (search.value.trim())                 filters.push({ key: 'search',        label: 'Search',      value: search.value })
  if (status.value)                        filters.push({ key: 'status',        label: 'Status',      value: status.value.replace(/_/g, ' ') })
  if (appliedAdvanced.value.gender)        filters.push({ key: 'gender',        label: 'Gender',      value: appliedAdvanced.value.gender })
  if (appliedAdvanced.value.civil_status)  filters.push({ key: 'civil_status',  label: 'Civil',       value: appliedAdvanced.value.civil_status })
  if (appliedAdvanced.value.nationality)   filters.push({ key: 'nationality',   label: 'Nationality', value: appliedAdvanced.value.nationality })
  if (appliedAdvanced.value.quality_grade) filters.push({ key: 'quality_grade', label: 'Grade',       value: appliedAdvanced.value.quality_grade })
  if (appliedAdvanced.value.city)          filters.push({ key: 'city',          label: 'City',        value: appliedAdvanced.value.city })
  if (appliedAdvanced.value.province)      filters.push({ key: 'province',      label: 'Province',    value: appliedAdvanced.value.province })
  if (appliedAdvanced.value.address)       filters.push({ key: 'address',       label: 'Address',     value: appliedAdvanced.value.address })
  return filters
})

const hasActiveFilters = computed(() => activeFilters.value.length > 0)

function removeFilter(key: string) {
  switch (key) {
    case 'search':
      search.value = ''
      onSearch('')
      break
    case 'status':
      status.value = ''
      onStatusChange()
      break
    default:
      switch (key) {
        case 'gender':         gender.value = '';       break
        case 'civil_status':   civilStatus.value = '';  break
        case 'nationality':    nationality.value = '';  break
        case 'quality_grade':  qualityGrade.value = ''; break
        case 'city':           city.value = '';         break
        case 'province':
          province.value = ''
          psgcCities.value = []
          city.value = ''
          break
        case 'address':        address.value = '';      break
      }
      delete appliedAdvanced.value[key as keyof IFilters]
      if (key === 'province') {
        delete appliedAdvanced.value.city
      }
      emit('filter', {
        ...appliedAdvanced.value,
        search: search.value.trim() || undefined,
        status: status.value || undefined,
      })
      break
  }
}

// ─── Lifecycle ────────────────────────────────────────
onMounted(async () => {
  await fetchAllProvinces()
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Main Row -->
    <div class="flex flex-wrap items-center gap-3">
      <AppSearchBar
        v-model="search"
        placeholder="Search name, email, or code..."
        button-label=""
        class="flex-1 min-w-[280px]"
        @search="onSearch"
      />

      <Select
        v-model="status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="All Status"
        class="w-48"
        @change="onStatusChange"
      />

      <Button
        severity="secondary"
        outlined
        @click="showAdvanced = true"
      >
        <template #default>
          <i class="pi pi-sliders-h mr-2" />
          <span>Advanced</span>
          <span
            v-if="appliedAdvancedCount > 0"
            class="ml-2 px-1.5 py-0.5 rounded-full bg-apricot-500 text-white text-[10px] font-bold min-w-[20px] text-center"
          >
            {{ appliedAdvancedCount }}
          </span>
        </template>
      </Button>

      <Button
        v-if="hasActiveFilters"
        icon="pi pi-refresh"
        severity="secondary"
        text
        rounded
        v-tooltip.top="'Reset all filters'"
        @click="resetAll"
      />
    </div>

    <!-- Active Chips -->
    <div
      v-if="hasActiveFilters"
      class="flex flex-wrap items-center gap-2"
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

    <!-- 🎯 Advanced Filter DIALOG (replaces Popover) -->
    <Dialog
      v-model:visible="showAdvanced"
      modal
      :draggable="false"
      :dismissable-mask="false"
      :closable="false"
      :style="{ width: '500px' }"
      :pt="{
        root: { class: 'rounded-2xl overflow-hidden' },
        header: { class: '!p-0' },
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
                class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
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
              <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="pi pi-user text-blueberry-400 text-xs" />
                Demographics
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Gender</label>
                  <Select
                    v-model="gender"
                    :options="genderOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                    size="small"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Civil Status</label>
                  <Select
                    v-model="civilStatus"
                    :options="civilStatusOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                    size="small"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Nationality</label>
                  <Select
                    v-model="nationality"
                    :options="nationalityOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                    size="small"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Quality Grade</label>
                  <Select
                    v-model="qualityGrade"
                    :options="qualityGradeOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="pt-4 border-t border-appleCore-100">
              <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="pi pi-map-marker text-apricot-500 text-xs" />
                Location
              </p>

              <div class="space-y-3">
                <!-- Province -->
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>Province</span>
                    <span
                      v-if="!loadingProvinces && psgcProvinces.length > 0"
                      class="text-[10px] text-blueberry-400 font-normal"
                    >
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

                <!-- City -->
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>City / Municipality</span>
                    <span
                      v-if="province && !loadingCities && psgcCities.length > 0"
                      class="text-[10px] text-blueberry-400 font-normal"
                    >
                      ({{ psgcCities.length }} available)
                    </span>
                    <i
                      v-if="loadingCities"
                      class="pi pi-spin pi-spinner text-[10px] text-apricot-500"
                    />
                  </label>
                  <Select
                    v-model="city"
                    :options="cityOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="
                      !province
                        ? 'Select province first...'
                        : loadingCities
                        ? 'Loading cities...'
                        : 'Select city or municipality...'
                    "
                    class="w-full"
                    size="small"
                    filter
                    show-clear
                    :loading="loadingCities"
                    :disabled="!province || loadingCities"
                  >
                    <template #option="{ option }">
                      <div class="flex items-center gap-2 w-full">
                        <i
                          v-if="option.value === ''"
                          class="pi pi-list text-blueberry-400 text-xs"
                        />
                        <i
                          v-else
                          class="pi pi-building text-blueberry-400 text-xs"
                        />
                        <span class="flex-1 truncate">{{ option.label }}</span>
                        <span
                          v-if="option.isCity"
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium"
                        >
                          CITY
                        </span>
                        <span
                          v-else-if="option.isMunicipality"
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium"
                        >
                          MUN.
                        </span>
                      </div>
                    </template>
                  </Select>
                  <p
                    v-if="!province"
                    class="text-[10px] text-blueberry-400 mt-1 flex items-center gap-1"
                  >
                    <i class="pi pi-info-circle text-[9px]" />
                    Choose a province to enable city selection
                  </p>
                </div>

                <!-- Address keyword -->
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
          <div class="flex items-center justify-between gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
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
              <Button
                label="Cancel"
                severity="secondary"
                text
                size="small"
                @click="showAdvanced = false"
              />
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
  </div>
</template>