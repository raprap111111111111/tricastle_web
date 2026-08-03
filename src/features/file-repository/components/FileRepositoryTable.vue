<!-- src/features/file-repository/components/FileRepositoryTable.vue -->
<script setup lang="ts">
import { ref, computed }             from 'vue'
import DataTable                     from 'primevue/datatable'
import Column                        from 'primevue/column'
import Button                        from 'primevue/button'
import Tag                           from 'primevue/tag'
import Paginator, { type PageState } from 'primevue/paginator'
import FileSizeLabel                 from './FileSizeLabel.vue'
import FileRepositoryDeleteDialog    from './FileRepositoryDeleteDialog.vue'
import type { FileRepository, Pagination } from '../types'

// ─── Props / Emits ───────────────────────────────────────────────────
const props = defineProps<{
  files:      FileRepository[]
  pagination: Pagination | null
  loading:    boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page',   page: number): void
  (e: 'delete', id:   number): void
  (e: 'purge',  id:   number): void
}>()

// ─── Dialog state ─────────────────────────────────────────────────────
const deleteDialog = ref(false)
const purgeDialog  = ref(false)
const selected     = ref<FileRepository | null>(null)

// ─── Pagination helpers ───────────────────────────────────────────────
const currentLimit = computed(() => props.pagination?.per_page ?? 10)

const currentFirst = computed(() => {
  if (!props.pagination) return 0
  return (props.pagination.current_page - 1) * currentLimit.value
})

// ─── Handlers ─────────────────────────────────────────────────────────
function openDelete(file: FileRepository) {
  selected.value     = file
  deleteDialog.value = true
}

function openPurge(file: FileRepository) {
  selected.value    = file
  purgeDialog.value = true
}

function onDeleteConfirmed() {
  if (!selected.value) return
  emit('delete', selected.value.id)
  deleteDialog.value = false
  selected.value     = null
}

function onPurgeConfirmed() {
  if (!selected.value) return
  emit('purge', selected.value.id)
  purgeDialog.value = false
  selected.value    = null
}

function onPageChange(event: PageState) {
  if (event.rows !== currentLimit.value) {
    // rows-per-page changed — reset to page 1 with new limit
    emit('page', 1)
    return
  }
  emit('page', event.page + 1)
}

// ─── Formatters ───────────────────────────────────────────────────────
function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-CA')
  } catch {
    return '—'
  }
}

function mimeIcon(mime: string): string {
  if (mime.startsWith('image/'))           return 'pi pi-image'
  if (mime === 'application/pdf')          return 'pi pi-file-pdf'
  if (mime.includes('word'))               return 'pi pi-file-word'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'pi pi-file-excel'
  if (mime.startsWith('text/'))            return 'pi pi-file'
  if (mime.includes('zip'))                return 'pi pi-box'
  return 'pi pi-file'
}

function mimeColor(mime: string): string {
  if (mime.startsWith('image/'))  return 'text-purple-500'
  if (mime.includes('pdf'))       return 'text-red-500'
  if (mime.includes('word'))      return 'text-blue-500'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'text-green-600'
  if (mime.startsWith('text/'))   return 'text-blueberry-400'
  return 'text-blueberry-400'
}

function diskSeverity(disk: string) {
  const map: Record<string, string> = {
    local:  'info',
    s3:     'success',
    public: 'warning',
  }
  return map[disk] ?? 'info'
}
</script>

