<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Skeleton from 'primevue/skeleton'
import { AppCard, AppSearchBar, AppStatCard } from '@shared/ui'
import { usePsgc } from '@shared/composables/usePsgc'
import { useApplicantStore } from '../stores/applicant.store'
import { useBatchStore } from '@features/batches/stores/batch.store'
import ApplicantTable from '../components/ApplicantTable.vue'
import type { BatchSummary, Pagination, SkillCategory, JlptLevel } from '../types'

// 🚀 Deployment imports
import BulkDeployDialog from '@features/deployments/components/BulkDeployDialog.vue'
import { useDeployments } from '@features/deployments/composables/useDeployments'
import { useDeploymentStore } from '@features/deployments/stores/deployment.store'
import type { DeployApplicantPayload } from '@features/deployments/types'

const router = useRouter()
const store = useApplicantStore()
const batchStore = useBatchStore()
const deploymentStore = useDeploymentStore()
const { handleBulkDeploy } = useDeployments()

// ─── PSGC ──────────────────────────────────────────────────────────────────────
const {
  provinces: psgcProvinces,
  fetchAllProvinces,
  fetchCitiesByProvince,
  loadingProvinces,
  loadingCities,
} = usePsgc()

const psgcCities = ref<any[]>([])

// ─── Main filters ──────────────────────────────────────────────────────────────
const searchQuery = ref('')
const selectedBatchId = ref<number | null>(null)

// ─── Client-side pagination ────────────────────────────────────────────────────
const currentPage = ref(1)
const perPage = ref(10)

// ─── Bulk Deploy state ─────────────────────────────────────────────────────────
const selectedIds = ref<number[]>([])
const bulkDeployDialog = ref(false)

// ─── Advanced filter staged values ────────────────────────────────────────────
const gender = ref<string>('')
const civilStatus = ref<string>('')
const nationality = ref<string>('')
const qualityGrade = ref<string>('')
const city = ref<string>('')
const province = ref<string>('')
const address = ref<string>('')

// Phase 1 — Japan deployment staged filters
const skillCategory = ref<string>('')
const jlptLevel = ref<string>('')
const willingToBeDeployed = ref<string>('')  // '' | 'true' | 'false'
const japanDeploymentReady = ref<string>('')
const previousJapanExperience = ref<string>('')
const sswEligible = ref<string>('')

type AdvancedFilters = {
  gender?: string
  civil_status?: string
  nationality?: string
  quality_grade?: string
  city?: string
  province?: string
  address?: string
  // Phase 1
  skill_category?: string
  jlpt_level?: string
  willing_to_be_deployed?: string
  japan_deployment_ready?: string
  previous_japan_experience?: string
  ssw_eligible?: string
}

const appliedAdvanced = ref<AdvancedFilters>({})
const showAdvanced = ref(false)

// ─── Static options ────────────────────────────────────────────────────────────
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

// Phase 1 options
const skillCategoryOptions = [
  { label: 'All Skills', value: '' },
  { label: 'Skilled', value: 'skilled' },
  { label: 'Semi-Skilled', value: 'semi_skilled' },
  { label: 'Unskilled', value: 'unskilled' },
]

const jlptLevelOptions = [
  { label: 'Any JLPT', value: '' },
  { label: 'N1', value: 'N1' },
  { label: 'N2', value: 'N2' },
  { label: 'N3', value: 'N3' },
  { label: 'N4', value: 'N4' },
  { label: 'N5', value: 'N5' },
]

