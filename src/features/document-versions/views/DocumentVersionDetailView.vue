<!-- src/features/document-versions/views/DocumentVersionDetailView.vue -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button   from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useToast } from 'primevue/usetoast'

import http from '@shared/api/http'
import { useDocumentVersionStore } from '../stores/documentVersion.store'
import { formatFileSize, formatVersionDate, fileIcon } from '../utils/versionFormatters'

const props = defineProps<{ id: number }>()

const router = useRouter()
const toast  = useToast()
const store  = useDocumentVersionStore()

const previewUrl     = ref('')
const previewLoading = ref(false)
const previewError   = ref<string | null>(null)

const v = computed(() => store.currentVersion)

onMounted(async () => {
  await store.fetchVersion(props.id)
  await loadPreview()
})

watch(() => v.value?.id, loadPreview)

onBeforeUnmount(() => {
  if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
})

const isImage = computed(() => v.value?.mime_type?.startsWith('image/') ?? false)
const isPdf   = computed(() => v.value?.mime_type === 'application/pdf')

async function loadPreview() {
  if (!v.value) return
  previewLoading.value = true
  previewError.value   = null

  try {
    const { data } = await http.get(`/applicant-documents/${v.value.id}/preview`, {
      responseType: 'blob',
    })
    const mime = data?.type || v.value.mime_type || 'application/octet-stream'
    const blob = new Blob([data], { type: mime })
    if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(blob)
  } catch (e: any) {
    previewError.value = e?.response?.status === 404
      ? 'File not found on server.'
      : 'Preview failed.'
  } finally {
    previewLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8 max-w-[1100px] mx-auto">
    <div class="flex items-center gap-3">
      <Button icon="pi pi-arrow-left" text rounded @click="router.back()" />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          Version Detail
        </h1>
        <p v-if="v" class="text-sm text-blueberry-500">
          v{{ v.version_number }} · {{ v.file_name }}
        </p>
      </div>
    </div>

    <template v-if="store.loading || !v">
      <Skeleton height="120px" border-radius="16px" />
      <Skeleton height="480px" border-radius="16px" />
    </template>

    <template v-else>
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl bg-apricot-50 text-apricot-600
                      flex items-center justify-center flex-shrink-0">
            <i :class="`pi ${fileIcon(v.mime_type)} text-xl`" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded bg-blueberry-100 text-blueberry-700
                           text-xs font-bold">
                v{{ v.version_number }}
              </span>
              <span v-if="v.is_current"
                    class="px-2 py-0.5 bg-green-50 text-green-700 text-[10px]
                           font-semibold uppercase tracking-wide rounded">
                Current
              </span>
            </div>
            <h2 class="text-lg font-serif font-semibold text-blueberry-800 mt-1 break-all">
              {{ v.file_name }}
            </h2>
            <div class="flex flex-wrap gap-4 text-xs text-blueberry-500 mt-1">
              <span>{{ formatFileSize(v.file_size) }}</span>
              <span>{{ formatVersionDate(v.created_at) }}</span>
              <span v-if="v.uploader">by {{ v.uploader.name }}</span>
            </div>
            <p v-if="v.change_reason"
               class="text-sm italic text-blueberry-600 mt-2">
              “{{ v.change_reason }}”
            </p>
          </div>
        </div>
      </section>

      <!-- Preview -->
      <section class="bg-white rounded-2xl border border-appleCore-100 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-appleCore-100">
          <h3 class="text-base font-serif font-semibold text-blueberry-800 flex items-center gap-2">
            <i class="pi pi-eye text-apricot-500" />
            Preview
          </h3>
          <Button icon="pi pi-refresh" text rounded size="small"
                  :loading="previewLoading" @click="loadPreview" />
        </div>

        <div class="bg-appleCore-50/40 min-h-[500px] flex items-center justify-center p-4">
          <div v-if="previewLoading" class="text-center">
            <i class="pi pi-spin pi-spinner text-3xl text-apricot-500 block mb-2" />
            <p class="text-sm text-blueberry-500">Loading…</p>
          </div>

          <div v-else-if="previewError" class="text-center">
            <i class="pi pi-exclamation-circle text-4xl text-red-400 block mb-2" />
            <p class="text-sm text-red-600">{{ previewError }}</p>
          </div>

          <img v-else-if="isImage && previewUrl" :src="previewUrl"
               class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm" />

          <iframe v-else-if="isPdf && previewUrl" :src="previewUrl"
                  class="w-full h-[70vh] bg-white rounded-lg border-0" />

          <div v-else class="text-center">
            <i class="pi pi-file text-5xl text-blueberry-300 block mb-3" />
            <p class="text-blueberry-500">Preview not available for this file type.</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>