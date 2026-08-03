// src/features/file-repository/stores/file-repository.store.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fileRepositoryApi } from '../api/file-repository.api'
import type { FileRepository, FileRepositoryFilters, Pagination } from '../types'

const DEFAULT_FILTERS: FileRepositoryFilters = {
  search:        undefined,
  disk:          null,
  mime_type:     null,
  is_encrypted:  null,
  uploaded_by:   null,
  unused_only:   null,
  encrypted_only: null,
  min_size:      null,
  max_size:      null,
  offset:        0,
  limit:         10,
  order_by:      'created_at',
  order_dir:     'desc',
}

export const useFileRepositoryStore = defineStore('fileRepository', () => {
  // ─── State ────────────────────────────────────────────────────────────
  const files          = ref<FileRepository[]>([])
  const pagination     = ref<Pagination>({
    total:        0,
    offset:       0,
    limit:        10,
    per_page:     10,
    current_page: 1,
    last_page:    1,
  })
  const filters        = ref<FileRepositoryFilters>({ ...DEFAULT_FILTERS })
  const loading        = ref(false)
  const submitting     = ref(false)
  const error          = ref<string | null>(null)
  const uploadProgress = ref(0)

  // ─── Computed ─────────────────────────────────────────────────────────
  const totalFiles    = computed(() => pagination.value.total)
  const currentPage   = computed(() => pagination.value.current_page)
  const lastPage      = computed(() => pagination.value.last_page)

  const encryptedCount = computed(
    () => files.value.filter(f => f.is_encrypted).length
  )
  const unusedCount = computed(
    () => files.value.filter(f => f.reference_count === 0).length
  )
  const totalSize = computed(() =>
    files.value.reduce((sum, f) => sum + (f.file_size ?? 0), 0)
  )

  // ─── Actions ──────────────────────────────────────────────────────────

  async function fetchFiles() {
    loading.value = true
    error.value   = null

    try {
      const response = await fileRepositoryApi.getAll(filters.value)
      const data     = response.data.data

      files.value = data.records
      pagination.value = {
        total:        data.total,
        offset:       data.offset,
        limit:        data.limit,
        per_page:     data.per_page,
        current_page: data.current_page,
        last_page:    data.last_page,
      }
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Failed to load files.'
    } finally {
      loading.value = false
    }
  }

  /**
   * PrimeVue Paginator emits 0-based page index → convert to offset
   */
  function setPage(page: number) {
    filters.value.offset = page * filters.value.limit
    fetchFiles()
  }

  function setLimit(limit: number) {
    filters.value.limit  = limit
    filters.value.offset = 0
    fetchFiles()
  }

  function setFilters(incoming: Partial<FileRepositoryFilters>) {
    filters.value = {
      ...filters.value,
      ...incoming,
      offset: 0, // reset to first page on filter change
    }
    fetchFiles()
  }

  function resetFilters() {
    filters.value = { ...DEFAULT_FILTERS }
    fetchFiles()
  }

  async function uploadFile(
    file: File,
    extra?: Record<string, any>
  ): Promise<FileRepository> {
    submitting.value     = true
    uploadProgress.value = 0
    error.value          = null

    try {
      const response = await fileRepositoryApi.upload(
        file,
        extra,
        (evt: ProgressEvent) => {
          if (evt.lengthComputable) {
            uploadProgress.value = Math.round((evt.loaded / evt.total) * 100)
          }
        }
      )

      // Prepend to current list so staff sees it immediately
      files.value.unshift(response.data.data)
      pagination.value.total += 1

      return response.data.data
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Upload failed.'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function deleteFile(id: number): Promise<void> {
    submitting.value = true
    error.value      = null

    try {
      await fileRepositoryApi.delete(id)
      files.value          = files.value.filter(f => f.id !== id)
      pagination.value.total = Math.max(0, pagination.value.total - 1)
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Delete failed.'
      throw err
    } finally {
      submitting.value = false
    }
  }

  async function purgeFile(id: number): Promise<void> {
    submitting.value = true
    error.value      = null

    try {
      await fileRepositoryApi.purge(id)
      files.value          = files.value.filter(f => f.id !== id)
      pagination.value.total = Math.max(0, pagination.value.total - 1)
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? 'Purge failed.'
      throw err
    } finally {
      submitting.value = false
    }
  }

  return {
    // state
    files,
    pagination,
    filters,
    loading,
    submitting,
    error,
    uploadProgress,
    // computed
    totalFiles,
    currentPage,
    lastPage,
    encryptedCount,
    unusedCount,
    totalSize,
    // actions
    fetchFiles,
    setPage,
    setLimit,
    setFilters,
    resetFilters,
    uploadFile,
    deleteFile,
    purgeFile,
  }
})