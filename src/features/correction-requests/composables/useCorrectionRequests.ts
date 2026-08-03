// src/features/correction-requests/composables/useCorrectionRequests.ts

import { ref, computed } from 'vue'
import { useCorrectionRequestStore } from '../stores/correction-request.store'
import type { CorrectionRequestListParams } from '../types'

export function useCorrectionRequests() {
  const store = useCorrectionRequestStore()

  const params = ref<CorrectionRequestListParams>({
    limit: 10,
    offset: 0,
    order_by: 'created_at',
    order_dir: 'desc',
  })

  const currentPage = computed(() =>
    Math.floor((params.value.offset ?? 0) / (params.value.limit ?? 10)),
  )

  async function load(overrides?: Partial<CorrectionRequestListParams>) {
    Object.assign(params.value, overrides)
    await store.fetchAll(params.value)
  }

  function onPage(event: { page: number; rows: number }) {
    params.value.offset = event.page * event.rows
    params.value.limit = event.rows
    store.fetchAll(params.value)
  }

  function onSearch(search: string) {
    params.value.offset = 0
    params.value.search = search || undefined
    store.fetchAll(params.value)
  }

  function onFilter(filters: Partial<CorrectionRequestListParams>) {
    params.value = { ...params.value, ...filters, offset: 0 }
    store.fetchAll(params.value)
  }

  function onSort(event: { field: string; order: 1 | -1 }) {
    params.value.order_by = event.field
    params.value.order_dir = event.order === 1 ? 'asc' : 'desc'
    store.fetchAll(params.value)
  }

  return {
    store,
    params,
    currentPage,
    load,
    onPage,
    onSearch,
    onFilter,
    onSort,
  }
}