<script setup lang="ts">
import { useThemeStore } from '@features/settings/theme/theme.store'
const themeStore = useThemeStore()
</script>

<template>
  <div>
    <div class="px-6 pt-6 pb-5 flex items-center gap-3">
      <div class="w-12 h-12 rounded-lg overflow-hidden bg-white border border-appleCore-200 flex items-center justify-center p-1">
        <img
          :src="themeStore.branding.logo"
          :alt="themeStore.branding.app_name"
          class="w-full h-full object-contain"
        />
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-serif font-extrabold text-blueberry-800 truncate">
          {{ themeStore.branding.app_name }}
        </h1>
        <p class="text-[10px] uppercase tracking-widest text-blueberry-500 -mt-0.5">
          {{ themeStore.branding.app_tagline }}
        </p>
      </div>
    </div>
    <div class="mx-4 h-px bg-appleCore-200" />
  </div>
</template>