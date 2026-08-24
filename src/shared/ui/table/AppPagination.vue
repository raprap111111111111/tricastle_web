<!-- src/shared/ui/table/AppPagination.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Select from 'primevue/select'

// ─── Flexible Type Definition (compatible with all API Pagination types) ──
export interface PaginationInfo {
  current_page?: number | null
  last_page?: number | null
  per_page?: number | null
  total?: number | null
  offset?: number | null
  limit?: number | null
  has_more?: boolean | null
  from?: number | null
  to?: number | null
}

const props = withDefaults(
  defineProps<{
    pagination: PaginationInfo | null
    rowsPerPageOptions?: number[]
    variant?: 'standard' | 'compact'
  }>(),
  {
    rowsPerPageOptions: () => [10, 25, 50, 100],
    variant: 'standard',
  },
)

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
}>()

// ─── Computed Values ─────────────────────────────────────────
const total = computed(() => props.pagination?.total ?? 0)
const currentPage = computed(() => props.pagination?.current_page ?? 1)
const lastPage = computed(() => Math.max(1, props.pagination?.last_page ?? 1))
const perPage = computed(() => props.pagination?.per_page ?? props.pagination?.limit ?? 10)

const first = computed(() => (currentPage.value - 1) * perPage.value)
const from = computed(() => props.pagination?.from ?? (total.value === 0 ? 0 : first.value + 1))
const to = computed(() => props.pagination?.to ?? Math.min(first.value + perPage.value, total.value))

// Sync local page input with currentPage prop
const pageInput = ref<string>(String(currentPage.value))

watch(currentPage, (val) => {
  pageInput.value = String(val)
})

// Generate Page Range with Ellipsis (e.g. 1, 2, '...', 10)
const pageRange = computed(() => {
  const current = currentPage.value
  const totalPages = lastPage.value
  const delta = 1
  const range: (number | string)[] = []

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }

  return range
})

const limitOptions = computed(() =>
  props.rowsPerPageOptions.map((opt) => ({
    label: String(opt),
    value: opt,
  })),
)

// ─── Handlers ────────────────────────────────────────────────
function goToPage(page: number) {
  const target = Math.min(Math.max(1, Math.floor(page)), lastPage.value)
  if (target !== currentPage.value) {
    emit('page-change', target)
  } else {
    pageInput.value = String(currentPage.value)
  }
}

function applyPageInput() {
  const num = Number(pageInput.value)
  if (Number.isFinite(num) && num >= 1) {
    goToPage(num)
  } else {
    pageInput.value = String(currentPage.value)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    applyPageInput()
    ;(e.target as HTMLInputElement)?.blur()
  } else if (e.key === 'Escape') {
    pageInput.value = String(currentPage.value)
    ;(e.target as HTMLInputElement)?.blur()
  }
}

function onLimitSelect(limit: number) {
  if (limit !== perPage.value) {
    emit('limit-change', limit)
  }
}
</script>

<template>
  <div v-if="total > 0" class="w-full">
    <div
      class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-appleCore-100 bg-appleCore-50/30 rounded-b-2xl"
    >
      <!-- Info Left -->
      <div class="text-xs text-blueberry-500 tabular-nums">
        Showing
        <span class="font-semibold text-blueberry-700">{{ from }}</span>
        to
        <span class="font-semibold text-blueberry-700">{{ to }}</span>
        of
        <span class="font-semibold text-blueberry-700">{{ total }}</span>
        entries
      </div>

      <!-- Controls Right -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <!-- First Page << -->
        <button
          type="button"
          :disabled="currentPage <= 1"
          class="w-8 h-8 rounded-xl border border-appleCore-200 bg-white text-blueberry-500 hover:bg-appleCore-50 hover:text-blueberry-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-2xs"
          title="First Page"
          @click="goToPage(1)"
        >
          <i class="pi pi-angle-double-left text-[11px]" />
        </button>

        <!-- Previous Page < -->
        <button
          type="button"
          :disabled="currentPage <= 1"
          class="w-8 h-8 rounded-xl border border-appleCore-200 bg-white text-blueberry-500 hover:bg-appleCore-50 hover:text-blueberry-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-2xs"
          title="Previous Page"
          @click="goToPage(currentPage - 1)"
        >
          <i class="pi pi-chevron-left text-[10px]" />
        </button>

        <!-- Page Numbers -->
        <button
          v-for="(p, idx) in pageRange"
          :key="`${p}-${idx}`"
          type="button"
          :disabled="p === '...'"
          class="w-8 h-8 rounded-full text-xs font-semibold transition-all flex items-center justify-center"
          :class="[
            p === currentPage
              ? 'bg-apricot-500 text-white shadow-xs font-bold'
              : p === '...'
                ? 'text-blueberry-400 cursor-default bg-transparent w-5'
                : 'text-blueberry-600 hover:bg-apricot-50 hover:text-apricot-600 bg-transparent',
          ]"
          @click="typeof p === 'number' && goToPage(p)"
        >
          {{ p }}
        </button>

        <!-- Next Page > -->
        <button
          type="button"
          :disabled="currentPage >= lastPage"
          class="w-8 h-8 rounded-xl border border-appleCore-200 bg-white text-blueberry-500 hover:bg-appleCore-50 hover:text-blueberry-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-2xs"
          title="Next Page"
          @click="goToPage(currentPage + 1)"
        >
          <i class="pi pi-chevron-right text-[10px]" />
        </button>

        <!-- Last Page >> -->
        <button
          type="button"
          :disabled="currentPage >= lastPage"
          class="w-8 h-8 rounded-xl border border-appleCore-200 bg-white text-blueberry-500 hover:bg-appleCore-50 hover:text-blueberry-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-2xs"
          title="Last Page"
          @click="goToPage(lastPage)"
        >
          <i class="pi pi-angle-double-right text-[11px]" />
        </button>

        <!-- Divider -->
        <div class="h-4 w-px bg-appleCore-200 mx-1" />

        <!-- Go To Page Input -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-blueberry-500 font-medium">Go</span>
          <input
            v-model="pageInput"
            type="number"
            min="1"
            :max="lastPage"
            class="w-12 h-8 px-1.5 text-center text-xs font-bold text-blueberry-800 bg-white border border-appleCore-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-apricot-500/30 focus:border-apricot-500 tabular-nums shadow-2xs"
            @keydown="onKeydown"
            @blur="applyPageInput"
          />
          <span class="text-xs text-blueberry-400">/ {{ lastPage }}</span>
        </div>

        <!-- Rows Per Page Select -->
        <div class="ml-1">
          <Select
            :model-value="perPage"
            :options="limitOptions"
            option-label="label"
            option-value="value"
            class="!text-xs !h-8 !rounded-xl !border-appleCore-200 !shadow-2xs"
            size="small"
            @update:model-value="onLimitSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide native browser number input spinners */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>