const booleanOptions = [
  { label: 'Any', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
]

// ─── PSGC computed options ─────────────────────────────────────────────────────
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

// ─── Data loading ──────────────────────────────────────────────────────────────
async function loadFinalList() {
  store.resetFilters()
  store.setFilters({
    status: 'final_list',
    exclude_statuses: '',
    limit: 1000,
    offset: 0,
  } as any)
  await store.fetchApplicants()
}

async function loadAllBatches() {
  batchStore.setFilters({ limit: 1000 } as any)
  await batchStore.fetchBatches()
}

onMounted(async () => {
  await Promise.all([
    loadFinalList(),
    fetchAllProvinces(),
    loadAllBatches(),
  ])
})

// ─── Province → cities cascade ────────────────────────────────────────────────
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

// ─── Reset page + selection on filter change ───────────────────────────────────
watch(
  [searchQuery, selectedBatchId, appliedAdvanced],
  () => {
    currentPage.value = 1
    selectedIds.value = []
  },
  { deep: true },
)

// ─── Batch options ─────────────────────────────────────────────────────────────
const availableBatches = computed<BatchSummary[]>(() =>
  [...batchStore.batches].sort((a, b) => {
    if (a.is_active && !b.is_active) return -1
    if (!a.is_active && b.is_active) return 1
    return a.name.localeCompare(b.name)
  }) as any,
)

const batchOptions = computed(() => {
  const countMap = new Map<number, number>()
  store.applicants.forEach((a) => {
    a.applicant_batches?.forEach((ab) => {
      if (ab.batch_id) {
        countMap.set(ab.batch_id, (countMap.get(ab.batch_id) ?? 0) + 1)
      }
    })
  })

  const items = availableBatches.value.map((b) => ({
    label: `${b.name} (#${b.batch_number})${b.is_active ? ' • Active' : ''}`,
    value: b.id,
    isActive: b.is_active ?? false,
    applicantCount: countMap.get(b.id) ?? 0,
  }))

  return [
    { label: 'All Batches', value: null, isActive: false, applicantCount: 0 },
    ...items,
  ]
})

// ─── Client-side filtering ────────────────────────────────────────────────────
const filteredApplicants = computed(() => {
  let list = store.applicants

  // Batch filter
  if (selectedBatchId.value) {
    list = list.filter((a) =>
      a.applicant_batches?.some((ab) => ab.batch_id === selectedBatchId.value),
    )
  }

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((a) => {
      const fullName = `${a.first_name} ${a.middle_name ?? ''} ${a.last_name}`.toLowerCase()
      return (
        fullName.includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.applicant_code?.toLowerCase().includes(q) ||
        a.trade_or_occupation?.toLowerCase().includes(q)
      )
    })
  }

  const adv = appliedAdvanced.value

  // Demographics
  if (adv.gender) {
    list = list.filter((a) => a.gender?.toLowerCase() === adv.gender)
  }
  if (adv.civil_status) {
    list = list.filter((a) => a.civil_status?.toLowerCase() === adv.civil_status)
  }
  if (adv.nationality) {
    list = list.filter((a) => a.nationality === adv.nationality)
  }
  if (adv.quality_grade) {
    list = list.filter((a) => a.quality_grade === adv.quality_grade)
  }

  // Location
  if (adv.province) {
    const target = adv.province.toLowerCase()
    list = list.filter((a) =>
      a.province === adv.province ||
      (a.current_address ?? '').toLowerCase().includes(target) ||
      (a.permanent_address ?? '').toLowerCase().includes(target),
    )
  }
  if (adv.city) {
    const target = adv.city.toLowerCase()
    list = list.filter((a) =>
      a.city === adv.city ||
      (a.current_address ?? '').toLowerCase().includes(target) ||
      (a.permanent_address ?? '').toLowerCase().includes(target),
    )
  }
  if (adv.address) {
    const keyword = adv.address.toLowerCase()
    list = list.filter((a) =>
      (a.current_address ?? '').toLowerCase().includes(keyword) ||
      (a.permanent_address ?? '').toLowerCase().includes(keyword),
    )
  }

  // Phase 1 — Japan deployment filters
  if (adv.skill_category) {
    list = list.filter((a) => a.skill_category === adv.skill_category)
  }
  if (adv.jlpt_level) {
    list = list.filter((a) => a.language?.jlpt_level === adv.jlpt_level)
  }
  if (adv.willing_to_be_deployed !== undefined && adv.willing_to_be_deployed !== '') {
    const want = adv.willing_to_be_deployed === 'true'
    list = list.filter((a) => Boolean(a.deployment?.willing_to_be_deployed) === want)
  }
  if (adv.japan_deployment_ready !== undefined && adv.japan_deployment_ready !== '') {
    const want = adv.japan_deployment_ready === 'true'
    list = list.filter((a) => Boolean(a.deployment?.japan_deployment_ready) === want)
  }
  if (adv.previous_japan_experience !== undefined && adv.previous_japan_experience !== '') {
    const want = adv.previous_japan_experience === 'true'
    list = list.filter((a) => Boolean(a.deployment?.previous_japan_experience) === want)
  }
  if (adv.ssw_eligible !== undefined && adv.ssw_eligible !== '') {
    const want = adv.ssw_eligible === 'true'
    list = list.filter((a) => Boolean(a.deployment?.ssw_eligible) === want)
  }

  return list
})

