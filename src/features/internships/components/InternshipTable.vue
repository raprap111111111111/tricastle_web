<script setup lang="ts">
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'
import InternshipStatusBadge from './InternshipStatusBadge.vue'
import type { Internship, Pagination } from '../types'

const props = defineProps<{
  internships: Internship[]
  pagination: Pagination | null
  loading?: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'delete', id: number): void
  (e: 'generate-moa', id: number): void
  (e: 'quick-moa', id: number): void
}>()

const router = useRouter()

function onPage(evt: any) {
  emit('page-change', evt.page + 1)
  emit('limit-change', evt.rows)
}
</script>

<template>
  <DataTable
    :value="internships"
    :loading="loading"
    data-key="id"
    striped-rows
    row-hover
    class="text-sm"
  >
    <template #empty>
      <div class="text-center py-8 text-blueberry-400">
        <i class="pi pi-briefcase text-3xl mb-2" />
        <p>No internships found</p>
      </div>
    </template>

    <Column header="Applicant">
      <template #body="{ data }">
        <div class="flex flex-col">
          <span class="font-mono text-xs text-apricot-600">{{ data.applicant?.applicant_code }}</span>
          <span class="font-semibold text-blueberry-800">{{ data.applicant?.full_name }}</span>
        </div>
      </template>
    </Column>

    <Column field="program_type" header="Type">
      <template #body="{ data }">
        <span class="uppercase text-xs font-bold text-blueberry-700">{{ data.program_type }}</span>
      </template>
    </Column>

    <Column header="Receiving">
      <template #body="{ data }">
        {{ data.receiving_company?.name ?? '—' }}
      </template>
    </Column>

    <Column field="job_description" header="Job" />

    <Column header="Contract">
      <template #body="{ data }">
        <span v-if="data.contract_start && data.contract_end" class="text-xs text-blueberry-600">
          {{ data.contract_start }} → {{ data.contract_end }}
        </span>
        <span v-else class="text-blueberry-400">—</span>
      </template>
    </Column>

    <Column header="Status">
      <template #body="{ data }">
        <div class="flex flex-col gap-1">
          <InternshipStatusBadge :status="data.status" />
          <span v-if="data.is_current" class="text-[10px] font-semibold text-emerald-700">CURRENT</span>
        </div>
      </template>
    </Column>

    <Column header="Actions" style="width: 220px">
      <template #body="{ data }">
        <div class="flex items-center gap-1">
          <Button icon="pi pi-eye" text rounded severity="secondary"
            v-tooltip.top="'View'"
            @click="router.push({ name: 'internships.show', params: { id: data.id } })" />
          
          <!-- 🎯 FIXED: Word document icon & add quick download -->
          <Button icon="pi pi-download" text rounded severity="secondary"
            v-tooltip.top="'Quick Download MOA (.docx)'"
            :loading="submitting"
            @click="$emit('quick-moa', data.id)" />
            
          <Button icon="pi pi-file-word" text rounded severity="secondary"
            v-tooltip.top="'Customize & Generate MOA'"
            @click="$emit('generate-moa', data.id)" />
            
          <Button icon="pi pi-trash" text rounded severity="danger"
            v-tooltip.top="'Delete'"
            :disabled="submitting"
            @click="$emit('delete', data.id)" />
        </div>
      </template>
    </Column>
  </DataTable>

  <Paginator
    v-if="pagination"
    :rows="pagination.per_page ?? pagination.limit ?? 15"
    :total-records="pagination.total"
    :first="((pagination.current_page ?? 1) - 1) * (pagination.per_page ?? pagination.limit ?? 15)"
    :rows-per-page-options="[10, 15, 25, 50]"
    @page="onPage"
  />
</template>