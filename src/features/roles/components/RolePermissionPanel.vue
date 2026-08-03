<!-- src/features/roles/components/RolePermissionPanel.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRolePermissions } from '../composables/useRolePermissions'
import type { Role, Permission } from '../types'

import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Checkbox from 'primevue/checkbox'

const props = defineProps<{
  visible: boolean
  role: Role | null
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'synced'): void
}>()

const {
  allPermissions,
  selectedPermissions,
  checkedMap,
  groupedPermissions,
  groupNames,
  loadingAll,
  isGroupSelected,
  isGroupIndeterminate,
  toggleGroup,
  togglePermission,
  selectAll,
  deselectAll,
  loadRolePermissions,
  handleSync,
  reset,
} = useRolePermissions()

function permKey(name: string): string {
  return (name ?? '').trim().toLowerCase()
}

// ─── Search + collapse ───────────────────────────────────
const searchQuery = ref('')
const collapsedGroups = ref<Set<string>>(new Set())

const sortedGroupNames = computed(() =>
  [...groupNames.value].sort((a, b) => a.localeCompare(b)),
)

const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedGroupNames.value

  return sortedGroupNames.value.filter((group) => {
    if (group.toLowerCase().includes(q)) return true
    return groupedPermissions.value[group]?.some((p: Permission) =>
      p.name.toLowerCase().includes(q),
    )
  })
})

function getFilteredPermissions(module: string): Permission[] {
  const perms = groupedPermissions.value[module] ?? []
  const sorted = [...perms].sort((a, b) => a.name.localeCompare(b.name))
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sorted
  if (module.toLowerCase().includes(q)) return sorted
  return sorted.filter((p) => p.name.toLowerCase().includes(q))
}

function selectedInGroup(module: string): number {
  const group = groupedPermissions.value[module] ?? []
  return group.filter((p) => !!checkedMap[permKey(p.name)]).length
}

function toggleCollapse(module: string): void {
  const next = new Set(collapsedGroups.value)
  if (next.has(module)) next.delete(module)
  else next.add(module)
  collapsedGroups.value = next
}

function expandAll(): void {
  collapsedGroups.value = new Set()
}

function collapseAll(): void {
  collapsedGroups.value = new Set(sortedGroupNames.value)
}

watch(searchQuery, (q) => {
  if (q.trim()) collapsedGroups.value = new Set()
})

// ─── Module icons + colors ───────────────────────────────
const moduleConfig: Record<string, { icon: string; color: string }> = {
  role: { icon: 'pi-shield', color: 'bg-purple-500' },
  permission: { icon: 'pi-key', color: 'bg-amber-500' },
  user: { icon: 'pi-users', color: 'bg-blue-500' },
  applicant: { icon: 'pi-user-plus', color: 'bg-teal-500' },
  document: { icon: 'pi-file', color: 'bg-indigo-500' },
  batch: { icon: 'pi-box', color: 'bg-orange-500' },
  company: { icon: 'pi-building', color: 'bg-cyan-500' },
  dashboard: { icon: 'pi-th-large', color: 'bg-slate-500' },
  report: { icon: 'pi-chart-bar', color: 'bg-pink-500' },
  analytics: { icon: 'pi-chart-line', color: 'bg-rose-500' },
  notification: { icon: 'pi-bell', color: 'bg-yellow-500' },
  setting: { icon: 'pi-cog', color: 'bg-gray-500' },
  correction: { icon: 'pi-refresh', color: 'bg-green-500' },
  ocr: { icon: 'pi-scanner', color: 'bg-fuchsia-500' },
  activity: { icon: 'pi-history', color: 'bg-emerald-500' },
  file: { icon: 'pi-folder', color: 'bg-lime-500' },
  quality: { icon: 'pi-star', color: 'bg-yellow-600' },
  verification: { icon: 'pi-verified', color: 'bg-sky-500' },
  audit: { icon: 'pi-search', color: 'bg-neutral-500' },
  login: { icon: 'pi-sign-in', color: 'bg-violet-500' },
  api: { icon: 'pi-code', color: 'bg-red-500' },
  backup: { icon: 'pi-database', color: 'bg-stone-500' },
  data: { icon: 'pi-download', color: 'bg-blue-600' },
  comment: { icon: 'pi-comment', color: 'bg-teal-600' },
  social: { icon: 'pi-share-alt', color: 'bg-pink-600' },
  workflow: { icon: 'pi-sitemap', color: 'bg-purple-600' },
  approval: { icon: 'pi-check-square', color: 'bg-lime-600' },
}

