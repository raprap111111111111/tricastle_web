<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Skeleton from 'primevue/skeleton'
import { AppCard } from '@shared/ui'
import { useApplicantStore } from '../stores/applicant.store'
import { groupApplicantsByDate } from '../utils/final-list.utils'
import ApplicantTable from '../components/ApplicantTable.vue'
import type { FinalListGroupBy, BatchSummary } from '../types'

const props = defineProps<{
  folderKey: string
}>()

const router = useRouter()
const store  = useApplicantStore()

// ─── Local filters ─────────────────────────────────────
const searchQuery     = ref('')
const selectedBatchId = ref<number | null>(null)

// ─── Load final_list applicants ────────────────────────
onMounted(async () => {
  store.resetFilters()
  store.setFilters({
    status: 'final_list',
    exclude_statuses: '',
    limit: 1000,
    offset: 0,
  })
  await store.fetchApplicants()
})

// ─── Detect groupBy from folder key format ────────────
const detectedGroupBy = computed<FinalListGroupBy>(() => {
  const key = props.folderKey

  if (/^\d{4}-W\d{2}$/.test(key)) return 'week'
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return 'day'
  if (/^\d{4}-\d{2}$/.test(key)) return 'month'
  if (/^\d{4}$/.test(key)) return 'year'

  return 'month'
})

// ─── Normalize applicants ──────────────────────────────
const applicants = computed(() =>
  store.applicants.map((a) => ({
    ...a,
    final_listed_at: a.final_listed_at ?? a.updated_at,
  })),
)

// ─── Find the folder ─────────────────────────────────
const folder = computed(() => {
  const folders = groupApplicantsByDate(applicants.value, detectedGroupBy.value)
  return folders.find((f) => f.key === props.folderKey)
})

// ─── Batches available INSIDE this folder ────────────
const availableBatches = computed<BatchSummary[]>(() => {
  if (!folder.value) return []
  const map = new Map<number, BatchSummary>()

  folder.value.applicants.forEach((a) => {
    a.applicant_batches?.forEach((ab) => {
      if (ab.batch && !map.has(ab.batch.id)) {
        map.set(ab.batch.id, ab.batch)
      }
    })
  })

  return Array.from(map.values()).sort((a, b) => {
    if (a.is_active && !b.is_active) return -1
    if (!a.is_active && b.is_active) return 1
    return a.name.localeCompare(b.name)
  })
})

const batchOptions = computed(() => {
  const items = availableBatches.value.map((b) => ({
    label: `${b.name} (#${b.batch_number})${b.is_active ? ' • Active' : ''}`,
    value: b.id,
    isActive: b.is_active ?? false,
  }))

  return [
    { label: 'All Batches', value: null, isActive: false },
    ...items,
  ]
})

// ─── Filtered applicants inside folder ────────────────
const filteredApplicants = computed(() => {
  if (!folder.value) return []
  let list = folder.value.applicants

  if (selectedBatchId.value) {
    list = list.filter((a) =>
      a.applicant_batches?.some(
        (ab) => ab.batch_id === selectedBatchId.value,
      ),
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

  return list
})

const hasFilters = computed(
  () => searchQuery.value !== '' || selectedBatchId.value !== null,
)

function resetFilters() {
  searchQuery.value = ''
  selectedBatchId.value = null
}

function goBack() {
  router.push({ name: 'applicants.final-list' })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1400px] mx-auto">

    <!-- ─── Loading ─────────────────────────────────── -->
    <template v-if="store.loading">
      <Skeleton height="60px" border-radius="12px" />
      <Skeleton height="400px" border-radius="16px" />
    </template>

    <!-- ─── Not Found ──────────────────────────────── -->
    <template v-else-if="!folder">
      <div class="text-center py-16">
        <i class="pi pi-folder-open text-4xl text-blueberry-300 mb-3" />
        <p class="text-blueberry-500">Folder not found</p>
        <Button
          label="Back to Final List"
          icon="pi pi-arrow-left"
          text
          class="mt-4"
          @click="goBack"
        />
      </div>
    </template>

    <!-- ─── Folder Contents ────────────────────────── -->
    <template v-else>
      <!-- Header -->
      <header class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <Button
            icon="pi pi-arrow-left"
            text
            rounded
            @click="goBack"
          />
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-apricot-100 to-apricot-200
                     flex items-center justify-center"
            >
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
      </header>

      <!-- ─── Filters ──────────────────────────────── -->
      <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">
        <div class="flex flex-col md:flex-row gap-3">

          <!-- Search -->
          <div class="relative flex-1 min-w-[200px]">
            <i
              class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2
                     text-blueberry-400 text-sm z-10"
            />
            <InputText
              v-model="searchQuery"
              placeholder="Search by name, email, or code..."
              class="w-full !pl-10"
            />
          </div>

          <!-- Batch Filter -->
          <div class="min-w-[260px]">
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
                  <span class="flex-1">{{ option.label }}</span>
                  <span
                    v-if="option.isActive"
                    class="text-[10px] px-1.5 py-0.5 rounded-full
                           bg-green-100 text-green-700 font-medium"
                  >
                    ACTIVE
                  </span>
                </div>
              </template>
            </Select>
          </div>

          <!-- Clear -->
          <Button
            v-if="hasFilters"
            label="Clear"
            icon="pi pi-times"
            severity="secondary"
            text
            @click="resetFilters"
          />
        </div>

        <!-- Active filter chips -->
        <div v-if="hasFilters" class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100">
          <span class="text-xs text-blueberry-500">Active filters:</span>

          <span
            v-if="searchQuery"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50
                   text-apricot-700 rounded-full text-xs font-medium ring-1 ring-apricot-200"
          >
            <i class="pi pi-search text-[10px]" />
            "{{ searchQuery }}"
            <button @click="searchQuery = ''" class="hover:text-apricot-900">
              <i class="pi pi-times text-[10px]" />
            </button>
          </span>

          <span
            v-if="selectedBatchId"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50
                   text-blue-700 rounded-full text-xs font-medium ring-1 ring-blue-200"
          >
            <i class="pi pi-graduation-cap text-[10px]" />
            {{ batchOptions.find(o => o.value === selectedBatchId)?.label }}
            <button @click="selectedBatchId = null" class="hover:text-blue-900">
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

      <!-- ─── Empty state after filtering ────────── -->
      <div
        v-if="filteredApplicants.length === 0 && !store.loading && hasFilters"
        class="text-center py-8 bg-white border border-dashed border-appleCore-200 rounded-xl"
      >
        <i class="pi pi-filter-slash text-3xl text-blueberry-300 mb-2" />
        <p class="text-sm text-blueberry-500 mb-2">No applicants match your filters</p>
        <Button
          label="Clear Filters"
          icon="pi pi-times"
          text
          @click="resetFilters"
        />
      </div>
    </template>
  </div>
</template>