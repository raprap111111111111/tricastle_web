<!-- src/features/file-repository/components/FileRepositoryFilters.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select    from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import Button    from 'primevue/button'
import type { FileRepositoryFilters } from '../types'
import { DISK_OPTIONS, MIME_PRESETS } from '../types'

// ─── Props / Emits ────────────────────────────────────────────────────
interface Props {
  modelValue: Partial<FileRepositoryFilters>
}

const props  = defineProps<Props>()
const emit   = defineEmits<{
  filter: [filters: Partial<FileRepositoryFilters>]
  reset:  []
}>()

// ─── Local state (controlled) ─────────────────────────────────────────
const search         = ref(props.modelValue.search        ?? '')
const disk           = ref(props.modelValue.disk          ?? null)
const mimeType       = ref(props.modelValue.mime_type     ?? null)
const unusedOnly     = ref(props.modelValue.unused_only   ?? false)
const encryptedOnly  = ref(props.modelValue.encrypted_only ?? false)

// ─── Debounce search ──────────────────────────────────────────────────
let searchTimer: ReturnType<typeof setTimeout>
watch(search, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => emitFilter(), 400)
})

watch([disk, mimeType, unusedOnly, encryptedOnly], () => emitFilter())

function emitFilter() {
  emit('filter', {
    search:         search.value     || undefined,
    disk:           disk.value       || null,
    mime_type:      mimeType.value   || null,
    unused_only:    unusedOnly.value   || null,
    encrypted_only: encryptedOnly.value || null,
  })
}

function handleReset() {
  search.value        = ''
  disk.value          = null
  mimeType.value      = null
  unusedOnly.value    = false
  encryptedOnly.value = false
  emit('reset')
}

const diskOptions = [{ label: 'All Disks', value: null }, ...DISK_OPTIONS]
const mimeOptions = [{ label: 'All Types', value: null }, ...MIME_PRESETS]
</script>

<template>
  <div class="bg-white rounded-2xl border border-appleCore-200 p-5">
    <!-- Header row -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-serif font-semibold text-blueberry-800 text-sm">
        Filters
      </h3>
      <Button
        label="Reset"
        size="small"
        text
        severity="secondary"
        icon="pi pi-refresh"
        @click="handleReset"
        class="!text-blueberry-400 hover:!text-blueberry-600"
      />
    </div>

    <!-- Filter grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- Search -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-blueberry-500">Search</label>
        <InputText
          v-model="search"
          placeholder="File name or hash…"
          class="w-full !text-sm"
          :pt="{
            root: { class: 'border-appleCore-200 rounded-xl focus:border-blueberry-400' }
          }"
        />
      </div>

      <!-- Disk -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-blueberry-500">Storage Disk</label>
        <Select
          v-model="disk"
          :options="diskOptions"
          option-label="label"
          option-value="value"
          placeholder="All Disks"
          class="w-full !text-sm"
          :pt="{
            root: { class: 'border-appleCore-200 rounded-xl' }
          }"
        />
      </div>

      <!-- MIME type -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-blueberry-500">File Type</label>
        <Select
          v-model="mimeType"
          :options="mimeOptions"
          option-label="label"
          option-value="value"
          placeholder="All Types"
          class="w-full !text-sm"
          :pt="{
            root: { class: 'border-appleCore-200 rounded-xl' }
          }"
        />
      </div>

      <!-- Toggles column -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-blueberry-500">Unused Only</label>
          <ToggleSwitch v-model="unusedOnly" />
        </div>
        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-blueberry-500">Encrypted Only</label>
          <ToggleSwitch v-model="encryptedOnly" />
        </div>
      </div>

    </div>
  </div>
</template>