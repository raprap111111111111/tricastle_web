<template>
  <div class="h-screen flex bg-appleCore-50 overflow-hidden">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <Topbar />
      <main class="flex-1 overflow-auto p-6 bg-appleCore-50">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from './widgets/sidebar/Sidebar.vue'
import Topbar  from './widgets/topbar/Topbar.vue'
</script>