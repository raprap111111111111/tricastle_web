<!-- src/features/file-repository/components/FileRepositoryTable.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import DataTable  from 'primevue/datatable'
import Column     from 'primevue/column'
import Button     from 'primevue/button'
import Tooltip    from 'primevue/tooltip'
import Tag        from 'primevue/tag'
import FileTypeBadge            from './FileTypeBadge.vue'
import FileSizeLabel            from './FileSizeLabel.vue'
import FileRepositoryDeleteDialog from './FileRepositoryDeleteDialog.vue'
import FileRepositoryPurgeDialog  from './FileRepositoryPurgeDialog.vue'
import type { FileRepository, Pagination } from '../types'

// ─── Directives ───────────────────────────────────────────────────────
const vTooltip = Tooltip

// ─── Props / Emits ────────────────────────────────────────────────────
defineProps<{
  files:       FileRepository[]
  pagination:  Pagination
  loading:     boolean
  submitting:  boolean
}>()

const emit = defineEmits<{
  page:   [page: number]   // 0-based
  delete: [id: number]
  purge:  [id: number]
}>()

// ─── Dialog state ─────────────────────────────────────────────────────
const deleteVisible = ref(false)
const purgeVisible  = ref(false)
const targetFile    = ref<FileRepository | null>(null)

function openDelete(file: FileRepository) {
  targetFile.value    = file
  deleteVisible.value = true
}

function openPurge(file: FileRepository) {
  targetFile.value   = file
  purgeVisible.value = true
}

function onDeleteConfirm(id: number) {
  emit('delete', id)
  deleteVisible.value = false
}

function onPurgeConfirm(id: number) {
  emit('purge', id)
  purgeVisible.value = false
}

// ─── Helpers ──────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })
}

function truncateHash(hash: string, len = 16): string {
  return hash.length > len ? hash.slice(0, len) + '…' : hash
}

function diskSeverity(disk: string): string {
  if (disk === 's3')     return 'info'
  if (disk === 'public') return 'warn'
  return 'secondary'
}

