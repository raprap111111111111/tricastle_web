// src/features/applicants/composables/useFinalListPagination.ts

import { ref, computed, type Ref } from 'vue'
import type { PaginationInfo } from '@/shared/ui/table/AppPagination.types'

/**
 * Server-Side Pagination Handler.
 * Connects PrimeVue / AppPagination to Laravel API paginated responses.
 */
export function useFinalListPagination(
  apiPaginationMeta: Ref<PaginationInfo | null>,
  fetchApiData: (page: number, limit: number) => Promise<void> | void
) {
  const currentPage = ref(1)
  const perPage     = ref(10)

  // Use the pagination metadata directly from Laravel API response
  const paginationInfo = computed<PaginationInfo>(() => {
    if (!apiPaginationMeta.value) {
      return {
        current_page: 1,
        last_page: 1,
        per_page: perPage.value,
        total: 0,
        from: 0,
        to: 0,
      }
    }

    const meta     = apiPaginationMeta.value
    const total    = meta.total ?? 0
    const page     = meta.current_page ?? currentPage.value
    const limit    = meta.per_page ?? meta.limit ?? perPage.value
    const lastPage = meta.last_page ?? Math.max(1, Math.ceil(total / limit))

    const from = meta.from ?? (total === 0 ? 0 : (page - 1) * limit + 1)
    const to   = meta.to ?? Math.min(page * limit, total)

    return {
      current_page: page,
      last_page:    lastPage,
      per_page:     limit,
      total,
      has_more:     meta.has_more ?? page < lastPage,
      from,
      to,
    }
  })

  // Triggered when user clicks Page 2, Page 3, etc.
  async function onPageChange(page: number): Promise<void> {
    currentPage.value = page
    await fetchApiData(page, perPage.value)
  }

  // Triggered when user changes rows per page (10, 25, 50, 100)
  async function onLimitChange(limit: number): Promise<void> {
    perPage.value     = limit
    currentPage.value = 1
    await fetchApiData(1, limit)
  }

  function reset(): void {
    currentPage.value = 1
  }

  return {
    currentPage,
    perPage,
    paginationInfo,
    onPageChange,
    onLimitChange,
    reset,
  }
}