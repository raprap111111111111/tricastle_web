<!-- src/features/file-repository/components/FileRepositoryFilters.vue -->
<script setup lang="ts">
import { reactive, watch } from 'vue'
import InputText    from 'primevue/inputtext'
import Dropdown     from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import AppButton    from '@shared/ui/AppButton.vue'
import {
  DISK_OPTIONS,
  MIME_PRESETS,
  ORDER_BY_OPTIONS,
  type FileRepositoryFilters,
} from '../types'

// ─── Props / Emits ───────────────────────────────────────────────────
const props = defineProps<{
  modelValue: FileRepositoryFilters
}>()

const emit = defineEmits<{
  (e: 'filter', filters: Partial<FileRepositoryFilters>): void
  (e: 'reset'): void
}>()

// ─── Local reactive copy ─────────────────────────────────────────────
const local = reactive<Partial<FileRepositoryFilters>>({
  search:         '',
  disk:           null,
  mime_type:      null,
  order_by:       'created_at',
  order_dir:      'desc',
  unused_only:    null,
  encrypted_only: null,
})

// Sync from parent when modelValue changes
watch(
  () => props.modelValue,
  val => Object.assign(local, val),
  { immediate: true }
)

// ─── Options ─────────────────────────────────────────────────────────
const orderDirOptions = [
  { label: 'Newest', value: 'desc' },
  { label: 'Oldest', value: 'asc'  },
]

const boolOptions = [
  { label: 'All', value: null  },
  { label: 'Yes', value: true  },
  { label: 'No',  value: false },
]

// ─── Handlers ────────────────────────────────────────────────────────
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
</script>

<template>
  <div
    class="bg-white border border-appleCore-200 rounded-2xl p-5 space-y-4"
  >

    <!-- Row 1: Search + Disk + MIME ─────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

      <!-- Search -->
      <div class="lg:col-span-2 flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">
          Search
        </label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search text-blueberry-400 text-sm" />
          <InputText
            v-model="local.search"
            placeholder="File name, hash…"
            class="w-full !pl-9 !text-sm !rounded-xl !border-appleCore-200"
            @keyup.enter="onSearch"
          />
        </span>
      </div>

      <!-- Disk -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">
          Storage Disk
        </label>
        <Dropdown
          v-model="local.disk"
          :options="DISK_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="All disks"
          show-clear
          class="w-full !text-sm !rounded-xl !border-appleCore-200"
        />
      </div>

      <!-- MIME -->
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">
          File Type
        </label>
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
    </div>

    <!-- Row 2: Sort + Bool toggles + Actions ─────────────────────────── -->
    <div class="flex flex-wrap items-end gap-4 justify-between">

      <div class="flex flex-wrap gap-4">

        <!-- Order By -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">
            Sort By
          </label>
          <div class="flex gap-2">
            <Dropdown
              v-model="local.order_by"
              :options="ORDER_BY_OPTIONS"
              option-label="label"
              option-value="value"
              class="!text-sm !rounded-xl !border-appleCore-200 w-44"
            />
            <Dropdown
              v-model="local.order_dir"
              :options="orderDirOptions"
              option-label="label"
              option-value="value"
              class="!text-sm !rounded-xl !border-appleCore-200 w-28"
            />
          </div>
        </div>

        <!-- Unused Only -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">
            Unused
          </label>
          <SelectButton
            v-model="local.unused_only"
            :options="boolOptions"
            option-label="label"
            option-value="value"
            class="!text-xs"
          />
        </div>

        <!-- Encrypted Only -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">
            Encrypted
          </label>
          <SelectButton
            v-model="local.encrypted_only"
            :options="boolOptions"
            option-label="label"
            option-value="value"
            class="!text-xs"
          />
        </div>

      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 flex-shrink-0">
        <AppButton
          label="Reset"
          variant="neutral"
          icon="pi pi-refresh"
          size="small"
          outlined
          @click="onReset"
        />
        <AppButton
          label="Apply"
          variant="primary"
          icon="pi pi-search"
          size="small"
          @click="onSearch"
        />
      </div>

    </div>
  </div>
</template>