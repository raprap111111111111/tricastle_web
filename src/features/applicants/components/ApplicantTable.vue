<!-- src/features/applicants/components/ApplicantTable.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import ApplicantStatusBadge from './ApplicantStatusBadge.vue'
import ApplicantDeleteDialog from './ApplicantDeleteDialog.vue'
import RejectApplicantDialog from './RejectApplicantDialog.vue'
import DeployButton from '@features/deployments/components/DeployButton.vue'
import AppPagination from '@shared/ui/table/AppPagination.vue'
import { useApplicantStore } from '../stores/applicant.store'
import type { Applicant, Pagination } from '../types'
import { getApplicantPhoto, getDefaultAvatar } from '@shared/utils/applicant-photo'

const props = defineProps<{
  applicants: Applicant[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
  selectable?: boolean
  selectedIds?: number[]
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
  (e: 'delete', id: number): void
  (e: 'update:selectedIds', ids: number[]): void
  (e: 'clear-selection'): void
}>()

const router  = useRouter()
const toast   = useToast()
const confirm = useConfirm()
const store   = useApplicantStore()

const deleteDialog      = ref(false)
const rejectDialog      = ref(false)
const selectedApplicant = ref<Applicant | null>(null)

// ─── 🖼️ Photo Hover Preview State ──────────────────────
const hoveredPhotoId = ref<number | null>(null)
const previewPhotoApplicant = ref<Applicant | null>(null)
const previewPos = ref({ x: 0, y: 0 })
let photoHideTimer: ReturnType<typeof setTimeout> | null = null

function getFullName(a: Applicant | null | undefined): string {
  if (!a) return 'Applicant'
  return [a.first_name, a.middle_name, a.last_name, a.suffix].filter(Boolean).join(' ') || 'Applicant'
}

function onNameEnter(event: MouseEvent, applicant: Applicant) {
  if (photoHideTimer) clearTimeout(photoHideTimer)
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  previewPhotoApplicant.value = applicant
  hoveredPhotoId.value = applicant.id
  previewPos.value = { x: rect.left, y: rect.bottom + 8 }
}

function onNameLeave() {
  photoHideTimer = setTimeout(() => {
    hoveredPhotoId.value = null
    previewPhotoApplicant.value = null
  }, 150)
}

// ─── Selection support ─────────────────────────────
const selectedRows = computed<Applicant[]>({
  get() {
    if (!props.selectedIds) return []
    return props.applicants.filter((a) => props.selectedIds!.includes(a.id))
  },
  set(rows) {
    emit('update:selectedIds', rows.map((r) => r.id))
  },
})

// ─── Per-row loading tracker ─────────────────────────
const loadingIds = ref<Set<number>>(new Set())

function isRowLoading(id: number): boolean {
  return loadingIds.value.has(id)
}
function setRowLoading(id: number, loading: boolean) {
  const next = new Set(loadingIds.value)
  if (loading) next.add(id)
  else next.delete(id)
  loadingIds.value = next
}

// ─── Row menu ────────────────────────────────────────
const menuRefs = ref<Record<number, InstanceType<typeof Menu> | null>>({})
const activeApplicant = ref<Applicant | null>(null)

function toggleMenu(event: Event, applicant: Applicant) {
  activeApplicant.value = applicant
  menuRefs.value[applicant.id]?.toggle(event)
}

const menuItems = computed(() => {
  const a = activeApplicant.value
  if (!a) return []

  const items: any[] = [
    { label: 'View Details', icon: 'pi pi-eye',    command: () => goToView(a.id) },
    { label: 'Edit',         icon: 'pi pi-pencil', command: () => goToEdit(a.id) },
    { separator: true },
  ]

  if (a.status !== 'final_list' && a.status !== 'rejected') {
    items.push({
      label: 'Move to Final List',
      icon: 'pi pi-check-circle',
      class: '!text-green-600',
      command: () => handleMoveToFinalList(a),
    })
  }
  if (a.status !== 'rejected') {
    items.push({
      label: 'Reject',
      icon: 'pi pi-times-circle',
      class: '!text-red-600',
      command: () => openRejectDialog(a),
    })
  }
  items.push(
    { separator: true },
    { label: 'Delete', icon: 'pi pi-trash', class: '!text-red-600', command: () => confirmDelete(a) },
  )
  return items
})

// ─── Handlers ────────────────────────────────────────

function confirmNavigation(callback: () => void) {
  if (props.selectedIds && props.selectedIds.length > 0) {
    confirm.require({
      header: 'Discard Selection?',
      message: 'You currently have applicants selected. Proceeding will clear your bulk selection. Do you want to continue?',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Yes, proceed',
      rejectLabel: 'Cancel',
      acceptClass: '!bg-apricot-600 !border-apricot-600 hover:!bg-apricot-700',
      accept: () => {
        emit('clear-selection')
        callback()
      }
    })
  } else {
    callback()
  }
}

function goToView(id: number) {
  confirmNavigation(() => {
    router.push({ name: 'applicants.show', params: { id } })
  })
}

function goToEdit(id: number) {
  confirmNavigation(() => {
    router.push({ name: 'applicants.edit', params: { id } })
  })
}

function confirmDelete(applicant: Applicant) {
  selectedApplicant.value = applicant
  deleteDialog.value = true
}

function onDeleteConfirmed() {
  if (selectedApplicant.value) {
    emit('delete', selectedApplicant.value.id)
    deleteDialog.value = false
  }
}

function removeFromList(id: number) {
  const idx = store.applicants.findIndex((a) => a.id === id)
  if (idx !== -1) store.applicants.splice(idx, 1)
}

function onDeployed(applicantId: number) {
  removeFromList(applicantId)
  toast.add({
    severity: 'success',
    summary: '🚀 Deployed',
    detail: 'Applicant is now in the Deployments page',
    life: 4000,
  })
}

function handleMoveToFinalList(applicant: Applicant) {
  confirm.require({
    header: 'Move to Final List',
    message: `Move ${applicant.first_name} ${applicant.last_name} to the Final List?`,
    icon: 'pi pi-check-circle',
    acceptLabel: 'Yes, Move',
    rejectLabel: 'Cancel',
    acceptClass: '!bg-green-600 !border-green-600',
    accept: async () => {
      setRowLoading(applicant.id, true)
      try {
        const updated = await store.moveToFinalList(applicant.id)
        const batchName = updated.applicant_batches?.[0]?.batch?.name
        removeFromList(applicant.id)
        toast.add({
          severity: batchName ? 'success' : 'warn',
          summary: 'Moved to Final List',
          detail: batchName
            ? `${applicant.applicant_code} auto-assigned to batch: ${batchName}`
            : `${applicant.applicant_code} is in Final List (no active batch)`,
          life: 4000,
        })
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Failed',
          detail: e?.response?.data?.message ?? 'Could not update status',
          life: 4000,
        })
      } finally {
        setRowLoading(applicant.id, false)
      }
    },
  })
}

