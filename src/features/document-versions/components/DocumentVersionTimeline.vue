<!-- src/features/document-versions/components/DocumentVersionTimeline.vue -->
<script setup lang="ts">
import type { DocumentVersion } from '../types'
import { formatVersionDate } from '../utils/versionFormatters'

defineProps<{ versions: DocumentVersion[] }>()
</script>

<template>
  <ol class="relative border-l-2 border-appleCore-200 pl-5 space-y-5">
    <li v-for="v in versions" :key="v.id" class="relative">
      <span
        class="absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 border-white
               shadow"
        :class="v.is_current ? 'bg-apricot-500' : 'bg-blueberry-300'"
      />
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-semibold text-blueberry-800">
          Version {{ v.version_number }}
        </span>
        <span v-if="v.is_current"
              class="px-2 py-0.5 bg-green-50 text-green-700 text-[10px]
                     font-semibold uppercase tracking-wide rounded">
          Current
        </span>
        <span class="text-[11px] text-blueberry-500">
          · {{ formatVersionDate(v.created_at) }}
        </span>
      </div>
      <p class="text-sm text-blueberry-700 mt-0.5">
        {{ v.file_name }}
      </p>
      <p v-if="v.change_reason"
         class="text-xs italic text-blueberry-500 mt-1">
        “{{ v.change_reason }}”
      </p>
      <p v-if="v.uploader"
         class="text-[11px] text-blueberry-400 mt-1">
        by {{ v.uploader.name }}
      </p>
    </li>
  </ol>
</template>