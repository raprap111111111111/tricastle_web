// src/features/verification-mismatches/composables/useVerificationMismatches.ts
import { ref } from 'vue'
import { useVerificationMismatchStore } from '../stores/verification-mismatch.store'
import type { VerificationMismatchListParams } from '../types'

export function useVerificationMismatches() {
  const store = useVerificationMismatchStore()

  const params = ref<VerificationMismatchListParams>({
    offset: 0,
    limit: 10,
    order_by: 'created_at',
    order_dir: 'desc',
  })

  async function load(patch: Partial<VerificationMismatchListParams> = {}) {
    params.value = { ...params.value, ...patch }
    await store.fetchAll(params.value)
  }

  function onPage(event: { page: number; rows: number }) {
    params.value.offset = event.page * event.rows
    params.value.limit = event.rows
    load()
  }

  function onSearch(search: string) {
    params.value.search = search
    params.value.offset = 0
    load()
  }

  function onFilter(patch: Partial<VerificationMismatchListParams>) {
    params.value = { ...params.value, ...patch, offset: 0 }
    load()
  }

  function onSort(event: { field: string; order: 1 | -1 }) {
    params.value.order_by = event.field
    params.value.order_dir = event.order === 1 ? 'asc' : 'desc'
    load()
  }

  return { store, params, load, onPage, onSearch, onFilter, onSort }
}