// ─── Pagination ────────────────────────────────────────────────────────────────
const paginatedApplicants = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredApplicants.value.slice(start, start + perPage.value)
})

const paginationInfo = computed<Pagination>(() => {
  const total = filteredApplicants.value.length
  const lastPage = Math.max(1, Math.ceil(total / perPage.value))
  const offset = (currentPage.value - 1) * perPage.value
  const from = total === 0 ? 0 : offset + 1
  const to = Math.min(offset + perPage.value, total)

  return {
    current_page: currentPage.value,
    last_page: lastPage,
    per_page: perPage.value,
    total,
    offset,
    limit: perPage.value,
    has_more: currentPage.value < lastPage,
    from,
    to,
  }
})

function onPageChange(page: number) { currentPage.value = page }
function onLimitChange(limit: number) { perPage.value = limit; currentPage.value = 1 }

// ─── Stats ─────────────────────────────────────────────────────────────────────
const totalFinalList = computed(() => store.applicants.length)

const thisMonthCount = computed(() => {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  return store.applicants.filter((a) => {
    const d = new Date(a.final_listed_at ?? a.updated_at)
    return d.getMonth() === month && d.getFullYear() === year
  }).length
})

const thisWeekCount = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  return store.applicants.filter((a) => {
    return new Date(a.final_listed_at ?? a.updated_at) >= startOfWeek
  }).length
})

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return store.applicants.filter((a) => {
    return new Date(a.final_listed_at ?? a.updated_at).toDateString() === today
  }).length
})

// Phase 1 stats
const japanReadyCount = computed(
  () => store.applicants.filter((a) => a.deployment?.japan_deployment_ready).length,
)

// ─── Filter state helpers ──────────────────────────────────────────────────────
const appliedAdvancedCount = computed(() => Object.keys(appliedAdvanced.value).length)

const hasFilters = computed(
  () => searchQuery.value !== '' || selectedBatchId.value !== null || appliedAdvancedCount.value > 0,
)

const stagedAdvancedCount = computed(() => {
  let count = 0
  if (gender.value) count++
  if (civilStatus.value) count++
  if (nationality.value) count++
  if (qualityGrade.value) count++
  if (city.value.trim()) count++
  if (province.value) count++
  if (address.value.trim()) count++
  if (skillCategory.value) count++
  if (jlptLevel.value) count++
  if (willingToBeDeployed.value) count++
  if (japanDeploymentReady.value) count++
  if (previousJapanExperience.value) count++
  if (sswEligible.value) count++
  return count
})

