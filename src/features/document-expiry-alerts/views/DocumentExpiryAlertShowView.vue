<!-- src/features/document-expiry-alerts/views/DocumentExpiryAlertShowView.vue -->
<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Toast from 'primevue/toast';

import DocumentExpiryAlertBadge    from '../components/DocumentExpiryAlertBadge.vue';
import { useDocumentExpiryAlerts } from '../composables/useDocumentExpiryAlert';
import { useDocumentExpiryAlertStore } from '../stores/document-expiry-alert.store';
import type { AlertType } from '../types';

const route  = useRoute();
const router = useRouter();
const store  = useDocumentExpiryAlertStore();

const { selectedAlert, loading } = storeToRefs(store);
const { formatDaysUntilExpiry }  = useDocumentExpiryAlerts();

const derivedDaysUntilExpiry = computed<number | null>(() => {
  if (!selectedAlert.value?.expiry_date) return null;
  if (typeof selectedAlert.value.days_until_expiry === 'number') {
    return selectedAlert.value.days_until_expiry;
  }
  const expiry = new Date(selectedAlert.value.expiry_date);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
});

const derivedAlertType = computed<AlertType | null>(() => {
  if (!selectedAlert.value?.expiry_date) return null;
  const days = derivedDaysUntilExpiry.value ?? 0;
  if (days < 0)   return 'expired';
  if (days <= 30) return '30_days';
  if (days <= 60) return '60_days';
  if (days <= 90) return '90_days';
  return null;
});