<template>
  <div class="bg-white border border-appleCore-200 rounded-2xl overflow-hidden shadow-sm">

    <!-- ── Card header ───────────────────────────────────────────────── -->
    <div
      class="flex items-center justify-between px-5 py-4
             border-b border-appleCore-100"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-blueberry-50 flex items-center justify-center">
          <i class="pi pi-folder text-blueberry-500 text-sm" />
        </div>
        <div>
          <h2 class="text-sm font-semibold text-blueberry-800">All Files</h2>
          <p class="text-xs text-blueberry-400">
            {{ pagination?.total ?? 0 }} file(s) in repository
          </p>
        </div>
      </div>

      <!-- live count badge -->
      <span
        class="text-xs font-semibold text-blueberry-600 bg-blueberry-50
               px-3 py-1 rounded-full border border-blueberry-100"
      >
        {{ pagination?.total ?? 0 }} total
      </span>
    </div>

    <!-- ── DataTable ──────────────────────────────────────────────────── -->
    <DataTable
      :value="props.files"
      :loading="props.loading"
      class="!border-none"
      size="small"
      :row-hover="true"
      :pt="{
        table:     'text-sm',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow:   '!border-b !border-appleCore-100/60 hover:!bg-appleCore-50/40 transition-colors',
      }"
    >

      <!-- File Name + Hash ─────────────────────────────────────────── -->
      <Column header="File" sort-field="original_name" sortable>
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">
            File
          </span>
        </template>
        <template #body="{ data }">
          <div class="flex items-center gap-3 py-1">
            <!-- MIME icon -->
            <div
              class="w-9 h-9 rounded-xl bg-appleCore-50 border border-appleCore-200
                     flex items-center justify-center flex-shrink-0"
            >
              <i :class="[mimeIcon(data.mime_type), mimeColor(data.mime_type), 'text-sm']" />
            </div>
            <div class="flex flex-col min-w-0">
              <span
                class="font-medium text-blueberry-800 text-sm truncate max-w-[220px]"
                v-tooltip.top="data.original_name"
              >
                {{ data.original_name }}
              </span>
              <span class="font-mono text-xs text-blueberry-300 truncate max-w-[220px]">
                {{ data.file_hash.substring(0, 20) }}…
              </span>
            </div>
          </div>
        </template>
      </Column>

      <!-- Size ────────────────────────────────────────────────────────── -->
      <Column sort-field="file_size" sortable style="width: 100px">
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">Size</span>
        </template>
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">
            <FileSizeLabel :bytes="data.file_size" :decimals="1" />
          </span>
        </template>
      </Column>

      <!-- Type ────────────────────────────────────────────────────────── -->
      <Column style="width: 130px">
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">Type</span>
        </template>
        <template #body="{ data }">
          <span
            class="text-xs text-blueberry-500 bg-appleCore-100 rounded-lg
                   px-2 py-0.5 font-medium"
          >
            {{ data.mime_type.split('/')[1] ?? data.mime_type }}
          </span>
        </template>
      </Column>

      <!-- Disk ────────────────────────────────────────────────────────── -->
      <Column style="width: 90px">
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">Disk</span>
        </template>
        <template #body="{ data }">
          <Tag
            :value="data.disk"
            :severity="diskSeverity(data.disk)"
            class="!text-xs capitalize"
          />
        </template>
      </Column>

      <!-- References ──────────────────────────────────────────────────── -->
      <Column sort-field="reference_count" sortable style="width: 90px">
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">Refs</span>
        </template>
        <template #body="{ data }">
          <div class="flex items-center gap-1.5">
            <span
              class="text-sm font-bold tabular-nums"
              :class="data.reference_count === 0
                ? 'text-red-400'
                : 'text-blueberry-700'"
            >
              {{ data.reference_count }}
            </span>
            <span
              v-if="data.reference_count === 0"
              class="text-xs text-red-400 italic"
            >
              unused
            </span>
          </div>
        </template>
      </Column>

      <!-- Encrypted ───────────────────────────────────────────────────── -->
      <Column style="width: 90px">
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">Enc.</span>
        </template>
        <template #body="{ data }">
          <i
            :class="data.is_encrypted
              ? 'pi pi-lock text-amber-500'
              : 'pi pi-unlock text-blueberry-200'"
            v-tooltip.top="data.is_encrypted ? 'Encrypted' : 'Not encrypted'"
          />
        </template>
      </Column>

      <!-- Uploader ────────────────────────────────────────────────────── -->
      <Column style="width: 130px">
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">
            Uploaded By
          </span>
        </template>
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">
            {{ data.uploader?.name ?? '—' }}
          </span>
        </template>
      </Column>

      <!-- Date ────────────────────────────────────────────────────────── -->
      <Column sort-field="created_at" sortable style="width: 120px">
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">Date</span>
        </template>
        <template #body="{ data }">
          <span class="text-sm text-blueberry-500">
            {{ formatDate(data.created_at) }}
          </span>
        </template>
      </Column>

      <!-- Actions ─────────────────────────────────────────────────────── -->
      <Column style="width: 100px">
        <template #header>
          <span class="text-xs font-semibold text-blueberry-500 uppercase tracking-wider">
            Actions
          </span>
        </template>
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-trash"
              text rounded size="small"
              class="!text-blueberry-400 hover:!text-amber-500 hover:!bg-amber-50"
              v-tooltip.top="'Soft Delete'"
              @click="openDelete(data)"
            />
            <Button
              icon="pi pi-ban"
              text rounded size="small"
              class="!text-blueberry-400 hover:!text-red-600 hover:!bg-red-50"
              v-tooltip.top="'Purge Permanently'"
              @click="openPurge(data)"
            />
          </div>
        </template>
      </Column>

      <!-- ── Empty state ──────────────────────────────────────────────── -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div
            class="w-16 h-16 rounded-full bg-appleCore-50
                   flex items-center justify-center"
          >
            <i class="pi pi-folder-open text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No files found</p>
          <p class="text-xs text-blueberry-400">
            Try adjusting your filters or upload a new file
          </p>
        </div>
      </template>

      <!-- ── Loading state ────────────────────────────────────────────── -->
      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading files…</p>
        </div>
      </template>

    </DataTable>

    <!-- ── Pagination Footer ─────────────────────────────────────────── -->
    <div
      v-if="pagination && pagination.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3
             px-5 py-3 border-t border-appleCore-100 bg-appleCore-50/30"
    >
      <!-- Entry count -->
      <p class="text-xs text-blueberry-500">
        Showing
        <span class="font-semibold text-blueberry-700">
          {{ pagination.from ?? currentFirst + 1 }}
        </span>
        –
        <span class="font-semibold text-blueberry-700">
          {{ pagination.to ?? Math.min(currentFirst + currentLimit, pagination.total) }}
        </span>
        of
        <span class="font-semibold text-blueberry-700">{{ pagination.total }}</span>
        files
      </p>

      <Paginator
        :rows="currentLimit"
        :total-records="pagination.total"
        :first="currentFirst"
        :rows-per-page-options="[10, 25, 50, 100]"
        template="PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
        class="!bg-transparent !p-0"
        @page="onPageChange"
      />
    </div>

    <!-- ── Dialogs ───────────────────────────────────────────────────── -->
    <FileRepositoryDeleteDialog
      v-model:visible="deleteDialog"
      :file="selected"
      :loading="props.submitting"
      mode="soft"
      @confirm="onDeleteConfirmed"
    />

    <FileRepositoryDeleteDialog
      v-model:visible="purgeDialog"
      :file="selected"
      :loading="props.submitting"
      mode="purge"
      @confirm="onPurgeConfirmed"
    />

  </div>
</template>