<!-- src/features/document-versions/views/DocumentVersionListView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'

import DocumentVersionList          from '../components/DocumentVersionList.vue'
import DocumentVersionTimeline      from '../components/DocumentVersionTimeline.vue'
import DocumentVersionUploadDialog  from '../components/DocumentVersionUploadDialog.vue'
import { useDocumentVersionStore }  from '../stores/documentVersion.store'
import { useDocumentVersions }      from '../composables/useDocumentVersions'

const props = defineProps<{ applicantDocumentId: number }>()

const route  = useRoute()
const router = useRouter()
const store  = useDocumentVersionStore()
const confirm = useConfirm()

const { versions, activeVersion, loading, makeCurrent, removeVersion, refresh } =
  useDocumentVersions(props.applicantDocumentId)

const uploadOpen = ref(false)

function viewVersion(id: number) {
  router.push({ name: 'document-versions.detail', params: { id } })
}

function confirmRestore(id: number) {
  confirm.require({
    message: 'Set this version as the current file? The active pointer will change.',
    header:  'Restore this version?',
    icon:    'pi pi-refresh',
    accept:  () => makeCurrent(id),
  })
}

function confirmDelete(id: number) {
  confirm.require({
    message: 'This will permanently remove this version. This cannot be undone.',
    header:  'Delete version?',
    icon:    'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept:  () => removeVersion(id),
  })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1100px] mx-auto">
    <ConfirmDialog />

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          Document Versions
        </h1>
        <p class="text-sm text-blueberry-500 mt-1">
          Complete history of file uploads for this document.
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          icon="pi pi-refresh"
          text rounded
          @click="refresh"
          v-tooltip.top="'Refresh'"
        />
        <Button
          icon="pi pi-upload"
          label="Upload New Version"
          class="!bg-apricot-500 !border-apricot-500 !text-white
                 hover:!bg-apricot-600 hover:!border-apricot-600"
          @click="uploadOpen = true"
        />
      </div>
    </div>

    <!-- Grid: list + timeline -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <DocumentVersionList
          :versions="versions"
          :loading="loading"
          can-restore
          can-delete
          @view="viewVersion"
          @restore="confirmRestore"
          @delete="confirmDelete"
        />
      </div>

      <aside class="bg-white border border-appleCore-100 rounded-2xl p-5">
        <h3 class="text-sm font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-history text-apricot-500" />
          Timeline
        </h3>
        <DocumentVersionTimeline :versions="versions" />
      </aside>
    </div>

    <!-- Upload Dialog -->
    <DocumentVersionUploadDialog
      v-model:visible="uploadOpen"
      :applicant-document-id="applicantDocumentId"
      :document-name="activeVersion?.file_name"
      @uploaded="refresh"
    />
  </div>
</template>