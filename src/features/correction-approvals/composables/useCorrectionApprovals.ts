// src/features/correction-approvals/composables/useCorrectionApprovals.ts
import { computed, reactive } from 'vue'
import { useCorrectionApprovalStore } from '../stores/correction-approval.store'
import type { CorrectionApprovalListParams } from '../types'

export function useCorrectionApprovals() {
  const store = useCorrectionApprovalStore()

  const params = reactive<CorrectionApprovalListParams>({
    offset: 0,
    limit: 10,
    order_by: 'created_at',
    order_dir: 'desc',
  })

  async function load(overrides: Partial<CorrectionApprovalListParams> = {}) {
    Object.assign(params, overrides)
    return store.fetchApprovals({ ...params })
  }

  function setPage(page: number) {
    params.offset = (page - 1) * (params.limit ?? 10)
  }

  function setLimit(limit: number) {
    params.limit = limit
    params.offset = 0
  }

  function onPage(event: { page: number; rows: number }) {
    setLimit(event.rows)
    setPage(event.page)
    load()
  }

  function onSearch(q: string) {
    params.search = q || undefined
    params.offset = 0
    load()
  }

  function onFilter(filters: Partial<CorrectionApprovalListParams>) {
    Object.assign(params, filters, { offset: 0 })
    load()
  }

  function onSort(event: { field: string; order: 1 | -1 }) {
    params.order_by = event.field
    params.order_dir = event.order === 1 ? 'asc' : 'desc'
    load()
  }

  async function handleDelete(id: number) {
    await store.deleteApproval(id)
  }

  return {
    store,
    params,
    load,
    setPage,
    setLimit,
    onPage,
    onSearch,
    onFilter,
    onSort,
    handleDelete,
  }
}