function getModuleKey(module: string): string {
  return module.split(/[-_. ]/)[0].toLowerCase()
}

function getModuleIcon(module: string): string {
  return moduleConfig[getModuleKey(module)]?.icon ?? 'pi-tag'
}

function getModuleColor(module: string): string {
  return moduleConfig[getModuleKey(module)]?.color ?? 'bg-surface-400'
}

// ─── Dialog lifecycle ────────────────────────────────────
watch(
  () => props.visible,
  async (open) => {
    if (open && props.role) {
      searchQuery.value = ''
      collapsedGroups.value = new Set()
      await loadRolePermissions(props.role)
    } else if (!open) {
      reset()
      searchQuery.value = ''
      collapsedGroups.value = new Set()
    }
  },
)

async function save(): Promise<void> {
  if (!props.role) return
  const ok = await handleSync(props.role)
  if (ok) {
    emit('synced')
    emit('update:visible', false)
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="!submitting"
    :dismissable-mask="false"
    :style="{ width: '820px', maxWidth: '95vw' }"
    :pt="{
      root: { class: 'rounded-2xl overflow-hidden' },
      header: {
        class:
          '!p-6 !pb-4 border-b border-surface-200 dark:border-surface-700',
      },
      content: { class: '!p-0 !overflow-hidden' },
      footer: {
        class:
          '!p-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900',
      },
    }"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3 w-full">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0"
        >
          <i class="pi pi-key text-white text-lg" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-bold text-surface-900 dark:text-surface-0">
            Manage Permissions
          </h2>
          <p class="text-xs text-surface-500 mt-0.5">
            Role:
            <span class="font-semibold text-primary-600 capitalize">
              {{ role?.name }}
            </span>
          </p>
        </div>
      </div>
    </template>

    <div class="flex flex-col h-[65vh] min-h-[420px]">
      <!-- Toolbar -->
      <div
        class="flex-shrink-0 p-4 border-b border-surface-200 dark:border-surface-800 flex flex-col gap-3 bg-surface-50 dark:bg-surface-900"
      >
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            placeholder="Search permissions or modules..."
            class="w-full"
            :disabled="loadingAll"
          />
        </IconField>

        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2 text-sm flex-wrap">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-xs"
            >
              <i class="pi pi-check text-xs" />
              {{ selectedPermissions.length }} selected
            </span>
            <span class="text-surface-400 text-xs">
              of {{ allPermissions.length }} total
            </span>
            <span
              v-if="searchQuery.trim() && !loadingAll"
              class="text-xs px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300"
            >
              {{ filteredGroups.length }} match
            </span>
          </div>

          <div class="flex items-center gap-1">
            <Button
              label="All"
              icon="pi pi-check-square"
              size="small"
              text
              severity="success"
              :disabled="loadingAll"
              @click="selectAll"
            />
            <Button
              label="Clear"
              icon="pi pi-times"
              size="small"
              text
              severity="secondary"
              :disabled="loadingAll"
              @click="deselectAll"
            />
            <div class="w-px h-5 bg-surface-300 dark:bg-surface-700 mx-1" />
            <Button
              icon="pi pi-angle-double-down"
              size="small"
              text
              severity="secondary"
              v-tooltip.top="'Expand all'"
              :disabled="loadingAll"
              @click="expandAll"
            />
            <Button
              icon="pi pi-angle-double-up"
              size="small"
              text
              severity="secondary"
              v-tooltip.top="'Collapse all'"
              :disabled="loadingAll"
              @click="collapseAll"
            />
          </div>
        </div>
      </div>

      <!-- Scroll area -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-surface-950">
        <div v-if="loadingAll" class="p-4 flex flex-col gap-3">
          <Skeleton
            v-for="n in 6"
            :key="`skel-${n}`"
            height="4rem"
            class="w-full !rounded-xl"
          />
        </div>

        <div
          v-else-if="filteredGroups.length === 0"
          class="flex flex-col items-center justify-center h-full text-surface-400 p-8"
        >
          <i class="pi pi-search text-4xl mb-3" />
          <p class="font-medium text-sm">No permissions found</p>
          <p class="text-xs mt-1 text-center">
            {{
              searchQuery
                ? `No results for "${searchQuery}"`
                : 'No permissions available'
            }}
          </p>
          <Button
            v-if="searchQuery"
            label="Clear search"
            size="small"
            text
            class="mt-3"
            @click="searchQuery = ''"
          />
        </div>

        <div v-else class="p-4 flex flex-col gap-2.5">
          <div
            v-for="group in filteredGroups"
            :key="group"
            class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 overflow-hidden transition-all hover:border-primary-300 dark:hover:border-primary-700"
          >
            <!-- Group header -->
            <div
              class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors select-none"
              @click="toggleCollapse(group)"
            >
              <div
                :class="[
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                  getModuleColor(group),
                ]"
              >
                <i :class="['pi', getModuleIcon(group), 'text-white text-sm']" />
              </div>

              <div class="flex-1 min-w-0">
                <h3
                  class="font-bold text-surface-900 dark:text-surface-0 capitalize truncate text-sm"
                >
                  {{ group.replace(/[-_]/g, ' ') }}
                </h3>
                <p class="text-xs text-surface-500 mt-0.5">
                  {{ selectedInGroup(group) }} /
                  {{ groupedPermissions[group]?.length ?? 0 }} enabled
                </p>
              </div>

              <div class="flex items-center gap-2" @click.stop>
                <Checkbox
                  :model-value="isGroupSelected(group)"
                  :indeterminate="isGroupIndeterminate(group)"
                  binary
                  @update:model-value="toggleGroup(group)"
                />
                <i
                  :class="[
                    'pi text-surface-400 text-xs transition-transform',
                    collapsedGroups.has(group)
                      ? 'pi-chevron-down'
                      : 'pi-chevron-up',
                  ]"
                />
              </div>
            </div>

            <!-- Permission rows — pre-checked via checkedMap -->
            <div
              v-if="!collapsedGroups.has(group)"
              class="grid grid-cols-1 sm:grid-cols-2 border-t border-surface-100 dark:border-surface-800"
            >
              <label
                v-for="perm in getFilteredPermissions(group)"
                :key="perm.id"
                class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors border-b border-surface-100 dark:border-surface-800 sm:[&:nth-child(odd)]:border-r"
                :class="{
                  'bg-primary-50/50 dark:bg-primary-900/10':
                    !!checkedMap[permKey(perm.name)],
                }"
              >
                <Checkbox
                  :model-value="!!checkedMap[permKey(perm.name)]"
                  binary
                  @update:model-value="togglePermission(perm.name)"
                />
                <span
                  class="text-xs font-mono truncate"
                  :class="
                    checkedMap[permKey(perm.name)]
                      ? 'text-primary-700 dark:text-primary-300 font-semibold'
                      : 'text-surface-600 dark:text-surface-300'
                  "
                  :title="perm.name"
                >
                  {{ perm.name }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="text-sm text-surface-500">
          <span class="font-semibold text-surface-700 dark:text-surface-200">
            {{ selectedPermissions.length }}
          </span>
          permission(s) will be assigned
        </div>
        <div class="flex gap-2">
          <Button
            label="Cancel"
            severity="secondary"
            text
            :disabled="submitting"
            @click="$emit('update:visible', false)"
          />
          <Button
            label="Save Permissions"
            icon="pi pi-save"
            :loading="submitting"
            :disabled="loadingAll"
            @click="save"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>