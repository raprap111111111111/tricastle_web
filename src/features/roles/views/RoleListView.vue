<!-- src/features/roles/views/RoleListView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRole } from '../composables/useRole'
import { useRoleStore } from '../stores/role.store'
import RoleTable from '../components/RoleTable.vue'
import RoleFormDialog from '../components/RoleFormDialog.vue'
import RolePermissionPanel from '../components/RolePermissionPanel.vue'
import RoleDeleteDialog from '../components/RoleDeleteDialog.vue'
import type { Role, RoleDialogMode } from '../types'
import { AppButton, AppCard, AppStatCard, AppSearchBar } from '@shared/ui'
import Select from 'primevue/select'
import Button from 'primevue/button'

const store = useRoleStore()
const { loadRoles, handleCreate, handleUpdate, handleDelete } = useRole()

// ─── Search / filters ───────────────────────────────────
const search = ref('')
const isSystem = ref<boolean | null>(null)

const systemOptions = [
  { label: 'All roles', value: null },
  { label: 'System only', value: true },
  { label: 'Custom only', value: false },
]

function applyFilters(): void {
  store.setFilters({
    search: search.value.trim() || undefined,
    is_system: isSystem.value,
    offset: 0,
  })
  loadRoles()
}

function onSearch(value: string): void {
  search.value = value.trim()
  applyFilters()
}

function onResetFilters(): void {
  search.value = ''
  isSystem.value = null
  store.resetFilters()
  loadRoles()
}

// ─── Active filter chips ──────────────────────────────
const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []

  if (search.value.trim()) {
    filters.push({ key: 'search', label: 'Search', value: search.value })
  }
  if (isSystem.value !== null) {
    filters.push({
      key: 'is_system',
      label: 'Type',
      value: isSystem.value ? 'System' : 'Custom',
    })
  }

  return filters
})

const hasActiveFilters = computed<boolean>(() => activeFilters.value.length > 0)

function removeFilter(key: string): void {
  if (key === 'search') search.value = ''
  if (key === 'is_system') isSystem.value = null
  applyFilters()
}

// ─── Dialog state ───────────────────────────────────────
const formDialogVisible = ref(false)
const permissionPanelVisible = ref(false)
const deleteDialogVisible = ref(false)
const dialogMode = ref<RoleDialogMode>('create')
const activeRole = ref<Role | null>(null)

function openCreate(): void {
  dialogMode.value = 'create'
  activeRole.value = null
  formDialogVisible.value = true
}

function openEdit(role: Role): void {
  dialogMode.value = 'edit'
  activeRole.value = role
  formDialogVisible.value = true
}

function openPermissions(role: Role): void {
  activeRole.value = role
  permissionPanelVisible.value = true
}

function openDelete(role: Role): void {
  activeRole.value = role
  deleteDialogVisible.value = true
}

async function onFormSubmit(
  payload: { name: string; description?: string | null }
): Promise<void> {
  let success: Role | null = null

  if (dialogMode.value === 'create') {
    success = await handleCreate({
      name: payload.name,
      description: payload.description,
    })
  } else if (activeRole.value) {
    success = await handleUpdate(activeRole.value.id, {
      name: payload.name,
      description: payload.description,
    })
  }

  if (success) {
    formDialogVisible.value = false
    activeRole.value = null
  }
}

async function onDeleteConfirm(): Promise<void> {
  if (!activeRole.value) return

  const ok = await handleDelete(activeRole.value)
  if (ok) {
    deleteDialogVisible.value = false
    activeRole.value = null
  }
}

function onPageChange(page: number): void {
  store.setPage(page)
  loadRoles()
}

function onLimitChange(limit: number): void {
  store.setLimit(limit)
  loadRoles()
}

onMounted(() => loadRoles())
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">
    <!-- Header -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Roles & Permissions
        </h1>
        <p class="text-sm text-blueberry-500">
          Manage access control roles and assign permissions
        </p>
      </div>

      <AppButton label="Create Role" icon="pi pi-plus" variant="accent" @click="openCreate" />
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Roles" :value="store.totalRoles" icon="pi pi-shield" variant="blueberry" />
      <AppStatCard label="System Roles" :value="store.systemRoles.length" icon="pi pi-lock" variant="citrus" />
      <AppStatCard label="Custom Roles" :value="store.editableRoles.length" icon="pi pi-users" variant="apricot" />
      <AppStatCard label="Status" :value="store.loading ? '…' : 'Ready'" icon="pi pi-check-circle" variant="green" />
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-3 p-4 bg-white border border-appleCore-100 rounded-xl">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <AppSearchBar
          v-model="search"
          placeholder="Search roles by name…"
          button-label=""
          class="flex-1 min-w-[280px]"
          @search="onSearch"
        />

        <!-- Role Type Select -->
        <Select
          v-model="isSystem"
          :options="systemOptions"
          option-label="label"
          option-value="value"
          placeholder="Role type"
          class="w-full sm:w-44"
          @change="applyFilters"
        />

        <!-- Reset Button -->
        <Button
          v-if="hasActiveFilters"
          icon="pi pi-refresh"
          severity="secondary"
          text
          rounded
          v-tooltip.top="'Reset all filters'"
          @click="onResetFilters"
        />
      </div>

      <!-- Active filter chips -->
      <div
        v-if="hasActiveFilters"
        class="flex items-center flex-wrap gap-2 pt-2 border-t border-appleCore-100"
      >
        <span class="text-xs text-blueberry-500 font-medium">Active:</span>

        <span
          v-for="f in activeFilters"
          :key="f.key"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700
                 rounded-full text-xs font-medium ring-1 ring-apricot-200"
        >
          <span class="font-semibold">{{ f.label }}:</span>
          <span>{{ f.value }}</span>
          <button
            type="button"
            class="ml-0.5 hover:text-apricot-900 transition-colors"
            @click="removeFilter(f.key)"
          >
            <i class="pi pi-times text-[10px]" />
          </button>
        </span>
      </div>
    </div>

    <!-- Table -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <RoleTable
        :roles="store.roles"
        :pagination="store.pagination"
        :loading="store.loading"
        :submitting="store.submitting"
        @edit="openEdit"
        @delete="openDelete"
        @manage-permissions="openPermissions"
        @page-change="onPageChange"
        @limit-change="onLimitChange"
      />
    </AppCard>

    <!-- Create / Edit Role Dialog -->
    <RoleFormDialog
      v-model:visible="formDialogVisible"
      :mode="dialogMode"
      :role="activeRole"
      :submitting="store.submitting"
      @submit="onFormSubmit"
    />

    <!-- Role Permission Panel -->
    <RolePermissionPanel
      v-model:visible="permissionPanelVisible"
      :role="activeRole"
      :submitting="store.submitting"
      @synced="loadRoles"
    />

    <!-- Delete Confirmation -->
    <RoleDeleteDialog
      v-model:visible="deleteDialogVisible"
      :role="activeRole"
      :submitting="store.submitting"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>