const applicantName = computed(() => {
  const a = selectedAlert.value?.applicant;
  if (!a) return '—';
  if (a.full_name) return a.full_name;
  return `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || '—';
});

const iconBgClass = computed(() => {
  switch (derivedAlertType.value) {
    case 'expired':  return 'bg-gray-500';
    case '30_days':  return 'bg-red-500';
    case '60_days':  return 'bg-amber-500';
    case '90_days':  return 'bg-blue-500';
    default:         return 'bg-green-500';
  }
});

const iconShadow = computed(() => {
  switch (derivedAlertType.value) {
    case 'expired':  return 'shadow-gray-200';
    case '30_days':  return 'shadow-red-200';
    case '60_days':  return 'shadow-amber-200';
    case '90_days':  return 'shadow-blue-200';
    default:         return 'shadow-green-200';
  }
});

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatDateTime(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

onMounted(() => {
  store.fetchAlert(Number(route.params.id));
});
</script>

<template>
  <div class="p-6 lg:p-8 space-y-6">
    <Toast />

    <div class="max-w-5xl mx-auto space-y-6">

      <!-- ═════ Back Button ═════ -->
      <button
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors font-medium"
        @click="router.push({ name: 'document-expiry-alerts.index' })"
      >
        <i class="pi pi-arrow-left text-xs" />
        Back to Expiry Alerts
      </button>

      <!-- ═════ Loading Skeleton ═════ -->
      <template v-if="loading && !selectedAlert">
        <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          <Skeleton height="2rem" width="40%" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" width="80%" />
        </div>
      </template>

      <template v-else-if="selectedAlert">

        <!-- ═════ Hero Card ═════ -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-6">

            <div class="flex items-start gap-4">
              <!-- Icon Bubble -->
              <div
                :class="[
                  'w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg',
                  iconBgClass,
                  iconShadow,
                ]"
              >
                <i
                  :class="[
                    'text-white text-2xl',
                    derivedAlertType === 'expired'  ? 'pi pi-times-circle'         :
                    derivedAlertType === '30_days'  ? 'pi pi-exclamation-triangle' :
                    derivedAlertType === '60_days'  ? 'pi pi-clock'                :
                    derivedAlertType === '90_days'  ? 'pi pi-info-circle'          :
                                                      'pi pi-check-circle',
                  ]"
                />
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <h1 class="text-2xl font-serif font-bold text-gray-900">
                    {{ selectedAlert.document_type?.name ?? 'Document' }}
                  </h1>
                  <DocumentExpiryAlertBadge
                    v-if="derivedAlertType"
                    :type="derivedAlertType"
                    show-icon
                  />
                </div>
                <p class="text-sm text-gray-500">
                  <template v-if="derivedDaysUntilExpiry !== null">
                    <span class="font-semibold text-gray-800">
                      {{ formatDaysUntilExpiry(derivedDaysUntilExpiry) }}
                    </span>
                    · Document #{{ selectedAlert.id }}
                  </template>
                  <template v-else>
                    Document #{{ selectedAlert.id }}
                  </template>
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <Button
                label="View Document"
                icon="pi pi-file"
                class="!bg-orange-500 hover:!bg-orange-600 !border-orange-500 !text-white !px-5 !rounded-xl"
                @click="router.push({ name: 'documents.show', params: { id: selectedAlert.id } })"
              />
              <Button
                icon="pi pi-user"
                severity="secondary"
                outlined
                class="!rounded-xl !border-gray-200"
                v-tooltip.top="'View Applicant'"
                @click="router.push({ name: 'applicants.show', params: { id: selectedAlert.applicant_id } })"
              />
            </div>
          </div>
        </div>

        <!-- ═════ Details Grid ═════ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Applicant Info -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <i class="pi pi-user text-orange-500 text-sm" />
              </div>
              <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Applicant</h2>
            </div>
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold">
                  {{ applicantName.charAt(0) }}
                </div>
                <div>
                  <div class="font-semibold text-gray-900">{{ applicantName }}</div>
                  <div class="text-xs text-gray-500 font-mono">
                    {{ selectedAlert.applicant?.applicant_code ?? '—' }}
                  </div>
                </div>
              </div>
              <div v-if="selectedAlert.applicant?.email">
                <div class="text-xs text-gray-400 mb-1">Email</div>
                <div class="text-sm text-gray-800 flex items-center gap-1.5">
                  <i class="pi pi-envelope text-gray-400 text-xs" />
                  {{ selectedAlert.applicant.email }}
                </div>
              </div>
            </div>
          </div>

          <!-- Document Info -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <i class="pi pi-file text-orange-500 text-sm" />
              </div>
              <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Document</h2>
            </div>
            <div class="space-y-3">
              <div>
                <div class="text-xs text-gray-400 mb-1">File Name</div>
                <div class="text-sm text-gray-800 truncate font-medium">{{ selectedAlert.file_name }}</div>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <div class="text-xs text-gray-400 mb-1">File Size</div>
                  <div class="text-sm text-gray-800 font-medium">{{ formatFileSize(selectedAlert.file_size) }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-400 mb-1">Version</div>
                  <div class="text-sm text-gray-800 font-medium">v{{ selectedAlert.version }}</div>
                </div>
              </div>
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span class="text-sm text-gray-600">Status</span>
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize',
                    selectedAlert.status === 'verified'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200',
                  ]"
                >
                  {{ selectedAlert.status?.replace(/_/g, ' ') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Expiry Timeline -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 md:col-span-2">
            <div class="flex items-center gap-2 mb-5">
              <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <i class="pi pi-clock text-orange-500 text-sm" />
              </div>
              <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">Expiry Timeline</h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Document Date
                </div>
                <div class="text-sm font-bold text-gray-800">
                  {{ formatDate(selectedAlert.document_date) }}
                </div>
              </div>

              <div class="text-center p-4 rounded-xl bg-red-50 border border-red-100">
                <div class="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                  Expires On
                </div>
                <div class="text-sm font-bold text-red-700">
                  {{ formatDate(selectedAlert.expiry_date) }}
                </div>
              </div>

              <div class="text-center p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div class="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-2">
                  Time Remaining
                </div>
                <div class="text-sm font-bold text-orange-700">
                  <template v-if="derivedDaysUntilExpiry !== null">
                    {{ formatDaysUntilExpiry(derivedDaysUntilExpiry) }}
                  </template>
                  <template v-else>—</template>
                </div>
              </div>
            </div>

            <!-- Metadata footer -->
            <div class="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-calendar-plus text-gray-400" />
                Created {{ formatDateTime(selectedAlert.created_at) }}
              </div>
              <div class="flex items-center gap-1.5">
                <i class="pi pi-history text-gray-400" />
                Updated {{ formatDateTime(selectedAlert.updated_at) }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <i class="pi pi-file-o text-4xl text-gray-400" />
          </div>
          <p class="text-lg font-semibold text-gray-700">Document not found</p>
          <Button
            label="Back to Alerts"
            severity="secondary"
            text
            class="mt-3"
            @click="router.push({ name: 'document-expiry-alerts.index' })"
          />
        </div>
      </template>
    </div>
  </div>
</template>