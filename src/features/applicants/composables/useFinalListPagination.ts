// src/features/applicants/composables/useFinalListPagination.ts

import { ref, computed, type Ref } from 'vue'
import type { Pagination } from '../types'

/**
 * Client-side pagination for the Final List.
 * Takes a reactive list of already-filtered applicants and slices
 * it into pages, exposing pagination metadata + page-change handlers.
 */
export function useFinalListPagination(filteredApplicants: Ref<any[]>) {
  const currentPage = ref(1)
  const perPage     = ref(10)

  const paginatedApplicants = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredApplicants.value.slice(start, start + perPage.value)
  })

  const paginationInfo = computed<Pagination>(() => {
    const total    = filteredApplicants.value.length
    const lastPage = Math.max(1, Math.ceil(total / perPage.value))
    const offset   = (currentPage.value - 1) * perPage.value
    const from     = total === 0 ? 0 : offset + 1
    const to       = Math.min(offset + perPage.value, total)

    return {
      current_page: currentPage.value,
      last_page:    lastPage,
      per_page:     perPage.value,
      total,
      offset,
      limit:        perPage.value,
      has_more:     currentPage.value < lastPage,
      from,
      to,
    }
  })

  function onPageChange(page: number): void {
    currentPage.value = page
  }

  function onLimitChange(limit: number): void {
    perPage.value     = limit
    currentPage.value = 1
  }

  function reset(): void {
    currentPage.value = 1
  }

  return {
    currentPage,
    perPage,
    paginatedApplicants,
    paginationInfo,
    onPageChange,
    onLimitChange,
    reset,
  }
}