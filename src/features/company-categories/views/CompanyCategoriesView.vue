<script setup lang="ts">
import { onMounted, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useCompanyCategories } from '../composables/useCompanyCategories'
import { useCompanyCategoryStore } from '../stores/company-category.store'
import CompanyCategoryTable from '../components/CompanyCategoryTable.vue'
import CompanyCategoryFilters from '../components/CompanyCategoryFilters.vue'
import type { CompanyCategoryFilters as IFilters } from '../types'

const router = useRouter()
const store  = useCompanyCategoryStore()
const { handleDelete, handleToggleStatus } = useCompanyCategories()

onMounted(() => store.fetchCategories())
onActivated(() => store.fetchCategories())

const totalCount    = computed(() => store.pagination?.total ?? 0)
const activeCount   = computed(() => store.categories.filter(c => c.is_active).length)
const inactiveCount = computed(() => store.categories.filter(c => !c.is_active).length)

function onFilter(filters: Partial<IFilters>) { store.setFilters(filters); store.fetchCategories() }
function onReset() { store.resetFilters(); store.fetchCategories() }
function onPageChange(page: number) { store.setPage(page); store.fetchCategories() }
function onLimitChange(limit: number) { store.setLimit(limit); store.fetchCategories() }
async function onDelete(id: number) { await handleDelete(id) }
async function onToggleStatus(id: number) { await handleToggleStatus(id) }
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <header class="flex items-start justify-between gap-6">
      <div>
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Company Categories
        </h1>
        <p class="text-sm text-blueberry-500 mt-1">
          Classify companies by industry or type
        </p>
      </div>
      <AppButton
        label="New Category"
        icon="pi pi-plus"
        variant="accent"
        @click="router.push({ name: 'company-categories.create' })"
      />
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <AppStatCard label="Total" :value="totalCount" icon="pi pi-tags" variant="blueberry" />
      <AppStatCard label="Active" :value="activeCount" icon="pi pi-check-circle" variant="green" />
      <AppStatCard label="Inactive" :value="inactiveCount" icon="pi pi-ban" variant="apricot" />
    </div>

    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
      <CompanyCategoryFilters @filter="onFilter" @reset="onReset" />
    </AppCard>

    <AppCard :padding="'none'" :shadow="'soft'">
      <CompanyCategoryTable
        :categories="store.categories"
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