const hasUnsavedChanges = computed(() => {
  const staged = JSON.stringify({
    gender: gender.value || undefined,
    civil_status: civilStatus.value || undefined,
    nationality: nationality.value || undefined,
    quality_grade: qualityGrade.value || undefined,
    city: city.value.trim() || undefined,
    province: province.value || undefined,
    address: address.value.trim() || undefined,
    skill_category: skillCategory.value || undefined,
    jlpt_level: jlptLevel.value || undefined,
    willing_to_be_deployed: willingToBeDeployed.value || undefined,
    japan_deployment_ready: japanDeploymentReady.value || undefined,
    previous_japan_experience: previousJapanExperience.value || undefined,
    ssw_eligible: sswEligible.value || undefined,
  })
  const applied = JSON.stringify({
    gender: appliedAdvanced.value.gender || undefined,
    civil_status: appliedAdvanced.value.civil_status || undefined,
    nationality: appliedAdvanced.value.nationality || undefined,
    quality_grade: appliedAdvanced.value.quality_grade || undefined,
    city: appliedAdvanced.value.city || undefined,
    province: appliedAdvanced.value.province || undefined,
    address: appliedAdvanced.value.address || undefined,
    skill_category: appliedAdvanced.value.skill_category || undefined,
    jlpt_level: appliedAdvanced.value.jlpt_level || undefined,
    willing_to_be_deployed: appliedAdvanced.value.willing_to_be_deployed || undefined,
    japan_deployment_ready: appliedAdvanced.value.japan_deployment_ready || undefined,
    previous_japan_experience: appliedAdvanced.value.previous_japan_experience || undefined,
    ssw_eligible: appliedAdvanced.value.ssw_eligible || undefined,
  })
  return staged !== applied
})

// ─── Advanced filter handlers ──────────────────────────────────────────────────
function applyAdvanced() {
  const advanced: AdvancedFilters = {
    gender: gender.value || undefined,
    civil_status: civilStatus.value || undefined,
    nationality: nationality.value || undefined,
    quality_grade: qualityGrade.value || undefined,
    city: city.value.trim() || undefined,
    province: province.value || undefined,
    address: address.value.trim() || undefined,
    skill_category: skillCategory.value || undefined,
    jlpt_level: jlptLevel.value || undefined,
    willing_to_be_deployed: willingToBeDeployed.value || undefined,
    japan_deployment_ready: japanDeploymentReady.value || undefined,
    previous_japan_experience: previousJapanExperience.value || undefined,
    ssw_eligible: sswEligible.value || undefined,
  }

  // Drop undefined keys
  Object.keys(advanced).forEach((k) => {
    if (advanced[k as keyof AdvancedFilters] === undefined) {
      delete advanced[k as keyof AdvancedFilters]
    }
  })

  appliedAdvanced.value = advanced
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
  skillCategory.value = ''
  jlptLevel.value = ''
  willingToBeDeployed.value = ''
  japanDeploymentReady.value = ''
  previousJapanExperience.value = ''
  sswEligible.value = ''
  psgcCities.value = []
  appliedAdvanced.value = {}
}

// ─── Active filter chips ───────────────────────────────────────────────────────
const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []

  if (searchQuery.value.trim()) {
    filters.push({ key: 'search', label: 'Search', value: searchQuery.value })
  }
  if (selectedBatchId.value !== null) {
    const found = batchOptions.value.find((o) => o.value === selectedBatchId.value)
    if (found) filters.push({ key: 'batch', label: 'Batch', value: found.label })
  }

  const adv = appliedAdvanced.value
  if (adv.gender) filters.push({ key: 'gender', label: 'Gender', value: adv.gender })
  if (adv.civil_status) filters.push({ key: 'civil_status', label: 'Civil', value: adv.civil_status })
  if (adv.nationality) filters.push({ key: 'nationality', label: 'Nationality', value: adv.nationality })
  if (adv.quality_grade) filters.push({ key: 'quality_grade', label: 'Grade', value: adv.quality_grade })
  if (adv.city) filters.push({ key: 'city', label: 'City', value: adv.city })
  if (adv.province) filters.push({ key: 'province', label: 'Province', value: adv.province })
  if (adv.address) filters.push({ key: 'address', label: 'Address', value: adv.address })
  if (adv.skill_category) filters.push({ key: 'skill_category', label: 'Skill', value: adv.skill_category })
  if (adv.jlpt_level) filters.push({ key: 'jlpt_level', label: 'JLPT', value: adv.jlpt_level })
  if (adv.willing_to_be_deployed) filters.push({ key: 'willing_to_be_deployed', label: 'Willing', value: adv.willing_to_be_deployed === 'true' ? 'Yes' : 'No' })
  if (adv.japan_deployment_ready) filters.push({ key: 'japan_deployment_ready', label: 'JP Ready', value: adv.japan_deployment_ready === 'true' ? 'Yes' : 'No' })
  if (adv.previous_japan_experience) filters.push({ key: 'previous_japan_experience', label: 'JP Experience', value: adv.previous_japan_experience === 'true' ? 'Yes' : 'No' })
  if (adv.ssw_eligible) filters.push({ key: 'ssw_eligible', label: 'SSW', value: adv.ssw_eligible === 'true' ? 'Yes' : 'No' })

  return filters
})

