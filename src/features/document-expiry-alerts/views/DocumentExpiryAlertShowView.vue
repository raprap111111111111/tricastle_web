<!-- src/features/document-expiry-alerts/views/DocumentExpiryAlertShowView.vue -->
<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
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

// ─── Derived alert type (since backend show endpoint doesn't include it) ──
const derivedAlertType = computed<AlertType | null>(() => {
  if (!selectedAlert.value?.expiry_date) return null;
  const days = derivedDaysUntilExpiry.value ?? 0;
  if (days < 0)   return 'expired';
  if (days <= 30) return '30_days';
  if (days <= 60) return '60_days';
  if (days <= 90) return '90_days';
  return null;
});

const derivedDaysUntilExpiry = computed<number | null>(() => {
  if (!selectedAlert.value?.expiry_date) return null;
  // If the backend already provides it (list endpoint), prefer that
  if (typeof selectedAlert.value.days_until_expiry === 'number') {
    return selectedAlert.value.days_until_expiry;
  }
  const expiry = new Date(selectedAlert.value.expiry_date);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
});

const applicantName = computed(() => {
  const a = selectedAlert.value?.applicant;
  if (!a) return '—';
  if (a.full_name) return a.full_name;
  return `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || '—';
});

// ─── Helpers ──────────────────────────────────────────────
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
  <div class="p-6">
    <Toast />

    <div class="max-w-4xl mx-auto">

      <!-- Back Button -->
      <Button
        icon="pi pi-arrow-left"
        label="Back to Alerts"
        severity="secondary"
        text
        class="mb-6"
        @click="router.push({ name: 'document-expiry-alerts.index' })"
      />

      <!-- Loading Skeleton -->
      <template v-if="loading && !selectedAlert">
        <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <Skeleton height="2rem" width="40%" />
          <Skeleton height="1rem" />
          <Skeleton height="1rem" width="80%" />
        </div>
      </template>

      <!-- Detail Content -->
      <template v-else-if="selectedAlert">

        <!-- ─── Header Card ──────────────────────────────── -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div
                :class="[
                  'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                  derivedAlertType === 'expired'  ? 'bg-gray-100'  :
                  derivedAlertType === '30_days'  ? 'bg-red-100'   :
                  derivedAlertType === '60_days'  ? 'bg-orange-100':
                  derivedAlertType === '90_days'  ? 'bg-blue-100'  :
                                                    'bg-green-100',
                ]"
              >
                <i
                  :class="[
                    'text-2xl',
                    derivedAlertType === 'expired'  ? 'pi pi-times-circle text-gray-500'         :
                    derivedAlertType === '30_days'  ? 'pi pi-exclamation-triangle text-red-500'  :
                    derivedAlertType === '60_days'  ? 'pi pi-exclamation-circle text-orange-500' :
                    derivedAlertType === '90_days'  ? 'pi pi-info-circle text-blue-500'          :
                                                      'pi pi-check-circle text-green-500',
                  ]"
                />
              </div>

              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 class="text-xl font-bold text-gray-900">
                    {{ selectedAlert.document_type?.name ?? 'Document' }} #{{ selectedAlert.id }}
                  </h1>
                  <DocumentExpiryAlertBadge
                    v-if="derivedAlertType"
                    :type="derivedAlertType"
                    show-icon
                  />
                </div>
                <p class="text-sm text-gray-500">
                  <template v-if="derivedDaysUntilExpiry !== null">
                    {{ formatDaysUntilExpiry(derivedDaysUntilExpiry) }}
                  </template>
                  <template v-else>
                    No expiry date set
                  </template>
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <Button
                label="View Document"
                icon="pi pi-file"
                severity="info"
                outlined
                size="small"
                @click="router.push({ name: 'documents.show', params: { id: selectedAlert.id } })"
              />
              <Button
                label="View Applicant"
                icon="pi pi-user"
                severity="secondary"
                outlined
                size="small"
                @click="router.push({ name: 'applicants.show', params: { id: selectedAlert.applicant_id } })"
              />
            </div>
          </div>
        </div>

        <!-- ─── Details Grid ─────────────────────────────── -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Applicant -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <i class="pi pi-user text-primary-500" /> Applicant
            </h2>
            <div class="space-y-3">
              <div>
                <div class="text-xs text-gray-400">Full Name</div>
                <div class="text-sm font-medium text-gray-800">{{ applicantName }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-400">Applicant Code</div>
                <div class="text-sm font-mono font-medium text-primary-600">
                  {{ selectedAlert.applicant?.applicant_code ?? '—' }}
                </div>
              </div>
              <div v-if="selectedAlert.applicant?.email">
                <div class="text-xs text-gray-400">Email</div>
                <div class="text-sm text-gray-800">{{ selectedAlert.applicant.email }}</div>
              </div>
            </div>
          </div>

          <!-- Document -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <i class="pi pi-file text-primary-500" /> Document
            </h2>
            <div class="space-y-3">
              <div>
                <div class="text-xs text-gray-400">Document Type</div>
                <div class="text-sm font-medium text-gray-800">
                  {{ selectedAlert.document_type?.name ?? '—' }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-400">File Name</div>
                <div class="text-sm text-gray-800 truncate">{{ selectedAlert.file_name }}</div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <div class="text-xs text-gray-400">File Size</div>
                  <div class="text-sm text-gray-800">{{ formatFileSize(selectedAlert.file_size) }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-400">Version</div>
                  <div class="text-sm text-gray-800">v{{ selectedAlert.version }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Expiry Info -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <i class="pi pi-clock text-primary-500" /> Expiry Info
            </h2>
            <div class="space-y-3">
              <div>
                <div class="text-xs text-gray-400">Expiry Date</div>
                <div
                  :class="[
                    'text-sm font-semibold',
                    derivedAlertType === 'expired' ? 'text-gray-600' : 'text-red-600',
                  ]"
                >
                  {{ formatDate(selectedAlert.expiry_date) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-400">Days Until Expiry</div>
                <div class="text-sm text-gray-800">
                  <template v-if="derivedDaysUntilExpiry !== null">
                    {{ formatDaysUntilExpiry(derivedDaysUntilExpiry) }}
                  </template>
                  <template v-else>—</template>
                </div>
              </div>
              <div v-if="selectedAlert.document_date">
                <div class="text-xs text-gray-400">Document Date</div>
                <div class="text-sm text-gray-800">{{ formatDate(selectedAlert.document_date) }}</div>
              </div>
            </div>
          </div>

          <!-- Status & Metadata -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <i class="pi pi-info-circle text-primary-500" /> Status
            </h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Verification Status</span>
                <Tag
                  :value="selectedAlert.status?.replace('_', ' ')"
                  :severity="selectedAlert.status === 'verified' ? 'success' : 'info'"
                  class="text-xs capitalize"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Priority</span>
                <Tag
                  :value="selectedAlert.priority"
                  severity="secondary"
                  class="text-xs capitalize"
                />
              </div>
              <div>
                <div class="text-xs text-gray-400">Created At</div>
                <div class="text-sm text-gray-800">{{ formatDateTime(selectedAlert.created_at) }}</div>
              </div>
              <div>
                <div class="text-xs text-gray-400">Last Updated</div>
                <div class="text-sm text-gray-800">{{ formatDateTime(selectedAlert.updated_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Not Found -->
      <template v-else>
        <div class="flex flex-col items-center justify-center py-20 text-gray-400">
          <i class="pi pi-file-o text-5xl mb-3" />
          <p class="text-lg font-medium">Document not found</p>
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