<!-- src/features/roles/components/RoleTable.vue -->
<script setup lang="ts">
import type { Role, Pagination } from '../types'

import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

const props = defineProps<{
  roles: Role[]
  pagination?: Pagination | null
  loading: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', role: Role): void
  (e: 'delete', role: Role): void
  (e: 'manage-permissions', role: Role): void
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
}>()

function canEdit(role: Role): boolean {
  return !role.is_system
}

function canDelete(role: Role): boolean {
  return !role.is_system
}

function editTooltip(role: Role): string {
  return canEdit(role) ? 'Edit Role' : 'System role cannot be edited'
}

function deleteTooltip(role: Role): string {
  if (role.is_system) {
    return 'System role cannot be deleted'
  }
  if (role.users_count > 0) {
    return 'Warning: ' + role.users_count + ' user(s) will need reassignment'
  }
  return 'Delete Role'
}

function onPage(event: { page: number; first: number; rows: number }) {
  emit('page-change', event.page + 1)

  if (props.pagination && event.rows !== props.pagination.per_page) {
    emit('limit-change', event.rows)
  }
}

// 👇 Row click handler — clicking anywhere on the row opens Manage Permissions
function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return

  emit('manage-permissions', event.data as Role)
}
</script>

<template>
  <DataTable
    :value="roles"
    :loading="loading"
    :lazy="!!pagination"
    :paginator="!!pagination"
    :rows="pagination?.per_page ?? 10"
    :first="pagination?.offset ?? 0"
    :total-records="pagination?.total ?? roles.length"
    :rows-per-page-options="[10, 25, 50, 100]"
    :row-hover="true"
    class="!border-none"
    size="small"
    table-style="min-width: 50rem"
    @page="onPage"
    @row-click="onRowClick"
    :pt="{
      header: '!bg-appleCore-50/50 !text-blueberry-600 !font-semibold !text-xs !uppercase !tracking-wider',
      headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
      bodyRow: 'cursor-pointer hover:!bg-appleCore-50/40 !border-b !border-appleCore-100/60 transition-colors',
    }"
  >
    <template #empty>
      <div class="flex flex-col items-center justify-center py-16 gap-3">
        <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
          <i class="pi pi-shield text-2xl text-blueberry-300" />
        </div>
        <p class="text-sm text-blueberry-500 font-medium">No roles found</p>
        <p class="text-xs text-blueberry-400">Create your first role to get started</p>
      </div>
    </template>

    <template #loading>
      <div class="flex flex-col gap-2 p-4">
        <Skeleton v-for="n in 5" :key="n" height="2.5rem" class="w-full" />
      </div>
    </template>

    <!-- Role Name -->
    <Column field="name" header="Role Name" sortable>
      <template #body="{ data }">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-apricot-50 text-apricot-600
                   flex items-center justify-center flex-shrink-0"
          >
            <i class="pi pi-shield text-sm" />
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-blueberry-800 hover:text-apricot-600 transition-colors">
                {{ data.name }}
              </span>
              <Tag
                v-if="data.is_system"
                value="System"
                severity="secondary"
                class="!text-[10px] !py-0 !px-1.5"
              />
            </div>
          </div>
        </div>
      </template>
    </Column>

    <!-- Description -->
    <Column field="description" header="Description">
      <template #body="{ data }">
        <span class="text-blueberry-500 text-sm">
          {{ data.description ?? '—' }}
        </span>
      </template>
    </Column>

    <!-- Permissions -->
    <Column field="permissions_count" header="Permissions" sortable style="width: 160px">
      <template #body="{ data }">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700
                 rounded-full text-xs font-medium ring-1 ring-blue-200"
        >
          <i class="pi pi-key text-[10px]" />
          {{ data.permissions_count }} {{ data.permissions_count === 1 ? 'permission' : 'permissions' }}
        </span>
      </template>
    </Column>

    <!-- Users -->
    <Column field="users_count" header="Users" sortable style="width: 120px">
      <template #body="{ data }">
        <div class="flex items-center gap-1.5">
          <i class="pi pi-users text-xs text-blueberry-400" />
          <span class="text-sm text-blueberry-700 tabular-nums font-medium">
            {{ data.users_count }}
          </span>
        </div>
      </template>
    </Column>

    <!-- Actions -->
    <Column header="Actions" style="width: 12rem">
      <template #body="{ data }">
        <div class="flex items-center gap-0.5" @click.stop>
          <Button
            v-tooltip.top="'Manage Permissions'"
            icon="pi pi-key"
            text
            rounded
            size="small"
            class="!text-blueberry-500 hover:!text-blue-600 hover:!bg-blue-50"
            @click="emit('manage-permissions', data)"
          />

          <Button
            v-tooltip.top="editTooltip(data)"
            icon="pi pi-pencil"
            text
            rounded
            size="small"
            class="!text-blueberry-500 hover:!text-apricot-600 hover:!bg-apricot-50"
            :disabled="!canEdit(data)"
            @click="emit('edit', data)"
          />

          <Button
            v-tooltip.top="deleteTooltip(data)"
            icon="pi pi-trash"
            text
            rounded
            size="small"
            class="!text-blueberry-500 hover:!text-red-500 hover:!bg-red-50"
            :disabled="!canDelete(data)"
            @click="emit('delete', data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>