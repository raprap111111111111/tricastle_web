<!-- src/features/document-expiry-alerts/views/DocumentExpiryAlertListView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

import DocumentExpiryAlertTable   from '../components/DocumentExpiryAlertTable.vue';
import DocumentExpiryAlertFilters from '../components/DocumentExpiryAlertFilters.vue';
import { useDocumentExpiryAlerts } from '../composables/useDocumentExpiryAlert';
import type { DocumentExpiryAlert } from '../types';

const router = useRouter();

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
} = useDocumentExpiryAlerts();

function countByType(list: DocumentExpiryAlert[], type: string): number {
  return list.filter((a) => a.alert_type === type).length;
}

onMounted(() => loadAlerts());
</script>

<template>
  <div class="p-6">
    <Toast />

    <!-- ─── Header ─────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <i class="pi pi-clock text-2xl text-primary-600" />
          <h1 class="text-2xl font-bold text-gray-900">Document Expiry Alerts</h1>
        </div>
        <p class="text-sm text-gray-500">
          Documents expiring within 90 days or already expired
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="loading"
          @click="handleRefresh"
        />
      </div>
    </div>

    <!-- ─── Summary Cards ──────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
          <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <i class="pi pi-file text-primary-500 text-sm" />
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-900">{{ total }}</div>
        <div class="text-xs text-gray-400 mt-1">Expiring documents</div>
      </div>

      <!-- Critical -->
      <div class="bg-white rounded-xl border border-red-200 p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-red-500 uppercase tracking-wide">Critical</span>
          <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-red-500 text-sm" />
          </div>
        </div>
        <div class="text-2xl font-bold text-red-600">{{ criticalAlerts.length }}</div>
        <div class="text-xs text-gray-400 mt-1">≤ 30 days or expired</div>
      </div>

      <!-- 60 days -->
      <div class="bg-white rounded-xl border border-orange-200 p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-orange-500 uppercase tracking-wide">60 Days</span>
          <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <i class="pi pi-exclamation-circle text-orange-500 text-sm" />
          </div>
        </div>
        <div class="text-2xl font-bold text-orange-600">
          {{ countByType(alerts, '60_days') }}
        </div>
        <div class="text-xs text-gray-400 mt-1">31 – 60 days out</div>
      </div>

      <!-- Expired -->
      <div class="bg-white rounded-xl border border-gray-300 p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Expired</span>
          <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <i class="pi pi-times-circle text-gray-500 text-sm" />
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-700">{{ expiredAlerts.length }}</div>
        <div class="text-xs text-gray-400 mt-1">Already expired</div>
      </div>
    </div>

    <!-- ─── Filters ─────────────────────────────────────── -->
    <div class="mb-4">
      <DocumentExpiryAlertFilters
        v-model="filters"
        :loading="loading"
        @search="handleFilterChange"
        @reset="handleFilterChange"
      />
    </div>

    <!-- ─── Table ───────────────────────────────────────── -->
    <DocumentExpiryAlertTable
      :alerts="alerts"
      :total="total"
      :loading="loading"
      :current-page="currentPage"
      :limit="filters.limit ?? 10"
      @view="(id: number) => router.push({ name: 'documents.show', params: { id } })"
      @view-applicant="(id: number) => router.push({ name: 'applicants.show', params: { id } })"
      @page-change="handlePageChange"
    />
  </div>
</template>