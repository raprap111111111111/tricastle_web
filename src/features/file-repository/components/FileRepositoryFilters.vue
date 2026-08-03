<!-- src/features/file-repository/components/FileRepositoryFilters.vue -->
<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import InputText    from 'primevue/inputtext'
import Dropdown     from 'primevue/dropdown'
import OverlayPanel from 'primevue/overlaypanel'
import SelectButton from 'primevue/selectbutton'
import { AppButton } from '@shared/ui'
import {
  DISK_OPTIONS,
  MIME_PRESETS,
  ORDER_BY_OPTIONS,
  type FileRepositoryFilters,
} from '../types'

const props = defineProps<{
  modelValue?: FileRepositoryFilters
}>()

const emit = defineEmits<{
  (e: 'filter', filters: Partial<FileRepositoryFilters>): void
  (e: 'reset'): void
}>()

const local = reactive<Partial<FileRepositoryFilters>>({
  search:         '',
  disk:           null,
  mime_type:      null,
  order_by:       'created_at',
  order_dir:      'desc',
  unused_only:    null,
  encrypted_only: null,
})

watch(
  () => props.modelValue,
  (val) => val && Object.assign(local, val),
  { immediate: true },
)

const advancedPanel = ref()
function toggleAdvanced(event: Event) {
  advancedPanel.value?.toggle(event)
}

const orderDirOptions = [
  { label: 'Newest', value: 'desc' },
  { label: 'Oldest', value: 'asc'  },
]

const boolOptions = [
  { label: 'All', value: null  },
  { label: 'Yes', value: true  },
  { label: 'No',  value: false },
]

function onSearch() {
  emit('filter', { ...local })
}

function onReset() {
  Object.assign(local, {
    search:         '',
    disk:           null,
    mime_type:      null,
    order_by:       'created_at',
    order_dir:      'desc',
    unused_only:    null,
    encrypted_only: null,
  })
  emit('reset')
}

function activeAdvancedCount(): number {
  let c = 0
  if (local.disk)                    c++
  if (local.mime_type)               c++
  if (local.unused_only    !== null) c++
  if (local.encrypted_only !== null) c++
  return c
}
</script>

<template>
  <!-- ══════════════════════════════════════════════════════════
       SINGLE-ROW SEARCH BAR
       ══════════════════════════════════════════════════════════ -->
  <div class="flex items-center gap-3 flex-wrap">

    <!-- ✅ FIXED: search input with icon inside -->
    <div class="flex-1 min-w-[280px] relative">
      <i
        class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2
               text-blueberry-400 pointer-events-none z-10"
      />
      <InputText
        v-model="local.search"
        placeholder="Search file name, hash..."
        class="w-full !pl-11 !h-[52px] !text-sm !rounded-xl !bg-white !border-appleCore-200"
        @keyup.enter="onSearch"
      />
    </div>

    <!-- Orange search button -->
    <button
      type="button"
      class="w-[52px] h-[52px] rounded-xl bg-apricot-500 hover:bg-apricot-600
             text-white flex items-center justify-center flex-shrink-0
             transition-colors"
      @click="onSearch"
    >
      <i class="pi pi-search" />
    </button>

    <!-- Disk filter -->
    <Dropdown
      v-model="local.disk"
      :options="DISK_OPTIONS"
      option-label="label"
      option-value="value"
      placeholder="All Disks"
      show-clear
      class="!min-w-[180px] !text-sm !rounded-xl !bg-white !border-appleCore-200 !h-[52px]"
      @change="onSearch"
    />

    <!-- Advanced toggle -->
    <button
      type="button"
      class="relative w-[52px] h-[52px] rounded-xl bg-white border border-appleCore-200
             text-blueberry-600 hover:bg-appleCore-50 flex items-center justify-center
             flex-shrink-0 transition-colors"
      v-tooltip.top="'Advanced filters'"
      @click="toggleAdvanced"
    >
      <i class="pi pi-sliders-h" />
      <span
        v-if="activeAdvancedCount() > 0"
        class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-apricot-500
               text-white text-[10px] font-bold flex items-center justify-center"
      >
        {{ activeAdvancedCount() }}
      </span>
    </button>

    <!-- Reset -->
    <button
      type="button"
      class="w-[52px] h-[52px] rounded-xl bg-white border border-appleCore-200
             text-blueberry-600 hover:bg-appleCore-50 flex items-center justify-center
             flex-shrink-0 transition-colors"
      v-tooltip.top="'Reset filters'"
      @click="onReset"
    >
      <i class="pi pi-refresh" />
    </button>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       ADVANCED FILTERS POPUP
       ══════════════════════════════════════════════════════════ -->
  <OverlayPanel
    ref="advancedPanel"
    :pt="{
      root: '!rounded-2xl !border !border-appleCore-200 !shadow-xl !mt-2',
      content: '!p-5',
    }"
  >
    <div class="w-[420px] space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-appleCore-100">
        <div>
          <h4 class="text-sm font-semibold text-blueberry-800">Advanced Filters</h4>
          <p class="text-xs text-blueberry-400 mt-0.5">Refine your search</p>
        </div>
        <i class="pi pi-sliders-h text-blueberry-400 text-lg" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">File Type</label>
        <Dropdown
          v-model="local.mime_type"
          :options="MIME_PRESETS"
          option-label="label"
          option-value="value"
          placeholder="All types"
          show-clear
          class="w-full !text-sm !rounded-xl !border-appleCore-200"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">Sort By</label>
        <div class="flex gap-2">
          <Dropdown
            v-model="local.order_by"
            :options="ORDER_BY_OPTIONS"
            option-label="label"
            option-value="value"
            class="flex-1 !text-sm !rounded-xl !border-appleCore-200"
          />
          <Dropdown
            v-model="local.order_dir"
            :options="orderDirOptions"
            option-label="label"
            option-value="value"
            class="w-32 !text-sm !rounded-xl !border-appleCore-200"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">Unused Files</label>
        <SelectButton
          v-model="local.unused_only"
          :options="boolOptions"
          option-label="label"
          option-value="value"
          class="!text-xs"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">Encrypted</label>
        <SelectButton
          v-model="local.encrypted_only"
          :options="boolOptions"
          option-label="label"
          option-value="value"
          class="!text-xs"
        />
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-appleCore-100">
        <AppButton label="Clear" variant="neutral" icon="pi pi-times" size="small" outlined @click="onReset" />
        <AppButton label="Apply" variant="primary" icon="pi pi-check" size="small" @click="() => { onSearch(); advancedPanel?.hide() }" />
      </div>
    </div>
  </OverlayPanel>
</template>