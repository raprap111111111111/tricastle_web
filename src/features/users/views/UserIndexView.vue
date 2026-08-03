<!-- src/features/users/views/UserIndexView.vue -->
<script setup lang="ts">
import { onMounted, onActivated } from 'vue'
import { useRouter }              from 'vue-router'
import { storeToRefs }            from 'pinia'
import { AppButton, AppCard, AppStatCard } from '@shared/ui'
import { useUserStore } from '../stores/user.store'
import { useUser }      from '../composables/useUser'
import UserFilters          from '../components/UserFilters.vue'
import UserTable            from '../components/UserTable.vue'
import UserDeleteDialog     from '../components/UserDeleteDialog.vue'
import UserRoleAssignDialog from '../components/UserRoleAssignDialog.vue'
import type { UserFilters as IFilters, User } from '../types'

const router = useRouter()
const store  = useUserStore()
const {
  users, pagination, filters, loading, submitting,
  totalUsers, activeCount, inactiveCount, lockedCount,
} = storeToRefs(store)

const {
  showDeleteDialog, showRoleDialog, selectedUser,
  openDelete, openRoleAssign,
  handleDelete, handleToggleActive, handleAssignRoles,
} = useUser()

onMounted(()   => store.fetchUsers())
onActivated(() => store.fetchUsers())

function onFilter(incoming: Partial<IFilters>) { store.setFilters(incoming) }
function onReset()               { store.resetFilters() }
function onPage(page: number)    { store.setPage(page) }
function onLimit(limit: number)  { store.setLimit(limit) }

function onToggle(u: User)       { handleToggleActive(u) }
function onDeleteRow(u: User)    { openDelete(u) }
function onAssignRoles(u: User)  { openRoleAssign(u) }

async function onDeleteConfirmed() {
  if (selectedUser.value) await handleDelete(selectedUser.value.id)
}

async function onRolesConfirmed(roles: string[]) {
  if (selectedUser.value) await handleAssignRoles(selectedUser.value.id, roles)
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto">

    <!-- Header -->
    <header class="flex items-start justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Users
        </h1>
        <p class="text-sm text-blueberry-500">
          Manage staff accounts, roles, and access
        </p>
      </div>

      <AppButton
        label="New User"
        icon="pi pi-plus"
        variant="accent"
        @click="router.push({ name: 'users.create' })"
      />
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppStatCard label="Total Users" :value="totalUsers"    icon="pi pi-users"        variant="blueberry" />
      <AppStatCard label="Active"      :value="activeCount"   icon="pi pi-check-circle" variant="green"     />
      <AppStatCard label="Inactive"    :value="inactiveCount" icon="pi pi-pause-circle" variant="apricot"   />
      <AppStatCard label="Locked"      :value="lockedCount"   icon="pi pi-lock"         variant="citrus"    />
    </div>

    <!-- Filters -->
    <AppCard :padding="'small'" :shadow="'none'" class="!bg-transparent !border-appleCore-200/60">
      <UserFilters :model-value="filters" @filter="onFilter" @reset="onReset" />
    </AppCard>

    <!-- Table -->
    <AppCard :padding="'none'" :shadow="'soft'">
      <UserTable
        :users="users"
        :pagination="pagination"
        :loading="loading"
        :submitting="submitting"
        @page="onPage"
        @limit="onLimit"
        @toggle="onToggle"
        @assign-roles="onAssignRoles"
        @delete="onDeleteRow"
      />
    </AppCard>

    <!-- Dialogs -->
    <UserDeleteDialog
      v-model:visible="showDeleteDialog"
      :user="selectedUser"
      :loading="submitting"
      @confirm="onDeleteConfirmed"
    />

    <UserRoleAssignDialog
      v-model:visible="showRoleDialog"
      :user="selectedUser"
      :loading="submitting"
      @confirm="onRolesConfirmed"
    />
  </div>
</template>