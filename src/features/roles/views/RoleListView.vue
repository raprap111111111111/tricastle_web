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
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

const store = useRoleStore()
const { loadRoles, handleCreate, handleUpdate, handleDelete } = useRole()

// ─── Search / filters ───────────────────────────────────
const search   = ref('')
const isSystem = ref<boolean | null>(null)

const systemOptions = [
  { label: 'All roles',    value: null  },
  { label: 'System only',  value: true  },
  { label: 'Custom only',  value: false },
]

let searchTimer: ReturnType<typeof setTimeout> | null = null

function applyFilters(): void {
  store.setFilters({
    search:    search.value.trim() || undefined,
    is_system: isSystem.value,
    offset:    0,
  })
  loadRoles()
}

function onSearchInput(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(applyFilters, 300)
}

function onResetFilters(): void {
  search.value   = ''
  isSystem.value = null
  store.resetFilters()
  loadRoles()
}

const hasActiveFilters = computed<boolean>(
  () => !!(search.value.trim() || isSystem.value !== null),
)

// ─── Dialog state ───────────────────────────────────────
const formDialogVisible      = ref(false)
const permissionPanelVisible = ref(false)
const deleteDialogVisible    = ref(false)
const dialogMode             = ref<RoleDialogMode>('create')
const activeRole             = ref<Role | null>(null)

function openCreate(): void {
  dialogMode.value        = 'create'
  activeRole.value        = null
  formDialogVisible.value = true
}

function openEdit(role: Role): void {
  dialogMode.value        = 'edit'
  activeRole.value        = role
  formDialogVisible.value = true
}

function openPermissions(role: Role): void {
  activeRole.value             = role
  permissionPanelVisible.value = true
}

function openDelete(role: Role): void {
  activeRole.value          = role
  deleteDialogVisible.value = true
}

async function onFormSubmit(
  payload: { name: string; description?: string | null }
): Promise<void> {
  let success: Role | null = null

  if (dialogMode.value === 'create') {
    success = await handleCreate({
      name:        payload.name,
      description: payload.description,
    })
  } else if (activeRole.value) {
    success = await handleUpdate(activeRole.value.id, {
      name:        payload.name,
      description: payload.description,
    })
  }

  if (success) {
    formDialogVisible.value = false
    activeRole.value        = null
  }
}

async function onDeleteConfirm(): Promise<void> {
  if (!activeRole.value) return
  const ok = await handleDelete(activeRole.value)
  if (ok) {
    deleteDialogVisible.value = false
    activeRole.value          = null
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

      <AppButton
        label="Create Role"
        icon="pi pi-plus"
        variant="accent"
        @click="openCreate"
      />
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard
        label="Total Roles"
        :value="store.totalRoles"
        icon="pi pi-shield"
        variant="blueberry"
      />
      <AppStatCard
        label="System Roles"
        :value="store.systemRoles.length"
        icon="pi pi-lock"
        variant="citrus"
      />
      <AppStatCard
        label="Custom Roles"
        :value="store.editableRoles.length"
        icon="pi pi-users"
        variant="apricot"
      />
      <AppStatCard
        label="Status"
        :value="store.loading ? '…' : 'Ready'"
        icon="pi pi-check-circle"
        variant="green"
      />
    </div>

    <!-- Filters -->
    <AppCard
      :padding="'small'"
      :shadow="'none'"
      class="!bg-transparent !border-appleCore-200/60"
    >
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-blueberry-400 text-sm" />
          <InputText
            v-model="search"
            placeholder="Search roles by name…"
            class="w-full !pl-9"
            @input="onSearchInput"
          />
        </div>

        <Select
          v-model="isSystem"
          :options="systemOptions"
          option-label="label"
          option-value="value"
          placeholder="Role type"
          class="w-full sm:w-44"
          @change="applyFilters"
        />

        <Button
          v-if="hasActiveFilters"
          label="Reset"
          icon="pi pi-filter-slash"
          text
          class="!text-blueberry-500"
          @click="onResetFilters"
        />
      </div>
    </AppCard>

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

    <!-- ✅ FIXED — removed :loading prop, panel manages its own loading state -->
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