function onPageChange(evt: { page: number }) {
  emit('page', evt.page)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-appleCore-200 overflow-hidden">

    <DataTable
      :value="files"
      :loading="loading"
      data-key="id"
      :rows="pagination.per_page"
      :total-records="pagination.total"
      lazy
      :pt="{
        root:       { class: 'w-full' },
        thead:      { class: 'bg-appleCore-50 border-b border-appleCore-200' },
        headerCell: { class: 'px-4 py-3 text-left text-xs font-semibold text-blueberry-500 uppercase tracking-wide' },
        bodyRow:    { class: 'border-b border-appleCore-100 hover:bg-appleCore-50 transition-colors' },
        bodyCell:   { class: 'px-4 py-3 text-sm text-blueberry-700' },
        emptyMessage: { class: 'text-center text-blueberry-400 py-16' },
        loadingOverlay: { class: 'bg-white/60 backdrop-blur-sm' },
      }"
    >

      <!-- Empty state -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-14 h-14 rounded-2xl bg-appleCore-50 border border-appleCore-200 flex items-center justify-center">
            <i class="pi pi-folder-open text-blueberry-300 text-2xl" />
          </div>
          <p class="text-blueberry-500 font-medium text-sm">No files found</p>
          <p class="text-blueberry-400 text-xs">Try adjusting your filters or upload a new file.</p>
        </div>
      </template>

      <!-- Loading state -->
      <template #loading>
        <div class="flex items-center justify-center py-16 gap-2">
          <i class="pi pi-spin pi-spinner text-blueberry-400 text-xl" />
          <span class="text-blueberry-400 text-sm">Loading files…</span>
        </div>
      </template>

      <!-- ── Columns ─────────────────────────────────────────────── -->

      <!-- Name + badge -->
      <Column header="File" :style="{ minWidth: '220px' }">
        <template #body="{ data }">
          <div class="flex flex-col gap-1">
            <span
              class="font-medium text-blueberry-800 truncate max-w-[200px] block"
              :title="data.original_name"
            >
              {{ data.original_name }}
            </span>
            <FileTypeBadge :mime-type="data.mime_type" />
          </div>
        </template>
      </Column>

      <!-- Hash -->
      <Column header="Hash" :style="{ minWidth: '150px' }">
        <template #body="{ data }">
          <span
            v-tooltip="{ value: data.file_hash, showDelay: 300 }"
            class="font-mono text-xs text-apricot-600 cursor-help"
          >
            {{ truncateHash(data.file_hash) }}
          </span>
        </template>
      </Column>

      <!-- Size -->
      <Column header="Size" :style="{ minWidth: '90px' }">
        <template #body="{ data }">
          <FileSizeLabel :bytes="data.file_size" />
        </template>
      </Column>

      <!-- Disk -->
      <Column header="Disk" :style="{ minWidth: '90px' }">
        <template #body="{ data }">
          <Tag
            :value="data.disk"
            :severity="diskSeverity(data.disk)"
            :pt="{ root: { class: 'text-xs rounded-lg px-2 py-0.5 uppercase font-medium' } }"
          />
        </template>
      </Column>

      <!-- Encrypted -->
      <Column header="Enc." :style="{ minWidth: '64px' }">
        <template #body="{ data }">
          <i
            v-if="data.is_encrypted"
            class="pi pi-lock text-blueberry-500"
            v-tooltip="'Encrypted'"
          />
          <i
            v-else
            class="pi pi-lock-open text-appleCore-300"
            v-tooltip="'Not encrypted'"
          />
        </template>
      </Column>

      <!-- Reference count -->
      <Column header="Refs" :style="{ minWidth: '64px' }">
        <template #body="{ data }">
          <span
            :class="[
              'inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold',
              data.reference_count === 0
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-appleCore-50 text-blueberry-600 border border-appleCore-200',
            ]"
            :title="data.reference_count === 0 ? 'Unused — safe to purge' : `Referenced by ${data.reference_count} document(s)`"
          >
            {{ data.reference_count }}
          </span>
        </template>
      </Column>

      <!-- Uploaded date -->
      <Column header="Uploaded" :style="{ minWidth: '120px' }">
        <template #body="{ data }">
          <span class="text-blueberry-400 text-xs">{{ formatDate(data.created_at) }}</span>
        </template>
      </Column>

      <!-- Uploader -->
      <Column header="By" :style="{ minWidth: '100px' }">
        <template #body="{ data }">
          <span v-if="data.uploader" class="text-xs text-blueberry-500">
            {{ data.uploader.name }}
          </span>
          <span v-else class="text-xs text-blueberry-300">—</span>
        </template>
      </Column>

      <!-- Actions -->
      <Column header="Actions" :style="{ minWidth: '120px' }" frozen align-frozen="right">
        <template #body="{ data }">
          <div class="flex items-center gap-1">

            <!-- Soft delete -->
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="danger"
              v-tooltip="'Soft delete'"
              :disabled="submitting"
              @click="openDelete(data)"
              :pt="{ root: { class: 'w-8 h-8' } }"
            />

            <!-- Purge -->
            <Button
              icon="pi pi-bomb"
              text
              rounded
              size="small"
              severity="danger"
              v-tooltip="data.reference_count > 0 ? 'Cannot purge — still referenced' : 'Permanently purge'"
              :disabled="submitting"
              @click="openPurge(data)"
              :pt="{
                root: {
                  class: [
                    'w-8 h-8',
                    data.reference_count > 0 ? 'opacity-30 cursor-not-allowed' : ''
                  ]
                }
              }"
            />

          </div>
        </template>
      </Column>

    </DataTable>

    <!-- ── Paginator ───────────────────────────────────────────────── -->
    <div
      v-if="pagination.last_page > 1"
      class="flex items-center justify-between px-4 py-3 border-t border-appleCore-100 bg-appleCore-50"
    >
      <span class="text-xs text-blueberry-400">
        Showing
        {{ pagination.offset + 1 }}–{{ Math.min(pagination.offset + pagination.per_page, pagination.total) }}
        of {{ pagination.total }} files
      </span>

      <div class="flex items-center gap-1">
        <Button
          icon="pi pi-angle-left"
          text
          rounded
          size="small"
          :disabled="pagination.current_page <= 1 || loading"
          @click="$emit('page', pagination.current_page - 2)"
          :pt="{ root: { class: 'w-8 h-8 text-blueberry-500' } }"
        />

        <span class="text-xs text-blueberry-600 px-2 font-medium">
          {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>

        <Button
          icon="pi pi-angle-right"
          text
          rounded
          size="small"
          :disabled="pagination.current_page >= pagination.last_page || loading"
          @click="$emit('page', pagination.current_page)"
          :pt="{ root: { class: 'w-8 h-8 text-blueberry-500' } }"
        />
      </div>
    </div>

  </div>

  <!-- ── Dialogs ──────────────────────────────────────────────────────── -->
  <FileRepositoryDeleteDialog
    v-model:visible="deleteVisible"
    :file="targetFile"
    :submitting="submitting"
    @confirm="onDeleteConfirm"
    @cancel="deleteVisible = false"
  />

  <FileRepositoryPurgeDialog
    v-model:visible="purgeVisible"
    :file="targetFile"
    :submitting="submitting"
    @confirm="onPurgeConfirm"
    @cancel="purgeVisible = false"
  />
</template>