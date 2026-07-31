<!-- src/features/document-expiry-alerts/components/DocumentExpiryAlertTable.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Paginator from 'primevue/paginator';
import DocumentExpiryAlertBadge from './DocumentExpiryAlertBadge.vue';
import type { DocumentExpiryAlert } from '../types';

const props = defineProps<{
  alerts: DocumentExpiryAlert[];
  total: number;
  loading: boolean;
  currentPage: number;
  limit: number;
}>();

const emit = defineEmits<{
  view: [id: number];
  viewApplicant: [id: number];
  pageChange: [page: number];
}>();

function formatDate(date: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatDays(days: number): string {
  if (days < 0)   return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  return `${days} days`;
}

function getDaysSeverity(days: number): string {
  if (days < 0)   return 'danger';
  if (days <= 30) return 'danger';
  if (days <= 60) return 'warn';
  return 'info';
}

function getApplicantName(alert: DocumentExpiryAlert): string {
  if (!alert.applicant) return '—';
  if (alert.applicant.full_name) return alert.applicant.full_name;
  return `${alert.applicant.first_name ?? ''} ${alert.applicant.last_name ?? ''}`.trim() || '—';
}

const first = computed(() => (props.currentPage - 1) * props.limit);
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <DataTable
      :value="loading ? Array(5).fill({}) : alerts"
      data-key="id"
      striped-rows
      :row-hover="!loading"
      class="w-full"
    >
      <!-- Applicant -->
      <Column header="Applicant" class="min-w-[200px]">
        <template #body="{ data }">
          <template v-if="loading">
            <Skeleton height="1rem" class="mb-1" />
            <Skeleton height="0.75rem" width="60%" />
          </template>
          <template v-else>
            <div class="font-medium text-gray-900 text-sm">
              {{ getApplicantName(data) }}
            </div>
            <div class="text-xs text-gray-500 font-mono">
              {{ data.applicant?.applicant_code ?? '—' }}
            </div>
          </template>
        </template>
      </Column>

      <!-- Document -->
      <Column header="Document" class="min-w-[220px]">
        <template #body="{ data }">
          <template v-if="loading">
            <Skeleton height="1rem" class="mb-1" />
            <Skeleton height="0.75rem" width="70%" />
          </template>
          <template v-else>
            <div class="text-sm text-gray-800 font-medium">
              {{ data.document_type?.name ?? '—' }}
            </div>
            <div class="text-xs text-gray-400 truncate max-w-[220px]" v-tooltip="data.file_name">
              {{ data.file_name }}
            </div>
          </template>
        </template>
      </Column>

      <!-- Alert Badge -->
      <Column header="Urgency" class="min-w-[120px]">
        <template #body="{ data }">
          <Skeleton v-if="loading" height="1.5rem" width="80px" />
          <DocumentExpiryAlertBadge v-else :type="data.alert_type" show-icon />
        </template>
      </Column>

      <!-- Expiry Date -->
      <Column header="Expiry Date" class="min-w-[140px]">
        <template #body="{ data }">
          <Skeleton v-if="loading" height="1rem" />
          <div v-else class="text-sm font-medium text-gray-800">
            {{ formatDate(data.expiry_date) }}
          </div>
        </template>
      </Column>

      <!-- Days remaining -->
      <Column header="Time Remaining" class="min-w-[130px]">
        <template #body="{ data }">
          <Skeleton v-if="loading" height="1.5rem" width="70px" />
          <Tag
            v-else
            :value="formatDays(data.days_until_expiry)"
            :severity="getDaysSeverity(data.days_until_expiry)"
            class="text-xs"
          />
        </template>
      </Column>

      <!-- Status -->
      <Column header="Status" class="min-w-[130px]">
        <template #body="{ data }">
          <Skeleton v-if="loading" height="1.5rem" width="80px" />
          <Tag
            v-else
            :value="data.status?.replace('_', ' ')"
            :severity="data.status === 'verified' ? 'success' : 'info'"
            class="text-xs capitalize"
          />
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" class="min-w-[140px]" frozen align-frozen="right">
        <template #body="{ data }">
          <Skeleton v-if="loading" height="2rem" />
          <div v-else class="flex items-center gap-1">
            <Button
              icon="pi pi-file"
              size="small"
              severity="info"
              text
              rounded
              v-tooltip.top="'View Document'"
              @click="emit('view', data.id)"
            />
            <Button
              icon="pi pi-user"
              size="small"
              severity="secondary"
              text
              rounded
              v-tooltip.top="'View Applicant'"
              @click="emit('viewApplicant', data.applicant_id)"
            />
          </div>
        </template>
      </Column>

      <!-- Empty state -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 text-gray-400">
          <i class="pi pi-check-circle text-5xl mb-3 text-green-400" />
          <p class="text-lg font-medium text-gray-600">No expiring documents</p>
          <p class="text-sm mt-1">All documents are up to date</p>
        </div>
      </template>
    </DataTable>

    <!-- Paginator -->
    <div class="border-t border-gray-100 px-4 py-3">
      <Paginator
        :first="first"
        :rows="limit"
        :total-records="total"
        :rows-per-page-options="[10, 25, 50, 100]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        current-page-report-template="Showing {first} to {last} of {totalRecords} documents"
        @page="(e) => emit('pageChange', e.page + 1)"
      />
    </div>
  </div>
</template>