<template>
  <div class="h-screen flex bg-appleCore-50 overflow-hidden">
    <!-- Mobile overlay -->
    <div
      v-if="isMobileOpen"
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      @click="closeMobile"
    />

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:static md:translate-x-0 md:flex-shrink-0"
      :class="[
        sidebarWidthClass,
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <Sidebar />
    </div>

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <Topbar />
      <main class="flex-1 overflow-auto p-4 sm:p-6 bg-appleCore-50">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './widgets/sidebar/Sidebar.vue'
import Topbar from './widgets/topbar/Topbar.vue'
import { useSidebar } from '/Users/raprap/Desktop/tricastle_web/src/app/layouts/composables/useSidebar.ts'

const { isMobileOpen, sidebarWidthClass, closeMobile } = useSidebar()
</script>