function openRejectDialog(applicant: Applicant) {
  selectedApplicant.value = applicant
  rejectDialog.value = true
}

async function onRejectConfirmed(reason: string) {
  if (!selectedApplicant.value) return
  const id   = selectedApplicant.value.id
  const code = selectedApplicant.value.applicant_code

  setRowLoading(id, true)
  try {
    await store.rejectApplicant(id, reason)
    removeFromList(id)
    toast.add({
      severity: 'success',
      summary: 'Applicant Rejected',
      detail: `${code} has been rejected.`,
      life: 3000,
    })
    rejectDialog.value = false
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Failed',
      detail: e?.response?.data?.message ?? 'Could not reject applicant',
      life: 4000,
    })
  } finally {
    setRowLoading(id, false)
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-CA')
  } catch {
    return '—'
  }
}
</script>

<template>
  <div class="flex flex-col relative">
    <DataTable
      :value="props.applicants"
      :loading="props.loading"
      v-model:selection="selectedRows"
      :selection-mode="selectable ? 'multiple' : undefined"
      :data-key="'id'"
      class="!border-none"
      size="small"
      :row-hover="true"
      :pt="{
        table: 'text-sm',
        header: '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow: 'hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
      }"
    >
      <!-- Checkbox Column -->
      <Column
        v-if="selectable"
        selection-mode="multiple"
        header-style="width: 40px"
        :exportable="false"
      />

      <!-- Code Column -->
      <Column field="applicant_code" header="Code" sortable style="width: 120px">
        <template #body="{ data }">
          <button 
            type="button" 
            class="font-mono text-xs text-apricot-600 font-semibold hover:text-apricot-700 hover:underline transition-colors focus:outline-none text-left"
            @click.stop="goToView(data.id)"
          >
            {{ data.applicant_code }}
          </button>
        </template>
      </Column>

      <!-- Applicant Column -->
      <Column header="Applicant" sortable sort-field="last_name">
        <template #body="{ data }">
          <button
            type="button"
            class="relative inline-flex items-center gap-3 cursor-pointer py-1 group focus:outline-none text-left"
            @mouseenter="onNameEnter($event, data)"
            @mouseleave="onNameLeave"
            @click.stop="goToView(data.id)"
          >
            <img
              :src="getApplicantPhoto(data)"
              :alt="getFullName(data)"
              class="w-9 h-9 rounded-full object-cover border border-appleCore-200 bg-appleCore-50 flex-shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-apricot-200 transition-all"
              @error="($event.target as HTMLImageElement).src = getDefaultAvatar(getFullName(data))"
            />
            <div class="flex flex-col items-start min-w-0">
              <span class="font-medium text-blueberry-800 group-hover:text-apricot-600 group-hover:underline transition-colors truncate">
                {{ getFullName(data) }}
              </span>
              <span class="text-xs text-blueberry-400 mt-0.5 truncate">{{ data.email }}</span>
            </div>
          </button>
        </template>
      </Column>

      <!-- Address (Barangay) -->
      <Column field="current_address" header="Address (Barangay)">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-700">{{ data.current_address || '—' }}</span>
        </template>
      </Column>

      <!-- ✅ Status Column (restored) -->
      <Column field="status" header="Status" style="width: 140px">
        <template #body="{ data }">
          <ApplicantStatusBadge :status="data.status" />
        </template>
      </Column>

      <!-- Passport Expiry -->
      <Column field="passport_expiry" header="Passport Expiry" style="width: 150px">
        <template #body="{ data }">
          <span
            class="text-sm"
            :class="!data.passport_expiry ? 'text-blueberry-300' : 'text-blueberry-700'"
          >
            {{ formatDate(data.passport_expiry) }}
          </span>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Actions" style="width: 180px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
              v-tooltip.top="'View'"
              :disabled="isRowLoading(data.id)"
              @click="goToView(data.id)"
            />

            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
              v-tooltip.top="'Edit'"
              :disabled="isRowLoading(data.id)"
              @click="goToEdit(data.id)"
            />

            <!-- ✅ Move to Final List (kept) -->
            <Button
              v-if="data.status !== 'final_list' && data.status !== 'rejected'"
              icon="pi pi-check-circle"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-green-600 hover:!bg-green-50"
              v-tooltip.top="'Move to Final List'"
              :loading="isRowLoading(data.id)"
              @click="handleMoveToFinalList(data)"
            />

            <!-- ✅ Deploy for final_list applicants (kept) -->
            <DeployButton
              v-if="data.status === 'final_list' && data.applicant_batches?.[0]?.id"
              :applicant-batch-id="data.applicant_batches[0].id"
              :applicant-name="`${data.first_name} ${data.last_name}`"
              :applicant-code="data.applicant_code"
              @deployed="onDeployed(data.id)"
            />

            <Button
              v-if="data.status !== 'rejected'"
              icon="pi pi-times-circle"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-red-500 hover:!bg-red-50"
              v-tooltip.top="'Reject'"
              :disabled="isRowLoading(data.id)"
              @click="openRejectDialog(data)"
            />

            <Button
              icon="pi pi-ellipsis-v"
              text
              rounded
              size="small"
              class="!text-blueberry-500 hover:!text-blueberry-800 hover:!bg-appleCore-100"
              v-tooltip.top="'More'"
              :disabled="isRowLoading(data.id)"
              @click="toggleMenu($event, data)"
            />
            <Menu
              :ref="(el: any) => (menuRefs[data.id] = el)"
              :model="menuItems"
              :popup="true"
              :append-to="'body'"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-inbox text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No applicants found</p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading applicants...</p>
        </div>
      </template>
    </DataTable>

    <AppPagination
      v-if="props.pagination && props.pagination.total > 0"
      :pagination="props.pagination"
      @page-change="(page) => emit('page-change', page)"
      @limit-change="(limit) => emit('limit-change', limit)"
    />

    <ApplicantDeleteDialog
      v-model:visible="deleteDialog"
      :applicant="selectedApplicant"
      :loading="selectedApplicant ? isRowLoading(selectedApplicant.id) : false"
      @confirm="onDeleteConfirmed"
    />

    <RejectApplicantDialog
      v-model:visible="rejectDialog"
      :applicant="selectedApplicant"
      :loading="selectedApplicant ? isRowLoading(selectedApplicant.id) : false"
      @confirm="onRejectConfirmed"
    />
  </div>
</template>