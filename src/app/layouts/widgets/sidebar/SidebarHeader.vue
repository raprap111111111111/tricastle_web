<script setup lang="ts">
import { useThemeStore } from '@features/settings/theme/theme.store'
import { useSidebar } from '../../composables/useSidebar'

const themeStore = useThemeStore()
const { isCollapsed, closeMobile } = useSidebar()
</script>

<template>
  <div>
    <div
      class="px-4 pt-5 pb-4 flex items-center gap-3"
      :class="isCollapsed ? 'md:justify-center md:px-2' : ''"
    >
      <div
        class="w-12 h-12 rounded-lg overflow-hidden bg-white border border-appleCore-200
               flex items-center justify-center p-1 flex-shrink-0"
      >
        <img
          :src="themeStore.branding.logo"
          :alt="themeStore.branding.app_name"
          class="w-full h-full object-contain"
        />
      </div>

      <div v-if="!isCollapsed" class="flex-1 min-w-0">
        <h1 class="text-lg font-serif font-extrabold text-blueberry-800 truncate">
          {{ themeStore.branding.app_name }}
        </h1>
        <p class="text-[10px] uppercase tracking-widest text-blueberry-500 -mt-0.5">
          {{ themeStore.branding.app_tagline }}
        </p>
      </div>

      <!-- Close on mobile -->
      <button
        type="button"
        class="md:hidden w-9 h-9 rounded-lg hover:bg-appleCore-100 flex items-center justify-center"
        @click="closeMobile"
      >
        <i class="pi pi-times text-blueberry-600" />
      </button>
    </div>
    <div class="mx-4 h-px bg-appleCore-200" />
  </div>
</template>