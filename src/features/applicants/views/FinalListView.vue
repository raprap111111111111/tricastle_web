<!-- src/features/applicants/views/FinalListView.vue -->

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'
import { AppCard } from '@shared/ui'
import { useApplicantStore } from '../stores/applicant.store'
import { useBatchStore } from '@features/batches/stores/batch.store'
import ApplicantTable from '../components/ApplicantTable.vue'
import type { BatchSummary } from '../types'

// 🚀 Deployment
import BulkDeployDialog from '@features/deployments/components/BulkDeployDialog.vue'
import { useDeployments } from '@features/deployments/composables/useDeployments'
import { useDeploymentStore } from '@features/deployments/stores/deployment.store'
import type { DeployApplicantPayload } from '@features/deployments/types'

// 📚 Composables
import { useFinalListFilters }    from '../composables/useFinalListFilters'
import { useFinalListPagination } from '../composables/useFinalListPagination'
import { useFinalListStats }      from '../composables/useFinalListStats'
import { useExcelExportDialog }   from '../composables/useExcelExportDialog'
import { useBulkAISDialog }       from '../composables/useBulkAISDialog'

// 🧩 Child components
import FinalListHeader         from '../components/final-list/FinalListHeader.vue'
import FinalListStats          from '../components/final-list/FinalListStats.vue'
import FinalListFilterBar      from '../components/final-list/FinalListFilterBar.vue'
import FinalListBulkActionsBar from '../components/final-list/FinalListBulkActionsBar.vue'
import AdvancedFiltersDialog   from '../components/final-list/AdvancedFiltersDialog.vue'
import ExcelExportDialog       from '../components/final-list/ExcelExportDialog.vue'
import BulkAISDialog           from '../components/final-list/BulkAISDialog.vue'

// ═══════════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════════

const router          = useRouter()
const store           = useApplicantStore()
const batchStore      = useBatchStore()
const deploymentStore = useDeploymentStore()
const { handleBulkDeploy } = useDeployments()

// ─── Filters composable ─────────────────────────────────────────────────────
const filters = useFinalListFilters()

// ─── Selection state ────────────────────────────────────────────────────────
const selectedIds = ref<number[]>([])

// ─── Data loading ───────────────────────────────────────────────────────────
async function loadFinalList(): Promise<void> {
  store.resetFilters()
  store.setFilters({
    status:           'final_list',
    exclude_statuses: '',
    limit:            1000,
    offset:           0,
  } as any)
  await store.fetchApplicants()
}

async function loadAllBatches(): Promise<void> {
  batchStore.setFilters({ limit: 1000 } as any)
  await batchStore.fetchBatches()
}

onMounted(async () => {
  await Promise.all([
    loadFinalList(),
    filters.fetchAllProvinces(),
    loadAllBatches(),
  ])
})

// ═══════════════════════════════════════════════════════════════════════════
// BATCH OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

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
      if (ab.batch_id) countMap.set(ab.batch_id, (countMap.get(ab.batch_id) ?? 0) + 1)
    })
  })

  const items = availableBatches.value.map((b) => ({
    label:          `${b.name} (#${b.batch_number})${b.is_active ? ' • Active' : ''}`,
    value:          b.id,
    isActive:       b.is_active ?? false,
    applicantCount: countMap.get(b.id) ?? 0,
  }))

  return [
    { label: 'All Batches', value: null, isActive: false, applicantCount: 0 },
    ...items,
  ]
})

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT-SIDE FILTERING
// ═══════════════════════════════════════════════════════════════════════════

