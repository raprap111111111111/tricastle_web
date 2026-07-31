<!-- src/features/document-versions/components/DocumentVersionCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import type { DocumentVersion } from '../types'
import { formatFileSize, formatVersionDate, fileIcon } from '../utils/versionFormatters'

const props = defineProps<{
  version:    DocumentVersion
  canRestore?: boolean
  canDelete?:  boolean
}>()

const emit = defineEmits<{
  (e: 'view',    id: number): void
  (e: 'restore', id: number): void
  (e: 'delete',  id: number): void
}>()

const icon = computed(() => fileIcon(props.version.mime_type))
</script>

<template>
  <div
    role="button"
    tabindex="0"
    class="group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer
           hover:shadow-sm hover:border-apricot-300 hover:bg-apricot-50/40
           focus:outline-none focus:ring-2 focus:ring-apricot-300"
    :class="version.is_current ? 'border-apricot-300 bg-apricot-50/30' : 'border-appleCore-100 bg-white'"
    @click="emit('view', version.id)"
    @keydown.enter="emit('view', version.id)"
    @keydown.space.prevent="emit('view', version.id)"
  >
    <!-- Icon -->
    <div class="w-11 h-11 rounded-xl bg-apricot-50 text-apricot-600
                flex items-center justify-center flex-shrink-0">
      <i :class="`pi ${icon} text-lg`" />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums
                     bg-blueberry-100 text-blueberry-700">
          v{{ version.version_number }}
        </span>
        <span v-if="version.is_current"
              class="px-2 py-0.5 bg-green-50 text-green-700 text-[10px]
                     font-semibold uppercase tracking-wide rounded">
          Current
        </span>
        <p class="text-sm font-semibold text-blueberry-800 truncate
                  group-hover:text-apricot-700">
          {{ version.file_name }}
        </p>
      </div>

      <div class="flex items-center gap-2 text-[11px] text-blueberry-500 mt-1">
        <span>{{ formatFileSize(version.file_size) }}</span>
        <span>·</span>
        <span>{{ formatVersionDate(version.created_at) }}</span>
        <template v-if="version.uploader">
          <span>·</span>
          <span>by {{ version.uploader.name }}</span>
        </template>
      </div>

      <p v-if="version.change_reason"
         class="text-xs text-blueberry-600 mt-1.5 italic truncate">
        “{{ version.change_reason }}”
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 flex-shrink-0" @click.stop>
      <Button
        v-if="canRestore && !version.is_current"
        icon="pi pi-refresh"
        text rounded size="small"
        v-tooltip.top="'Set as current'"
        class="!text-blueberry-500 hover:!text-apricot-600"
        @click.stop="emit('restore', version.id)"
      />
      <Button
        v-if="canDelete && !version.is_current"
        icon="pi pi-trash"
        text rounded size="small"
        v-tooltip.top="'Delete version'"
        class="!text-blueberry-500 hover:!text-red-600"
        @click.stop="emit('delete', version.id)"
      />
    </div>
  </div>
</template>