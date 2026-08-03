<!-- src/features/document-expiry-alerts/views/DocumentExpiryAlertListView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Toast from 'primevue/toast'

import DocumentExpiryAlertTable   from '../components/DocumentExpiryAlertTable.vue'
import DocumentExpiryAlertFilters from '../components/DocumentExpiryAlertFilters.vue'
import { useDocumentExpiryAlerts } from '../composables/useDocumentExpiryAlert'
import { useDocumentExpiryAlertStore } from '../stores/document-expiry-alert.store'
import type { DocumentExpiryAlert } from '../types'

const router = useRouter()
const store  = useDocumentExpiryAlertStore()

const {
  alerts,
  total,
  loading,
  filters,
  expiredAlerts,
  criticalAlerts,
  currentPage,
  loadAlerts,
  handlePageChange,
  handleFilterChange,
  handleRefresh,
} = useDocumentExpiryAlerts()

function countByType(list: DocumentExpiryAlert[], type: string): number {
  return list.filter((a) => a.alert_type === type).length
}

async function onLimitChange(newLimit: number) {
  filters.value.limit  = newLimit
  filters.value.offset = 0
  await store.fetchAlerts()
}

onMounted(() => loadAlerts())
</script>

<template>
  <div class="p-6 lg:p-8 space-y-8">
    <Toast />

    <!-- ═════════════ Header ═════════════ -->
    <header class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-serif font-bold text-blueberry-800 tracking-tight">
          Document Expiry Alerts
        </h1>
        <p class="mt-1 text-sm text-blueberry-500 flex items-center gap-1.5">
          Monitor documents nearing expiration
          <span class="text-lg">⏰</span>
        </p>
      </div>
    </header>

    <!-- ═════════════ Hero Info Banner ═════════════ -->
    <div class="bg-gradient-to-r from-apricot-50 to-apricot-50/40 rounded-2xl border border-apricot-100 p-6">
      <div class="flex items-start gap-4">
        <div class="w-14 h-14 rounded-2xl bg-apricot-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-apricot-200">
          <i class="pi pi-exclamation-triangle text-white text-2xl" />
        </div>
        <div>
          <p class="text-xs font-bold text-apricot-600 uppercase tracking-widest mb-1">
            Expiry Monitoring
          </p>
          <h2 class="text-xl font-serif font-bold text-blueberry-800 mb-1">
            Documents expiring soon
          </h2>
          <p class="text-sm text-blueberry-500">
            Showing all documents that expire within 90 days or are already past their expiry date
          </p>
        </div>
      </div>
    </div>

    <!-- ═════════════ Summary Cards ═════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total -->
      <div class="bg-white rounded-2xl border border-appleCore-100 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">Total</p>
            <p class="text-3xl font-bold text-blueberry-800 mt-2">{{ total }}</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-file text-blueberry-500" />
          </div>
        </div>
        <p class="text-xs text-blueberry-400 mt-3">Expiring documents</p>
      </div>

      <!-- Critical -->
      <div class="bg-white rounded-2xl border border-red-100 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold text-red-500 uppercase tracking-wider">Critical</p>
            <p class="text-3xl font-bold text-red-600 mt-2">{{ criticalAlerts.length }}</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-red-500" />
          </div>
        </div>
        <p class="text-xs text-red-400 mt-3">≤ 30 days or expired</p>
      </div>

      <!-- 60 days -->
      <div class="bg-white rounded-2xl border border-amber-100 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold text-amber-600 uppercase tracking-wider">60 Days</p>
            <p class="text-3xl font-bold text-amber-600 mt-2">{{ countByType(alerts, '60_days') }}</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
            <i class="pi pi-clock text-amber-500" />
          </div>
        </div>
        <p class="text-xs text-amber-500 mt-3">31 – 60 days out</p>
      </div>

      <!-- Expired -->
      <div class="bg-white rounded-2xl border border-appleCore-100 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">Expired</p>
            <p class="text-3xl font-bold text-blueberry-700 mt-2">{{ expiredAlerts.length }}</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-times-circle text-blueberry-500" />
          </div>
        </div>
        <p class="text-xs text-blueberry-400 mt-3">Already expired</p>
      </div>
    </div>

    <!-- ═════════════ Filters ═════════════ -->
    <DocumentExpiryAlertFilters
      v-model="filters"
      :loading="loading"
      @search="handleFilterChange"
      @reset="handleFilterChange"
    />

    <!-- ═════════════ Table Card ═════════════ -->
    <div class="bg-white rounded-2xl border border-appleCore-100 overflow-hidden">
      <DocumentExpiryAlertTable
        :alerts="alerts"
        :total="total"
        :loading="loading"
        :current-page="currentPage"
        :limit="filters.limit ?? 10"
        @view="(id: number) => router.push({ name: 'documents.view', params: { id } })"
        @view-applicant="(id: number) => router.push({ name: 'applicants.show', params: { id } })"
        @page-change="handlePageChange"
        @limit-change="onLimitChange"
      />
    </div>
  </div>
</template>