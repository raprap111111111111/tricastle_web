<template>
  <aside class="w-[290px] bg-white border-r border-appleCore-200 flex flex-col flex-shrink-0">
    <SidebarHeader />
    <SidebarMenu />
  </aside>
</template>

<script setup lang="ts">
import SidebarHeader from './SidebarHeader.vue'
import SidebarMenu   from './SidebarMenu.vue'
</script>