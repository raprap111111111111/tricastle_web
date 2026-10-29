<!-- src/features/profile-updates/components/ProfileUpdatesTable.vue -->
<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import AppPagination from '@shared/ui/table/AppPagination.vue'
import type { ProfileUpdate } from '../types'

type Pagination = {
  total: number
  current_page: number
  last_page: number
  per_page: number
  offset?: number
  has_more?: boolean
}

const props = defineProps<{
  updates: ProfileUpdate[]
  pagination: Pagination | null
  loading: boolean
  statusFilter: 'pending' | 'approved' | 'declined'
}>()

const emit = defineEmits<{
  (e: 'review', row: ProfileUpdate): void
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
}>()

function formatDate(dateString?: string | null) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function emptyTitle() {
  return `No ${props.statusFilter} requests found`
}

function emptySubtitle() {
  if (props.statusFilter === 'pending') {
    return 'Great — no pending profile updates right now.'
  }
  if (props.statusFilter === 'approved') {
    return 'Approved profile update requests will appear here.'
  }
  return 'Declined profile update requests will appear here.'
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-blueberry-100 overflow-hidden flex flex-col">
    <DataTable
      :value="props.updates"
      :loading="props.loading"
      dataKey="id"
      class="p-datatable-sm !border-none"
      responsiveLayout="scroll"
      size="small"
      :pt="{
        table: 'text-sm',
        header: '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow: 'hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
        emptyMessage: '!border-none',
      }"
    >
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center"
            :class="props.statusFilter === 'pending' ? 'bg-emerald-50' : 'bg-appleCore-50'"
          >
            <i
              class="text-xl"
              :class="props.statusFilter === 'pending'
                ? 'pi pi-check text-emerald-500'
                : 'pi pi-user-edit text-blueberry-400'"
            />
          </div>
          <p class="text-sm text-blueberry-700 font-medium">
            {{ emptyTitle() }}
          </p>
          <p class="text-xs text-blueberry-400">
            {{ emptySubtitle() }}
          </p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading profile updates...</p>
        </div>
      </template>

      <Column field="created_at" header="Date Submitted" style="width: 160px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">{{ formatDate(data.created_at) }}</span>
        </template>
      </Column>

      <Column field="applicant_code" header="Applicant Code" style="width: 140px">
        <template #body="{ data }">
          <span class="font-mono text-sm text-apricot-600 font-semibold">
            {{ data.applicant_code || '—' }}
          </span>
        </template>
      </Column>

      <Column field="applicant_name" header="Applicant Name">
        <template #body="{ data }">
          <span class="font-medium text-blueberry-900">{{ data.applicant_name || '—' }}</span>
        </template>
      </Column>

      <Column header="Fields Modified" style="width: 140px">
        <template #body="{ data }">
          <span class="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
            {{ Object.keys(data.proposed_payload || {}).length }} field(s)
          </span>
        </template>
      </Column>

      <Column field="status" header="Status" style="width: 130px">
        <template #body="{ data }">
          <Tag
            :severity="
              data.status === 'pending'
                ? 'warning'
                : data.status === 'approved'
                  ? 'success'
                  : 'danger'
            "
            :value="data.status ? String(data.status).toUpperCase() : 'PENDING'"
            rounded
          />
        </template>
      </Column>

      <Column header="Actions" style="width: 120px" alignFrozen="right" :frozen="true">
        <template #body="{ data }">
          <Button
            v-if="data.status === 'pending'"
            label="Review"
            icon="pi pi-search"
            class="p-button-sm p-button-outlined !border-apricot-500 !text-apricot-500 hover:!bg-apricot-50"
            @click="emit('review', data)"
          />
          <Button
            v-else
            label="View"
            icon="pi pi-eye"
            class="p-button-sm p-button-text !text-blueberry-600"
            @click="emit('review', data)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Pagination bar directly below table rows -->
    <AppPagination
      v-if="props.pagination && props.pagination.total > 0"
      :pagination="props.pagination"
      @page-change="(page) => emit('page-change', page)"
      @limit-change="(limit) => emit('limit-change', limit)"
    />
  </div>
</template>