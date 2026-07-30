<!-- src/features/documents/components/ApplicantDocumentFolder.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import DocumentStatusBadge from './DocumentStatusBadge.vue'
import type {
  ApplicantFolder,
  DocumentGroup,
  FolderVersion,
} from '../types/folders'

const props = defineProps<{
  folder:   ApplicantFolder
  expanded: boolean
}>()

const emit = defineEmits<{ (e: 'toggle'): void }>()

const router = useRouter()

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function goToApplicant() {
  router.push({ name: 'applicants.view', params: { id: props.folder.applicant_id } })
}
function goToDocument(v: FolderVersion) {
  router.push({ name: 'documents.view', params: { id: v.id } })
}
function editDocument(v: FolderVersion) {
  router.push({ name: 'documents.edit', params: { id: v.id } })
}
function uploadNewVersion(group: DocumentGroup) {
  router.push({
    name:  'documents.create',
    query: {
      applicant_id:     props.folder.applicant_id,
      document_type_id: group.document_type_id,
    },
  })
}
</script>

<template>
  <div class="rounded-2xl border border-appleCore-100 bg-white overflow-hidden transition-shadow hover:shadow-sm">
    <!-- ─── Folder header ───────────────────────────────────────────────── -->
    <button
      class="w-full flex items-center gap-4 px-5 py-4 hover:bg-appleCore-50/40 transition-colors text-left"
      @click="emit('toggle')"
    >
      <i
        class="pi text-blueberry-400 transition-transform duration-200"
        :class="expanded ? 'pi-chevron-down rotate-0' : 'pi-chevron-right'"
      />

      <div
        class="w-11 h-11 rounded-full bg-apricot-500 text-white flex items-center justify-center
               font-serif font-bold text-sm flex-shrink-0"
      >
        {{ initials(folder.applicant_name) }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="font-semibold text-blueberry-800 truncate">
            {{ folder.applicant_name }}
          </p>
          <span
            v-if="folder.has_pending"
            class="text-[10px] font-bold uppercase tracking-wide
                   text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded"
          >
            Pending Review
          </span>
        </div>
        <div class="flex items-center gap-3 text-xs mt-0.5">
          <span class="font-mono text-apricot-600 font-semibold">
            {{ folder.applicant_code }}
          </span>
          <span v-if="folder.applicant_email" class="text-blueberry-400 truncate">
            {{ folder.applicant_email }}
          </span>
        </div>
      </div>

      <div class="hidden sm:flex items-center gap-4 text-xs">
        <div class="text-center">
          <p class="font-bold text-blueberry-800 text-base tabular-nums">
            {{ folder.total_types }}
          </p>
          <p class="text-blueberry-400 uppercase tracking-wide">Types</p>
        </div>
        <div class="text-center">
          <p class="font-bold text-blueberry-800 text-base tabular-nums">
            {{ folder.total_documents }}
          </p>
          <p class="text-blueberry-400 uppercase tracking-wide">Files</p>
        </div>
      </div>

      <Button
        icon="pi pi-external-link"
        text
        rounded
        size="small"
        class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50 flex-shrink-0"
        v-tooltip.top="'Open applicant profile'"
        @click.stop="goToApplicant"
      />
    </button>

    <!-- ─── Folder body ─────────────────────────────────────────────────── -->
    <div v-if="expanded" class="border-t border-appleCore-100 bg-appleCore-50/20">
      <div
        v-for="group in folder.groups"
        :key="group.document_type_id"
        class="border-b border-appleCore-100/60 last:border-b-0"
      >
        <div class="flex items-center gap-3 px-5 py-3">
          <div
            class="w-8 h-8 rounded-lg bg-apricot-50 text-apricot-600
                   flex items-center justify-center flex-shrink-0"
          >
            <i class="pi pi-file text-xs" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-semibold text-sm text-blueberry-800 truncate">
                {{ group.document_type_name }}
              </p>
              <span
                class="font-mono text-[10px] text-apricot-600 font-semibold
                       bg-apricot-50 px-1.5 py-0.5 rounded"
              >
                {{ group.document_type_code }}
              </span>
              <span class="text-[10px] text-blueberry-400">
                {{ group.total_versions }} version{{ group.total_versions === 1 ? '' : 's' }}
              </span>
            </div>
          </div>

          <!-- 🔑 Backend flattened this to latest_status (not latest.status) -->
          <DocumentStatusBadge :status="group.latest_status" />

          <Button
            icon="pi pi-plus"
            text
            rounded
            size="small"
            class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50 flex-shrink-0"
            v-tooltip.top="'Upload new version'"
            @click="uploadNewVersion(group)"
          />
        </div>

        <div class="pl-16 pr-5 pb-3 flex flex-col gap-1">
          <div
            v-for="v in group.versions"
            :key="v.id"
            class="flex items-center gap-3 px-3 py-2 rounded-lg
                   hover:bg-white border border-transparent hover:border-appleCore-100 transition-colors"
            :class="v.is_current ? 'bg-white border-appleCore-100' : ''"
          >
            <span
              class="w-9 h-6 rounded-md text-[10px] font-bold tabular-nums
                     flex items-center justify-center flex-shrink-0"
              :class="v.is_current
                ? 'bg-apricot-500 text-white'
                : 'bg-appleCore-100 text-blueberry-600'"
            >
              v{{ v.version }}
            </span>

            <div class="flex-1 min-w-0">
              <p class="text-sm text-blueberry-700 truncate">
                {{ v.file_name }}
              </p>
              <div class="flex items-center gap-2 text-[11px] text-blueberry-400 mt-0.5">
                <span>{{ formatSize(v.file_size) }}</span>
                <span>·</span>
                <span>Uploaded {{ new Date(v.uploaded_at).toLocaleDateString() }}</span>
                <template v-if="v.expiry_date">
                  <span>·</span>
                  <span>Expires {{ v.expiry_date }}</span>
                </template>
              </div>
            </div>

            <div class="flex items-center gap-0.5" @click.stop>
              <Button
                icon="pi pi-eye"
                text
                rounded
                size="small"
                class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
                v-tooltip.top="'View'"
                @click="goToDocument(v)"
              />
              <Button
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
                v-tooltip.top="'Edit'"
                @click="editDocument(v)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>