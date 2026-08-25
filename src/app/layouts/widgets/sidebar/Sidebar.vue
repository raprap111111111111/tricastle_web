<template>
  <aside
    class="h-full w-full bg-white border-r border-appleCore-200 flex flex-col"
  >
    <SidebarHeader />
    <SidebarMenu />

    <!-- Collapse button (desktop only) -->
    <div class="hidden md:flex p-3 border-t border-appleCore-200">
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
               text-blueberry-600 hover:bg-appleCore-100 transition-colors"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleCollapsed"
      >
        <i
          class="pi text-sm"
          :class="isCollapsed ? 'pi-angle-double-right' : 'pi-angle-double-left'"
        />
        <span v-if="!isCollapsed" class="text-xs font-semibold">
          Collapse
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import SidebarHeader from './SidebarHeader.vue'
import SidebarMenu from './SidebarMenu.vue'
import { useSidebar } from '../../composables/useSidebar'

const { isCollapsed, toggleCollapsed } = useSidebar()
</script>