// src/features/file-repository/stores/file-repository.store.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fileRepositoryApi } from '../api/file-repository.api'
import type {
  FileRepository,
  FileRepositoryFilters,
  Pagination,
} from '../types'

const DEFAULT_FILTERS: FileRepositoryFilters = {
  offset:    0,
  limit:     10,
  order_by:  'created_at',
  order_dir: 'desc',
}

export const useFileRepositoryStore = defineStore('fileRepository', () => {

  // ─── State ───────────────────────────────────────────────────────────
  const files          = ref<FileRepository[]>([])
  const pagination     = ref<Pagination | null>(null)
  const filters        = ref<FileRepositoryFilters>({ ...DEFAULT_FILTERS })
  const loading        = ref(false)
  const submitting     = ref(false)
  const uploadProgress = ref(0)
  const error          = ref<string | null>(null)

  // ─── Computed ────────────────────────────────────────────────────────
  const totalFiles = computed(() => pagination.value?.total ?? 0)

  const encryptedCount = computed(
    () => files.value.filter(f => f.is_encrypted).length
  )

  const unusedCount = computed(
    () => files.value.filter(f => f.reference_count === 0).length
  )

  const totalSize = computed(
    () => files.value.reduce((acc, f) => acc + f.file_size, 0)
  )

  // ─── Actions ─────────────────────────────────────────────────────────
  async function fetchFiles() {
    loading.value = true
    error.value   = null

    try {
      const res = await fileRepositoryApi.getAll(filters.value)
      const d   = res.data.data

      files.value = d.records

      pagination.value = {
        total:        d.total,
        offset:       d.offset,
        limit:        d.limit,
        per_page:     d.per_page,
        current_page: d.current_page,
        last_page:    d.last_page,
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Failed to load files.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function uploadFile(file: File, extra?: Record<string, any>) {
    submitting.value    = true
    uploadProgress.value = 0
    error.value          = null

    try {
      const res = await fileRepositoryApi.upload(
        file,
        extra,
        (progressEvent: ProgressEvent) => {
          if (progressEvent.total) {
            uploadProgress.value = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            )
          }
        }
      )

      // Prepend new file to list
      files.value.unshift(res.data.data)

      if (pagination.value) {
        pagination.value.total++
      }
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Upload failed.'
      throw e
    } finally {
      submitting.value    = false
      uploadProgress.value = 0
    }
  }

  async function deleteFile(id: number) {
    submitting.value = true
    error.value      = null

    try {
      await fileRepositoryApi.delete(id)
      files.value = files.value.filter(f => f.id !== id)
      if (pagination.value) pagination.value.total--
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Delete failed.'
      throw e
    } finally {
      submitting.value = false
    }
  }

  async function purgeFile(id: number) {
    submitting.value = true
    error.value      = null

    try {
      await fileRepositoryApi.purge(id)
      files.value = files.value.filter(f => f.id !== id)
      if (pagination.value) pagination.value.total--
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Purge failed.'
      throw e
    } finally {
      submitting.value = false
    }
  }

  // ─── Filter helpers ───────────────────────────────────────────────────
  function setFilters(incoming: Partial<FileRepositoryFilters>) {
    filters.value = {
      ...filters.value,
      ...incoming,
      offset: 0, // reset to page 1 on any filter change
    }
    fetchFiles()
  }

  function resetFilters() {
    filters.value = { ...DEFAULT_FILTERS }
    fetchFiles()
  }

  function setPage(page: number) {
    filters.value.offset = (page - 1) * filters.value.limit
    fetchFiles()
  }

  return {
    // state
    files,
    pagination,
    filters,
    loading,
    submitting,
    uploadProgress,
    error,
    // computed
    totalFiles,
    encryptedCount,
    unusedCount,
    totalSize,
    // actions
    fetchFiles,
    uploadFile,
    deleteFile,
    purgeFile,
    setFilters,
    resetFilters,
    setPage,
  }
})