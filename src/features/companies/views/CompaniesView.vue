<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useCompanies } from '../composables/useCompanies'
import { useCompanyStore } from '../stores/company.store'
import CompanyTable from '../components/CompanyTable.vue'
import CompanyFilters from '../components/CompanyFilters.vue'
import type { CompanyFilters as IFilters } from '../types'

const router = useRouter()
const store  = useCompanyStore()
const { handleDelete, handleToggleStatus } = useCompanies()

onMounted(() => store.fetchCompanies())
onActivated(() => store.fetchCompanies())

const totalCount    = computed(() => store.pagination?.total ?? 0)
const activeCount   = computed(() => store.companies.filter(c => c.is_active).length)
const inactiveCount = computed(() => store.companies.filter(c => !c.is_active).length)
const japanCount    = computed(() => store.companies.filter(c => c.country === 'Japan').length)

function onFilter(filters: Partial<IFilters>) {
  store.setFilters(filters)
  store.fetchCompanies()
}
function onReset() {
  store.resetFilters()
  store.fetchCompanies()
}
function onPageChange(page: number) {
  store.setPage(page)
  store.fetchCompanies()
}
function onLimitChange(limit: number) {
  store.setLimit(limit)
  store.fetchCompanies()
}
async function onDelete(id: number) {
  await handleDelete(id)
}
async function onToggleStatus(id: number) {
  await handleToggleStatus(id)
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <!-- Header -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Companies
        </h1>
        <p class="text-sm text-blueberry-500">
          Partner employers and job placement companies 🇯🇵
        </p>
      </div>
      <AppButton
        label="New Company"
        icon="pi pi-plus"
        variant="accent"
        @click="router.push({ name: 'companies.create' })"
      />
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Companies" :value="totalCount" icon="pi pi-building" variant="blueberry" />
      <AppStatCard label="Active" :value="activeCount" icon="pi pi-check-circle" variant="green" />
      <AppStatCard label="Inactive" :value="inactiveCount" icon="pi pi-ban" variant="apricot" />
      <AppStatCard label="Japan Based" :value="japanCount" icon="pi pi-globe" variant="citrus" />
    </div>

    <!-- Filters -->
    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
      <CompanyFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- Table -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <CompanyTable
        :companies="store.companies"
        :pagination="store.pagination"
        :loading="store.loading"
        :submitting="store.submitting"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
        @delete="onDelete"
        @toggle-status="onToggleStatus"
      />
    </AppCard>
  </div>
</template>