function removeFilter(key: string) {
  switch (key) {
    case 'search': searchQuery.value = ''; break
    case 'batch': selectedBatchId.value = null; break
    case 'gender': gender.value = ''; break
    case 'civil_status': civilStatus.value = ''; break
    case 'nationality': nationality.value = ''; break
    case 'quality_grade': qualityGrade.value = ''; break
    case 'city': city.value = ''; break
    case 'province':
      province.value = ''
      psgcCities.value = []
      city.value = ''
      delete appliedAdvanced.value.city
      break
    case 'address': address.value = ''; break
    case 'skill_category': skillCategory.value = ''; break
    case 'jlpt_level': jlptLevel.value = ''; break
    case 'willing_to_be_deployed': willingToBeDeployed.value = ''; break
    case 'japan_deployment_ready': japanDeploymentReady.value = ''; break
    case 'previous_japan_experience': previousJapanExperience.value = ''; break
    case 'ssw_eligible': sswEligible.value = ''; break
  }
  delete appliedAdvanced.value[key as keyof AdvancedFilters]
}

function onSearch(value: string) { searchQuery.value = value.trim() }

function resetFilters() {
  searchQuery.value = ''
  selectedBatchId.value = null
  clearAdvanced()
  currentPage.value = 1
  selectedIds.value = []
}

function goBack() { router.push({ name: 'applicants.index' }) }

// ─── Bulk Deploy ───────────────────────────────────────────────────────────────
const selectedApplicantBatchIds = computed<number[]>(() =>
  store.applicants
    .filter((a) => selectedIds.value.includes(a.id))
    .map((a) => a.applicant_batches?.[0]?.id)
    .filter((id): id is number => id !== undefined),
)

const deployableCount = computed(() => selectedApplicantBatchIds.value.length)
const nonDeployableCount = computed(() => selectedIds.value.length - deployableCount.value)

function openBulkDeploy() {
  if (selectedApplicantBatchIds.value.length === 0) return
  bulkDeployDialog.value = true
}

async function onBulkDeploySubmit(payload: DeployApplicantPayload) {
  const success = await handleBulkDeploy({
    ...payload,
    applicant_batch_ids: selectedApplicantBatchIds.value,
  })

  if (success) {
    bulkDeployDialog.value = false

    const deployedIds = selectedIds.value.filter((id) => {
      const applicant = store.applicants.find((a) => a.id === id)
      return applicant?.applicant_batches?.[0]?.id !== undefined
    })

    store.applicants = store.applicants.filter((a) => !deployedIds.includes(a.id))
    selectedIds.value = []
    await loadFinalList()
  }
}