const filteredApplicants = computed(() => {
  let list = store.applicants

  if (filters.selectedBatchId.value) {
    list = list.filter((a) =>
      a.applicant_batches?.some((ab) => ab.batch_id === filters.selectedBatchId.value),
    )
  }

  if (filters.searchQuery.value.trim()) {
    const q = filters.searchQuery.value.toLowerCase()
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

  const adv = filters.appliedAdvanced.value

  if (adv.gender)        list = list.filter((a) => a.gender?.toLowerCase() === adv.gender)
  if (adv.civil_status)  list = list.filter((a) => a.civil_status?.toLowerCase() === adv.civil_status)
  if (adv.nationality)   list = list.filter((a) => a.nationality === adv.nationality)
  if (adv.quality_grade) list = list.filter((a) => a.quality_grade === adv.quality_grade)

  if (adv.province) {
    const target = adv.province.toLowerCase()
    list = list.filter((a) =>
      a.province === adv.province ||
      (a.current_address   ?? '').toLowerCase().includes(target) ||
      (a.permanent_address ?? '').toLowerCase().includes(target),
    )
  }

  if (adv.city) {
    const target = adv.city.toLowerCase()
    list = list.filter((a) =>
      a.city === adv.city ||
      (a.current_address   ?? '').toLowerCase().includes(target) ||
      (a.permanent_address ?? '').toLowerCase().includes(target),
    )
  }

  if (adv.address) {
    const keyword = adv.address.toLowerCase()
    list = list.filter((a) =>
      (a.current_address   ?? '').toLowerCase().includes(keyword) ||
      (a.permanent_address ?? '').toLowerCase().includes(keyword),
    )
  }

  if (adv.skill_category) list = list.filter((a) => a.skill_category === adv.skill_category)
  if (adv.jlpt_level)     list = list.filter((a) => a.language?.jlpt_level === adv.jlpt_level)

  if (adv.willing_to_be_deployed) {
    const want = adv.willing_to_be_deployed === 'true'
    list = list.filter((a) => Boolean(a.deployment?.willing_to_be_deployed) === want)
  }
  if (adv.japan_deployment_ready) {
    const want = adv.japan_deployment_ready === 'true'
    list = list.filter((a) => Boolean(a.deployment?.japan_deployment_ready) === want)
  }
  if (adv.previous_japan_experience) {
    const want = adv.previous_japan_experience === 'true'
    list = list.filter((a) => Boolean(a.deployment?.previous_japan_experience) === want)
  }
  if (adv.ssw_eligible) {
    const want = adv.ssw_eligible === 'true'
    list = list.filter((a) => Boolean(a.deployment?.ssw_eligible) === want)
  }

  return list
})

// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION + STATS
// ═══════════════════════════════════════════════════════════════════════════

const pagination = useFinalListPagination(filteredApplicants)
const stats      = useFinalListStats(computed(() => store.applicants))

// Reset page + selection when filters change
watch(
  [filters.searchQuery, filters.selectedBatchId, filters.appliedAdvanced],
  () => {
    pagination.reset()
    selectedIds.value = []
  },
  { deep: true },
)

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVE FILTER CHIPS
// ═══════════════════════════════════════════════════════════════════════════

const activeFilters = computed(() => {
  const list: { key: string; label: string; value: string }[] = []

  if (filters.searchQuery.value.trim()) {
    list.push({ key: 'search', label: 'Search', value: filters.searchQuery.value })
  }
  if (filters.selectedBatchId.value !== null) {
    const found = batchOptions.value.find((o) => o.value === filters.selectedBatchId.value)
    if (found) list.push({ key: 'batch', label: 'Batch', value: found.label })
  }

  const adv = filters.appliedAdvanced.value
  if (adv.gender)                    list.push({ key: 'gender',                    label: 'Gender',        value: adv.gender })
  if (adv.civil_status)              list.push({ key: 'civil_status',              label: 'Civil',         value: adv.civil_status })
  if (adv.nationality)               list.push({ key: 'nationality',               label: 'Nationality',   value: adv.nationality })
  if (adv.quality_grade)             list.push({ key: 'quality_grade',             label: 'Grade',         value: adv.quality_grade })
  if (adv.city)                      list.push({ key: 'city',                      label: 'City',          value: adv.city })
  if (adv.province)                  list.push({ key: 'province',                  label: 'Province',      value: adv.province })
  if (adv.address)                   list.push({ key: 'address',                   label: 'Address',       value: adv.address })
  if (adv.skill_category)            list.push({ key: 'skill_category',            label: 'Skill',         value: adv.skill_category })
  if (adv.jlpt_level)                list.push({ key: 'jlpt_level',                label: 'JLPT',          value: adv.jlpt_level })
  if (adv.willing_to_be_deployed)    list.push({ key: 'willing_to_be_deployed',    label: 'Willing',       value: adv.willing_to_be_deployed === 'true' ? 'Yes' : 'No' })
  if (adv.japan_deployment_ready)    list.push({ key: 'japan_deployment_ready',    label: 'JP Ready',      value: adv.japan_deployment_ready === 'true' ? 'Yes' : 'No' })
  if (adv.previous_japan_experience) list.push({ key: 'previous_japan_experience', label: 'JP Experience', value: adv.previous_japan_experience === 'true' ? 'Yes' : 'No' })
  if (adv.ssw_eligible)              list.push({ key: 'ssw_eligible',              label: 'SSW',           value: adv.ssw_eligible === 'true' ? 'Yes' : 'No' })

  return list
})

function removeFilter(key: string): void {
  switch (key) {
    case 'search':                    filters.searchQuery.value = ''; break
    case 'batch':                     filters.selectedBatchId.value = null; break
    case 'gender':                    filters.gender.value = ''; break
    case 'civil_status':              filters.civilStatus.value = ''; break
    case 'nationality':               filters.nationality.value = ''; break
    case 'quality_grade':             filters.qualityGrade.value = ''; break
    case 'city':                      filters.city.value = ''; break
    case 'province':
      filters.province.value   = ''
      filters.psgcCities.value = []
      filters.city.value       = ''
      delete filters.appliedAdvanced.value.city
      break
    case 'address':                   filters.address.value = ''; break
    case 'skill_category':            filters.skillCategory.value = ''; break
    case 'jlpt_level':                filters.jlptLevel.value = ''; break
    case 'willing_to_be_deployed':    filters.willingToBeDeployed.value = ''; break
    case 'japan_deployment_ready':    filters.japanDeploymentReady.value = ''; break
    case 'previous_japan_experience': filters.previousJapanExperience.value = ''; break
    case 'ssw_eligible':              filters.sswEligible.value = ''; break
  }
  delete filters.appliedAdvanced.value[key as keyof typeof filters.appliedAdvanced.value]
}

function resetFilters(): void {
  filters.resetAll()
  pagination.reset()
  selectedIds.value = []
}

function goBack(): void { router.push({ name: 'applicants.index' }) }

// ═══════════════════════════════════════════════════════════════════════════
// BULK DEPLOY
// ═══════════════════════════════════════════════════════════════════════════

const bulkDeployDialog = ref(false)

const selectedApplicantBatchIds = computed<number[]>(() =>
  store.applicants
    .filter((a) => selectedIds.value.includes(a.id))
    .map((a) => a.applicant_batches?.[0]?.id)
    .filter((id): id is number => id !== undefined),
)

const deployableCount    = computed(() => selectedApplicantBatchIds.value.length)
const nonDeployableCount = computed(() => selectedIds.value.length - deployableCount.value)

function openBulkDeploy(): void {
  if (selectedApplicantBatchIds.value.length === 0) return
  bulkDeployDialog.value = true
}

async function onBulkDeploySubmit(payload: DeployApplicantPayload): Promise<void> {
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

// ═══════════════════════════════════════════════════════════════════════════
// EXCEL EXPORT + BULK AIS
// ═══════════════════════════════════════════════════════════════════════════

const excel = useExcelExportDialog(
  computed(() => store.applicants),
  filteredApplicants,
  availableBatches,
  filters.selectedBatchId,
  filters.appliedAdvanced,
)

const bulkAIS = useBulkAISDialog(
  computed(() => store.applicants),
  filteredApplicants,
  selectedIds,
  filters.selectedBatchId,
)
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Header ────────────────────────────────────────────────────────── -->
    <FinalListHeader
      :loading="store.loading"
      :has-applicants="store.applicants.length > 0"
      @back="goBack"
      @refresh="loadFinalList"
      @export="excel.openExportDialog"
      @bulk-a-i-s="bulkAIS.openBulkAISDialog"
    />

    <!-- ─── Stats ─────────────────────────────────────────────────────────── -->
    <FinalListStats
      :total="stats.totalFinalList.value"
      :month="stats.thisMonthCount.value"
      :week="stats.thisWeekCount.value"
      :japan-ready="stats.japanReadyCount.value"
    />

    <!-- ─── Filter Bar ────────────────────────────────────────────────────── -->
    <FinalListFilterBar
      :search-query="filters.searchQuery.value"
      :selected-batch-id="filters.selectedBatchId.value"
      :batch-options="batchOptions"
      :applied-advanced-count="filters.appliedAdvancedCount.value"
      :has-filters="filters.hasFilters.value"
      :active-filters="activeFilters"
      @update:search-query="filters.searchQuery.value = $event"
      @update:selected-batch-id="filters.selectedBatchId.value = $event"
      @search="filters.onSearch"
      @open-advanced="filters.showAdvanced.value = true"
      @reset-all="resetFilters"
      @remove-filter="removeFilter"
    />

    <!-- ─── Bulk Actions Bar ──────────────────────────────────────────────── -->
    <FinalListBulkActionsBar
      :selected-count="selectedIds.length"
      :deployable-count="deployableCount"
      :non-deployable-count="nonDeployableCount"
      :submitting="deploymentStore.submitting"
      @clear="selectedIds = []"
      @deploy="openBulkDeploy"
    />

    <!-- ─── Table (or loading skeleton) ───────────────────────────────────── -->
    <template v-if="store.loading && store.applicants.length === 0">
      <Skeleton height="400px" border-radius="16px" />
    </template>

    <AppCard v-else :padding="'none'" :shadow="'soft'">
      <ApplicantTable
        :applicants="pagination.paginatedApplicants.value"
        :pagination="pagination.paginationInfo.value"
        :loading="store.loading"
        :submitting="false"
        :selectable="true"
        v-model:selectedIds="selectedIds"
        @page-change="pagination.onPageChange"
        @limit-change="pagination.onLimitChange"
        @delete="() => {}"
      />
    </AppCard>

    <!-- ─── Empty state ───────────────────────────────────────────────────── -->
    <div
      v-if="filteredApplicants.length === 0 && !store.loading && filters.hasFilters.value"
      class="text-center py-8 bg-white border border-dashed border-appleCore-200 rounded-xl"
    >
      <i class="pi pi-filter-slash text-3xl text-blueberry-300 mb-2" />
      <p class="text-sm text-blueberry-500 mb-2">No applicants match your filters</p>
      <Button label="Clear Filters" icon="pi pi-times" text @click="resetFilters" />
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         DIALOGS
    ═══════════════════════════════════════════════════════════════════════ -->

    <!-- 🎯 Advanced Filters -->
    <AdvancedFiltersDialog
      v-model:visible="filters.showAdvanced.value"
      v-model:gender="filters.gender.value"
      v-model:civil-status="filters.civilStatus.value"
      v-model:nationality="filters.nationality.value"
      v-model:quality-grade="filters.qualityGrade.value"
      v-model:city="filters.city.value"
      v-model:province="filters.province.value"
      v-model:address="filters.address.value"
      v-model:skill-category="filters.skillCategory.value"
      v-model:jlpt-level="filters.jlptLevel.value"
      v-model:willing-to-be-deployed="filters.willingToBeDeployed.value"
      v-model:japan-deployment-ready="filters.japanDeploymentReady.value"
      v-model:previous-japan-experience="filters.previousJapanExperience.value"
      v-model:ssw-eligible="filters.sswEligible.value"
      :gender-options="filters.genderOptions"
      :civil-status-options="filters.civilStatusOptions"
      :nationality-options="filters.nationalityOptions"
      :quality-grade-options="filters.qualityGradeOptions"
      :skill-category-options="filters.skillCategoryOptions"
      :jlpt-level-options="filters.jlptLevelOptions"
      :boolean-options="filters.booleanOptions"
      :province-options="filters.provinceOptions.value"
      :city-options="filters.cityOptions.value"
      :psgc-provinces="filters.psgcProvinces.value"
      :psgc-cities="filters.psgcCities.value"
      :loading-provinces="filters.loadingProvinces.value"
      :loading-cities="filters.loadingCities.value"
      :staged-advanced-count="filters.stagedAdvancedCount.value"
      :has-unsaved-changes="filters.hasUnsavedChanges.value"
      @apply="filters.applyAdvanced"
      @clear="filters.clearAdvanced"
    />

    <!-- 📊 Excel Export -->
    <ExcelExportDialog
      v-model:visible="excel.showExportDialog.value"
      v-model:export-scope="excel.exportScope.value"
      v-model:export-batch-id="excel.exportBatchId.value"
      v-model:export-location="excel.exportLocation.value"
      v-model:export-status="excel.exportStatus.value"
      :exporting="excel.exporting.value"
      :filtered-count="filteredApplicants.length"
      :export-count="excel.exportApplicants.value.length"
      :available-batches="availableBatches"
      :available-locations="excel.availableLocations.value"
      :available-statuses="excel.availableStatuses.value"
      :selected-column-keys="excel.selectedColumnKeys.value"
      :column-groups="excel.columnGroups.value"
      :all-columns="excel.ALL_COLUMNS"
      @toggle-column="excel.toggleColumn"
      @toggle-group="excel.toggleGroup"
      @apply-preset="excel.applyPreset"
      @select-all="excel.selectAllColumns"
      @clear-all="excel.clearAllColumns"
      @download="excel.handleDownload"
    />

    <!-- 📄 Bulk AIS -->
    <BulkAISDialog
      v-model:visible="bulkAIS.showBulkAISDialog.value"
      v-model:source="bulkAIS.bulkAISSource.value"
      v-model:batch-id="bulkAIS.bulkAISBatchId.value"
      v-model:mode="bulkAIS.bulkAISMode.value"
      :generating="bulkAIS.bulkAISGenerating.value"
      :progress="bulkAIS.bulkAISProgress.value"
      :selected-count="selectedIds.length"
      :filtered-count="filteredApplicants.length"
      :applicants-count="bulkAIS.bulkAISApplicants.value.length"
      :available-batches="availableBatches"
      @generate="bulkAIS.handleBulkAISGenerate"
      @close="bulkAIS.closeBulkAISDialog"
    />

    <!-- 🚀 Bulk Deploy -->
    <BulkDeployDialog
      v-model:visible="bulkDeployDialog"
      :applicant-batch-ids="selectedApplicantBatchIds"
      :submitting="deploymentStore.submitting"
      @submit="onBulkDeploySubmit"
    />
  </div>
</template>