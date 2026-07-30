<template>
  <div class="bg-white rounded-2xl shadow-soft border border-appleCore-100 overflow-hidden">
    <!-- Header: search + filters -->
    <div v-if="searchable || $slots.filters" class="px-4 py-3 border-b border-appleCore-100 flex flex-wrap items-center gap-3">
      <div v-if="searchable" class="relative flex-1 min-w-[250px]">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-blueberry-400 text-sm" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-9 pr-3 py-2 text-sm border border-appleCore-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-apricot-500/30 focus:border-apricot-500"
        />
      </div>
      <slot name="filters" />
    </div>

    <!-- Table -->
    <DataTable
      :value="filteredData"
      :loading="loading"
      :paginator="paginator"
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      :sort-mode="sortMode"
      :removable-sort="true"
      :global-filter-fields="searchFields"
      :striped-rows="stripedRows"
      responsive-layout="scroll"
      data-key="id"
      class="!border-none"
      :pt="{
        table: 'text-sm',
        header: '!bg-appleCore-50 !text-blueberry-800 !font-semibold !text-xs !uppercase !tracking-wider',
        headerRow: '!bg-appleCore-50',
        bodyRow: 'hover:!bg-appleCore-50/60 transition-colors',
      }"
      @row-click="(e) => emit('rowClick', e.data)"
    >
      <template #empty>
        <div class="py-12 text-center">
          <i class="pi pi-inbox text-4xl text-blueberry-300 mb-2 block" />
          <p class="text-blueberry-500">{{ emptyMessage }}</p>
        </div>
      </template>

      <template #loading>
        <div class="py-12 text-center">
          <i class="pi pi-spin pi-spinner text-3xl text-apricot-500 mb-2 block" />
          <p class="text-blueberry-500">Loading...</p>
        </div>
      </template>

      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        :sortable="col.sortable"
        :style="col.style"
        :class="col.class"
      >
        <template #body="{ data }">
          <slot :name="`cell-${col.field}`" :data="data" :value="data[col.field]">
            {{ data[col.field] ?? '—' }}
          </slot>
        </template>
      </Column>

      <Column v-if="$slots.actions" header="Actions" :style="{ width: '120px' }">
        <template #body="{ data }">
          <slot name="actions" :data="data" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

export interface TableColumn {
  field: string
  header: string
  sortable?: boolean
  style?: Record<string, string>
  class?: string
}

const props = withDefaults(
  defineProps<{
    data: T[]
    columns: TableColumn[]
    loading?: boolean
    paginator?: boolean
    rows?: number
    rowsPerPageOptions?: number[]
    sortMode?: 'single' | 'multiple'
    stripedRows?: boolean
    searchable?: boolean
    searchFields?: string[]
    searchPlaceholder?: string
    emptyMessage?: string
  }>(),
  {
    loading: false,
    paginator: true,
    rows: 10,
    rowsPerPageOptions: () => [10, 25, 50, 100],
    sortMode: 'single',
    stripedRows: false,
    searchable: true,
    searchFields: () => [],
    searchPlaceholder: 'Search...',
    emptyMessage: 'No records found',
  },
)

const emit = defineEmits<{
  rowClick: [row: T]
}>()

const searchQuery = ref('')

const filteredData = computed(() => {
  if (!searchQuery.value || !props.searchable) return props.data
  const query = searchQuery.value.toLowerCase()

  const fields = props.searchFields.length
    ? props.searchFields
    : props.columns.map((c) => c.field)

  return props.data.filter((row) =>
    fields.some((field) => {
      const value = row[field]
      return value !== null && value !== undefined && String(value).toLowerCase().includes(query)
    }),
  )
})
</script>