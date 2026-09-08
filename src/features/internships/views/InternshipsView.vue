<script setup lang="ts">
import { onMounted, onActivated, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import InternshipTable from '../components/InternshipTable.vue'
import InternshipFilters from '../components/InternshipFilters.vue'
import GenerateMoaDialog from '../components/GenerateMoaDialog.vue'
import { useInternshipStore } from '../stores/internship.store'
import { useInternships } from '../composables/useInternships'
import { useMoaDownload } from '../composables/useMoaDownload'
import type { InternshipFilters as IFilters } from '../types'

const router = useRouter()
const store = useInternshipStore()
const { handleDelete } = useInternships()
const { generating: downloadingMoa, generateSingle: downloadSingleMoa } = useMoaDownload()

onMounted(() => store.fetchInternships())
onActivated(() => store.fetchInternships())

const totalCount    = computed(() => store.pagination?.total ?? 0)
const activeCount   = computed(() => store.internships.filter(i => i.status === 'active').length)
const currentCount  = computed(() => store.internships.filter(i => i.is_current).length)
const sswCount      = computed(() => store.internships.filter(i => i.program_type === 'ssw' || i.program_type === 'ssw_transfer').length)

function onFilter(filters: Partial<IFilters>) {
  store.setFilters(filters)
  store.fetchInternships()
}
function onReset() {
  store.resetFilters()
  store.fetchInternships()
}
function onPageChange(page: number) { store.setPage(page); store.fetchInternships() }
function onLimitChange(limit: number) { store.setLimit(limit); store.fetchInternships() }

async function onDelete(id: number) { await handleDelete(id) }

const moaId = ref<number | null>(null)
const showMoa = ref(false)
const checkingMoa = ref(false)

function onGenerateMoa(id: number) {
  moaId.value = id
  showMoa.value = true
}

// 🎯 NEW: Quick direct download without dialog
async function onQuickDownload(id: number) {
  checkingMoa.value = true
  try {
    await downloadSingleMoa(id)
  } catch (err) {
    console.error('[InternshipList] Quick MOA download failed:', err)
  } finally {
    checkingMoa.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Internships
        </h1>
        <p class="text-sm text-blueberry-500">
          Placements, contracts and MOA document generation
        </p>
      </div>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total" :value="totalCount" icon="pi pi-briefcase" variant="blueberry" />
      <AppStatCard label="Active" :value="activeCount" icon="pi pi-check-circle" variant="green" />
      <AppStatCard label="Current" :value="currentCount" icon="pi pi-flag" variant="apricot" />
      <AppStatCard label="SSW" :value="sswCount" icon="pi pi-globe" variant="citrus" />
    </div>

    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
      <InternshipFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <AppCard :padding="'none'" :shadow="'soft'">
      <InternshipTable
        :internships="store.internships"
        :pagination="store.pagination"
        :loading="store.loading"
        :submitting="store.submitting || checkingMoa"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
        @delete="onDelete"
        @generate-moa="onGenerateMoa"
        @quick-moa="onQuickDownload"
      />
    </AppCard>

    <GenerateMoaDialog v-model:visible="showMoa" :internship-id="moaId" />
  </div>
</template>