<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { usePermission } from '../composables/usePermission'
import { usePermissionStore } from '../stores/permission.store'
import PermissionTable from '../components/PermissionTable.vue'
import PermissionFormDialog from '../components/PermissionFormDialog.vue'
import PermissionDeleteDialog from '../components/PermissionDeleteDialog.vue'
import PermissionGroupedView from '../components/PermissionGroupedView.vue'
import type { Permission, PermissionDialogMode } from '../types'

// PrimeVue
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

// ─────────────────────────────────────────────
const store = usePermissionStore()
const {
  loadPermissions,
  loadGrouped,
  handleCreate,
  handleUpdate,
  handleDelete,
} = usePermission()

// ─────────────────────────────────────────────
// Dialog state
// ─────────────────────────────────────────────
const formDialogVisible   = ref(false)
const deleteDialogVisible = ref(false)
const dialogMode          = ref<PermissionDialogMode>('create')
const activePermission    = ref<Permission | null>(null)

// ✅ PrimeVue 4 uses STRING values instead of index numbers
const activeTab           = ref<string>('table')

// ─────────────────────────────────────────────
// Search state
// ─────────────────────────────────────────────
const searchQuery = ref('')

// ─────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────
function openCreate() {
  dialogMode.value        = 'create'
  activePermission.value  = null
  formDialogVisible.value = true
}

function openEdit(permission: Permission) {
  dialogMode.value        = 'edit'
  activePermission.value  = permission
  formDialogVisible.value = true
}

function openDelete(permission: Permission) {
  activePermission.value    = permission
  deleteDialogVisible.value = true
}

async function onSearch(query: string) {
  searchQuery.value = query
  await loadPermissions({
    search: query,
    limit:  store.pagination.per_page,
  })
}

async function onPage(event: { first: number; rows: number; page: number }) {
  await loadPermissions({
    search: searchQuery.value,
    offset: event.first,
    limit:  event.rows,
  })
}

async function onFormSubmit(payload: {
  name: string
  description?: string | null
  module?: string | null
}) {
  let result: Permission | null = null

  if (dialogMode.value === 'create') {
    result = await handleCreate(payload)
  } else if (activePermission.value) {
    result = await handleUpdate(activePermission.value.id, payload)
  }

  if (result) {
    formDialogVisible.value = false
    activePermission.value  = null
    if (activeTab.value === 'grouped') await loadGrouped()
  }
}

async function onDeleteConfirm() {
  if (!activePermission.value) return

  const ok = await handleDelete(activePermission.value)

  if (ok) {
    deleteDialogVisible.value = false
    activePermission.value    = null
    if (activeTab.value === 'grouped') await loadGrouped()
  }
}

// ─────────────────────────────────────────────
// Load grouped data when tab switches
// ─────────────────────────────────────────────
watch(activeTab, async (newTab) => {
  if (newTab === 'grouped' && Object.keys(store.groupedPermissions).length === 0) {
    await loadGrouped()
  }
})

// ─────────────────────────────────────────────
onMounted(() => loadPermissions())
</script>

<template>
  <div class="flex flex-col gap-6 p-6">

    <Toast />

    <!-- ── Page Header ─────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">
          Permissions
        </h1>
        <p class="text-sm text-surface-500 mt-1">
          Manage system permissions and access control
        </p>
      </div>

      <Button
        label="Create Permission"
        icon="pi pi-plus"
        @click="openCreate"
      />
    </div>

    <!-- ── Stats Row ───────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-4">
        <p class="text-xs text-surface-500 uppercase tracking-wide font-medium">
          Total Permissions
        </p>
        <p class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">
          {{ store.totalPermissions }}
        </p>
      </div>

      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-4">
        <p class="text-xs text-surface-500 uppercase tracking-wide font-medium">
          Modules
        </p>
        <p class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">
          {{ store.totalModules }}
        </p>
      </div>

      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-4">
        <p class="text-xs text-surface-500 uppercase tracking-wide font-medium">
          Current Page
        </p>
        <p class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">
          {{ store.pagination.current_page }} / {{ store.pagination.last_page }}
        </p>
      </div>

      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 p-4">
        <p class="text-xs text-surface-500 uppercase tracking-wide font-medium">
          Status
        </p>
        <p class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">
          <i v-if="store.loading" class="pi pi-spin pi-spinner text-primary-500" />
          <span v-else class="text-green-500 text-sm font-semibold">Ready</span>
        </p>
      </div>
    </div>

    <!-- ── Tabs: Table / Grouped ───────────────── -->
    <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 overflow-hidden">

      <!-- ✅ PrimeVue 4 Tabs API -->
      <Tabs v-model:value="activeTab">
        <TabList>
          <Tab value="table">
            <div class="flex items-center gap-2">
              <i class="pi pi-list" />
              <span>Table View</span>
            </div>
          </Tab>
          <Tab value="grouped">
            <div class="flex items-center gap-2">
              <i class="pi pi-th-large" />
              <span>Grouped by Module</span>
            </div>
          </Tab>
        </TabList>

        <TabPanels>
          <!-- Table Panel -->
          <TabPanel value="table">
            <PermissionTable
              :permissions="store.permissions"
              :loading="store.loading"
              :total-records="store.pagination.total"
              :rows="store.pagination.per_page"
              :first="(store.pagination.current_page - 1) * store.pagination.per_page"
              @edit="openEdit"
              @delete="openDelete"
              @search="onSearch"
              @page="onPage"
            />
          </TabPanel>

          <!-- Grouped Panel -->
          <TabPanel value="grouped">
            <div class="p-4">
              <PermissionGroupedView
                :grouped="store.groupedPermissions"
                :loading="store.loading"
              />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

    </div>

    <!-- ── Create / Edit Dialog ────────────────── -->
    <PermissionFormDialog
      v-model:visible="formDialogVisible"
      :mode="dialogMode"
      :permission="activePermission"
      :submitting="store.submitting"
      @submit="onFormSubmit"
    />

    <!-- ── Delete Dialog ───────────────────────── -->
    <PermissionDeleteDialog
      v-model:visible="deleteDialogVisible"
      :permission="activePermission"
      :submitting="store.submitting"
      @confirm="onDeleteConfirm"
    />

  </div>
</template>