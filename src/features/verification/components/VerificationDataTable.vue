<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import VerificationStatusTag from './VerificationStatusTag.vue'
import type { DocumentVerification, Pagination } from '../types'

const props = defineProps<{
  verifications: DocumentVerification[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
}>()

const router = useRouter()

// ─── Pagination helpers (same pattern as DocumentTable) ─────
const currentLimit = computed(
  () => (props.pagination as any)?.per_page ?? (props.pagination as any)?.limit ?? 10,
)

const currentFirst = computed(() => {
  const p: any = props.pagination
  if (p?.current_page && currentLimit.value) {
    return (p.current_page - 1) * currentLimit.value
  }
  return p?.offset ?? ((p?.page ?? 1) - 1) * currentLimit.value
})

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    emit('limit-change', event.rows)
    return
  }
  emit('page-change', event.page + 1)
}

// ─── Navigation ─────────────────────────────────────────────
function goToReview(id: number) {
  router.push({ name: 'verification.review', params: { id } })
}

function goToDetail(id: number) {
  router.push({ name: 'verification.detail', params: { id } })
}

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  goToDetail((event.data as DocumentVerification).id)
}

// ─── Formatters ─────────────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-CA')
  } catch {
    return '—'
  }
}

function matchColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<template>
  <div class="flex flex-col">
    <DataTable
      :value="props.verifications"
      :loading="props.loading"
      class="!border-none"
      size="small"
      :row-hover="true"
      @row-click="onRowClick"
      :pt="{
        table: 'text-sm',
        header:
          '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow:
          'cursor-pointer hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
      }"
    >
      <!-- ID -->
      <Column header="ID" style="width: 100px">
        <template #body="{ data }">
          <span class="font-mono text-apricot-600 font-semibold text-sm">
            #{{ data.id }}
          </span>
        </template>
      </Column>

      <!-- Document -->
      <Column header="Document">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-apricot-50 text-apricot-600
                     flex items-center justify-center flex-shrink-0"
            >
              <i class="pi pi-file-check text-sm" />
            </div>
            <div class="min-w-0">
              <p class="font-medium text-blueberry-800 truncate">
                Document #{{ data.applicant_document_id }}
              </p>
              <p class="text-xs text-blueberry-400 mt-0.5">
                {{ data.verifier?.name ?? 'Unassigned' }}
              </p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Status -->
      <Column field="status" header="Status" style="width: 160px">
        <template #body="{ data }">
          <VerificationStatusTag :status="data.status" />
        </template>
      </Column>

      <!-- Match Rate -->
      <Column header="Match Rate" style="width: 220px">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-appleCore-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="matchColor(Number(data.match_percentage))"
                :style="{ width: `${Number(data.match_percentage)}%` }"
              />
            </div>
            <span class="text-xs font-semibold text-blueberry-700 w-10 text-right tabular-nums">
              {{ data.match_percentage }}%
            </span>
          </div>
        </template>
      </Column>

      <!-- Fields -->
      <Column header="Fields" style="width: 200px">
        <template #body="{ data }">
          <div class="flex items-center gap-2 text-xs">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold"
              v-tooltip.top="'Matched'"
            >
              <i class="pi pi-check text-[9px]" />
              {{ data.matched_fields }}
            </span>
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold"
              v-tooltip.top="'Mismatched'"
            >
              <i class="pi pi-times text-[9px]" />
              {{ data.mismatched_fields }}
            </span>
            <span class="text-blueberry-400">/ {{ data.total_fields }}</span>
          </div>
        </template>
      </Column>

      <!-- Created -->
      <Column
        field="created_at"
        header="Created"
        sortable
        style="width: 130px"
      >
        <template #body="{ data }">
          <span class="text-sm text-blueberry-500 tabular-nums">
            {{ formatDate(data.created_at) }}
          </span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" style="width: 130px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-check-square"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Review'"
              @click="goToReview(data.id)"
            />
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View details'"
              @click="goToDetail(data.id)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div
            class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center"
          >
            <i class="pi pi-inbox text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">
            No verifications found
          </p>
          <p class="text-xs text-blueberry-400">
            Verifications will appear here once submitted
          </p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading verifications...</p>
        </div>
      </template>
    </DataTable>

    <!-- ─── Pagination Footer (matches DocumentTable) ─── -->
    <div
      v-if="props.pagination && props.pagination.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3
             px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
    >
      <div class="text-xs text-blueberry-500">
        Showing
        <span class="font-semibold text-blueberry-700">
          {{ (props.pagination as any).from ?? currentFirst + 1 }}
        </span>
        to
        <span class="font-semibold text-blueberry-700">
          {{
            (props.pagination as any).to
              ?? Math.min(currentFirst + currentLimit, props.pagination.total)
          }}
        </span>
        of
        <span class="font-semibold text-blueberry-700">
          {{ props.pagination.total }}
        </span>
        entries
      </div>

      <Paginator
        :rows="currentLimit"
        :total-records="props.pagination.total"
        :first="currentFirst"
        :rows-per-page-options="[10, 25, 50, 100]"
        template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
        class="!bg-transparent !p-0"
        @page="onPageChange"
      />
    </div>
  </div>
</template>