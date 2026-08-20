<!-- src/features/applicants/components/final-list/FinalListFolderCard.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { FinalListFolder } from '../../types'
import { timeAgo } from '../../utils/final-list.utils'

const props = defineProps<{
  folder: FinalListFolder
}>()

const router = useRouter()

function openFolder() {
  router.push({
    name: 'applicants.final-list.folder',
    params: { folderKey: props.folder.key },   // ← must be folderKey, not key
  })
}
</script>

<template>
  <button
    type="button"
    class="group flex flex-col gap-3 p-5 bg-white border border-appleCore-100
           rounded-2xl hover:border-apricot-300 hover:shadow-lg
           transition-all duration-200 text-left"
    @click="openFolder"
  >
    <!-- Folder Icon + Count -->
    <div class="flex items-start justify-between">
      <div class="relative">
        <div
          class="w-14 h-14 rounded-2xl bg-gradient-to-br from-apricot-100 to-apricot-200
                 flex items-center justify-center group-hover:scale-105 transition-transform"
        >
          <i class="pi pi-folder text-2xl text-apricot-600" />
        </div>
        <span
          class="absolute -top-1 -right-1 min-w-[24px] h-6 px-1.5
                 bg-apricot-500 text-white text-xs font-bold rounded-full
                 flex items-center justify-center ring-2 ring-white"
        >
          {{ folder.count }}
        </span>
      </div>

      <i
        class="pi pi-arrow-up-right text-blueberry-300 group-hover:text-apricot-500
               group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
      />
    </div>

    <!-- Folder Info -->
    <div class="flex flex-col gap-1">
      <h3 class="text-base font-serif font-semibold text-blueberry-800">
        {{ folder.label }}
      </h3>
      <p class="text-xs text-blueberry-500">
        {{ folder.count }} applicant{{ folder.count > 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Preview Avatars -->
    <div class="flex items-center gap-2 pt-2 border-t border-appleCore-100">
      <div class="flex -space-x-2">
        <div
          v-for="(applicant, i) in folder.applicants.slice(0, 4)"
          :key="applicant.id"
          class="w-7 h-7 rounded-full bg-blueberry-100 text-blueberry-700
                 flex items-center justify-center text-[10px] font-bold
                 ring-2 ring-white"
          :style="{ zIndex: 10 - i }"
        >
          {{ applicant.first_name?.[0] }}{{ applicant.last_name?.[0] }}
        </div>
        <div
          v-if="folder.count > 4"
          class="w-7 h-7 rounded-full bg-appleCore-100 text-blueberry-600
                 flex items-center justify-center text-[10px] font-bold
                 ring-2 ring-white"
        >
          +{{ folder.count - 4 }}
        </div>
      </div>

      <span class="text-xs text-blueberry-400 ml-auto">
        {{ timeAgo(folder.latest_date) }}
      </span>
    </div>
  </button>
</template>