<template>
  <div class="p-3 space-y-3 overflow-y-auto flex-1">
    <template v-for="(section, idx) in visibleSections" :key="section.title">
      <SidebarSection :title="section.title">
        <SidebarMenuItem
          v-for="item in section.items"
          :key="item.to"
          :icon="item.icon"
          :title="item.title"
          :to="item.to"
          :active-routes="item.activeRoutes"
        />
      </SidebarSection>

      <div v-if="idx < visibleSections.length - 1" class="mx-2 h-px bg-appleCore-200" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SidebarSection  from './SidebarSection.vue'
import SidebarMenuItem from './SidebarMenuItem.vue'
import { buildNavSections } from './sidebarNavConfig'
import { usePermissions } from '@shared/composables/usePermissions'
import type { NavSection } from '@shared/types/nav.types'

const { role, isSuperAdmin, canAny } = usePermissions()

const visibleSections = computed<NavSection[]>(() => {
  const sections = buildNavSections({ role: role.value, isSuperAdmin: isSuperAdmin.value })
  return sections
    .map((section) => ({ ...section, items: section.items.filter((item) => canAny(item.permissions)) }))
    .filter((section) => section.items.length > 0)
})
</script>