function clearSelection() { selectedIds.value = [] }
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ──────────────────────────────────────────────────────────── -->
    <header class="flex flex-col sm:flex-row items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <Button icon="pi pi-arrow-left" text rounded @click="goBack" />
        <div>
          <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
            Final List
          </h1>
          <p class="text-sm text-blueberry-500 mt-1">
            All approved applicants ready for batch assignment
          </p>
        </div>
      </div>
      <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined :loading="store.loading"
        @click="loadFinalList" />
    </header>

    <!-- ─── Stats ───────────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Final List" :value="totalFinalList" icon="pi pi-check-circle" variant="green" />
      <AppStatCard label="This Month" :value="thisMonthCount" icon="pi pi-calendar" variant="blueberry" />
      <AppStatCard label="This Week" :value="thisWeekCount" icon="pi pi-calendar-plus" variant="apricot" />
      <AppStatCard label="Japan Ready" :value="japanReadyCount" icon="pi pi-send" variant="citrus" />
    </div>

    <!-- ─── Filters ─────────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">

      <!-- Row 1: Search + Batch + Advanced + Reset -->
      <div class="flex flex-wrap items-center gap-3">
        <AppSearchBar v-model="searchQuery" placeholder="Search by name, email, code, or trade..." button-label=""
          class="flex-1 min-w-[280px]" @search="onSearch" />

        <!-- Batch Filter -->
        <div class="min-w-[240px]">
          <Select v-model="selectedBatchId" :options="batchOptions" option-label="label" option-value="value"
            placeholder="Filter by batch..." class="w-full" show-clear>
            <template #option="{ option }">
              <div class="flex items-center gap-2 w-full">
                <i v-if="option.value === null" class="pi pi-list text-blueberry-400 text-xs" />
                <i v-else class="pi pi-graduation-cap text-xs"
                  :class="option.isActive ? 'text-green-500' : 'text-blueberry-400'" />
                <span class="flex-1 truncate">{{ option.label }}</span>
                <span v-if="option.value !== null"
                  class="text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[24px] text-center" :class="option.applicantCount > 0
                    ? 'bg-apricot-100 text-apricot-700'
                    : 'bg-blueberry-50 text-blueberry-400'">
                  {{ option.applicantCount }}
                </span>
                <span v-if="option.isActive"
                  class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  ACTIVE
                </span>
              </div>
            </template>
            <template #value="{ value, placeholder }">
              <div v-if="value" class="flex items-center gap-2">
                <i class="pi pi-graduation-cap text-xs" :class="batchOptions.find(o => o.value === value)?.isActive
                  ? 'text-green-500'
                  : 'text-blueberry-400'" />
                <span class="truncate">{{batchOptions.find(o => o.value === value)?.label}}</span>
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
            <span v-if="appliedAdvancedCount > 0" class="ml-2 px-1.5 py-0.5 rounded-full bg-apricot-500 text-white
                     text-[10px] font-bold min-w-[20px] text-center">
              {{ appliedAdvancedCount }}
            </span>
          </template>
        </Button>

        <Button v-if="hasFilters" icon="pi pi-refresh" severity="secondary" text rounded
          v-tooltip.top="'Reset all filters'" @click="resetFilters" />
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

    <!-- ─── Bulk Actions Bar ─────────────────────────────────────────────────── -->
    <div v-if="selectedIds.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4
             bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200
             rounded-xl shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
          <i class="pi pi-check-square text-white" />
        </div>
        <div>
          <p class="text-sm font-semibold text-green-900">
            {{ selectedIds.length }} applicant{{ selectedIds.length > 1 ? 's' : '' }} selected
          </p>
          <p class="text-xs text-green-700 mt-0.5">
            <span v-if="deployableCount > 0">
              <strong>{{ deployableCount }}</strong> ready to deploy
            </span>
            <span v-if="nonDeployableCount > 0" class="text-amber-700 ml-2">
              ⚠️ {{ nonDeployableCount }} without batch (will be skipped)
            </span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Button label="Clear Selection" icon="pi pi-times" severity="secondary" text size="small"
          @click="clearSelection" />
        <Button :label="`Deploy Selected (${deployableCount})`" icon="pi pi-send" :disabled="deployableCount === 0"
          :loading="deploymentStore.submitting"
          class="!bg-green-600 hover:!bg-green-700 !border-green-600 !text-white !shadow-sm" @click="openBulkDeploy" />
      </div>
    </div>

    <!-- ─── Loading skeleton ─────────────────────────────────────────────────── -->
    <template v-if="store.loading && store.applicants.length === 0">
      <Skeleton height="400px" border-radius="16px" />
    </template>

    <!-- ─── Table ────────────────────────────────────────────────────────────── -->
    <AppCard v-else :padding="'none'" :shadow="'soft'">
      <ApplicantTable :applicants="paginatedApplicants" :pagination="paginationInfo" :loading="store.loading"
        :submitting="false" :selectable="true" v-model:selectedIds="selectedIds" @page-change="onPageChange"
        @limit-change="onLimitChange" @delete="() => { }" />
    </AppCard>

    <!-- ─── Empty state ──────────────────────────────────────────────────────── -->
    <div v-if="filteredApplicants.length === 0 && !store.loading && hasFilters"
      class="text-center py-8 bg-white border border-dashed border-appleCore-200 rounded-xl">
      <i class="pi pi-filter-slash text-3xl text-blueberry-300 mb-2" />
      <p class="text-sm text-blueberry-500 mb-2">No applicants match your filters</p>
      <Button label="Clear Filters" icon="pi pi-times" text @click="resetFilters" />
    </div>

    <!-- ─── Advanced Filter Dialog ───────────────────────────────────────────── -->
    <Dialog v-model:visible="showAdvanced" modal :draggable="false" :dismissable-mask="false" :closable="false"
      :style="{ width: '560px' }" :pt="{
        root: { class: 'rounded-2xl overflow-hidden' },
        header: { class: '!p-0' },
        content: { class: '!p-0' },
      }">
      <template #container>
        <div class="bg-white rounded-2xl overflow-hidden">

          <!-- Dialog Header -->
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
                Clear all
              </button>
              <button type="button" class="w-7 h-7 rounded-full flex items-center justify-center
                       hover:bg-appleCore-100 text-blueberry-500" @click="showAdvanced = false">
                <i class="pi pi-times text-xs" />
              </button>
            </div>
          </div>

          <!-- Dialog Body -->
          <div class="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

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

            <!-- Japan Deployment (Phase 1) -->
            <div class="pt-4 border-t border-appleCore-100">
              <p
                class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="pi pi-send text-apricot-500 text-xs" />
                Japan Deployment
              </p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Skill Category</label>
                  <Select v-model="skillCategory" :options="skillCategoryOptions" option-label="label"
                    option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">JLPT Level</label>
                  <Select v-model="jlptLevel" :options="jlptLevelOptions" option-label="label" option-value="value"
                    class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Willing to Deploy</label>
                  <Select v-model="willingToBeDeployed" :options="booleanOptions" option-label="label"
                    option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Japan Ready</label>
                  <Select v-model="japanDeploymentReady" :options="booleanOptions" option-label="label"
                    option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Japan Experience</label>
                  <Select v-model="previousJapanExperience" :options="booleanOptions" option-label="label"
                    option-value="value" class="w-full" size="small" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">SSW Eligible</label>
                  <Select v-model="sswEligible" :options="booleanOptions" option-label="label" option-value="value"
                    class="w-full" size="small" />
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
                  <Select v-model="city" :options="cityOptions" option-label="label" option-value="value"
                    :placeholder="!province ? 'Select province first...' : loadingCities ? 'Loading cities...' : 'Select city...'"
                    class="w-full" size="small" filter show-clear :loading="loadingCities"
                    :disabled="!province || loadingCities">
                    <template #option="{ option }">
                      <div class="flex items-center gap-2 w-full">
                        <i v-if="option.value === ''" class="pi pi-list text-blueberry-400 text-xs" />
                        <i v-else class="pi pi-building text-blueberry-400 text-xs" />
                        <span class="flex-1 truncate">{{ option.label }}</span>
                        <span v-if="option.isCity"
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">CITY</span>
                        <span v-else-if="option.isMunicipality"
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">MUN.</span>
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

          <!-- Dialog Footer -->
          <div
            class="flex items-center justify-between gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
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

    <!-- 🚀 Bulk Deploy Dialog -->
    <BulkDeployDialog v-model:visible="bulkDeployDialog" :applicant-batch-ids="selectedApplicantBatchIds"
      :submitting="deploymentStore.submitting" @submit="onBulkDeploySubmit" />
  </div>
</template>