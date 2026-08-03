<!-- src/features/roles/components/RoleTable.vue -->

<script setup lang="ts">
import type { Role, Pagination } from '../types'

// PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

// ─────────────────────────────────────────────
const props = defineProps<{
  roles:       Role[]
  pagination?: Pagination | null
  loading:     boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit',               role: Role): void
  (e: 'delete',             role: Role): void
  (e: 'manage-permissions', role: Role): void
  (e: 'page-change',        page: number): void
  (e: 'limit-change',       limit: number): void
}>()

// ─────────────────────────────────────────────
function canEdit(role: Role)   { return !role.is_system }
function canDelete(role: Role) { return !role.is_system && role.users_count === 0 }

// ─────────────────────────────────────────────
// Handle pagination event
// ─────────────────────────────────────────────
function onPage(event: { page: number; first: number; rows: number }) {
  // Page is 0-indexed in PrimeVue
  emit('page-change', event.page + 1)

  // Emit limit change if rows changed
  if (props.pagination && event.rows !== props.pagination.per_page) {
    emit('limit-change', event.rows)
  }
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
    striped-rows
    class="p-datatable-sm"
    table-style="min-width: 50rem"
    @page="onPage"
  >
    <template #empty>
      <div class="flex flex-col items-center justify-center py-16 text-surface-400">
        <i class="pi pi-shield text-5xl mb-4" />
        <p class="text-lg font-medium">No roles found</p>
        <p class="text-sm">Create your first role to get started</p>
      </div>
    </template>

    <template #loading>
      <div class="flex flex-col gap-2 p-4">
        <Skeleton v-for="n in 5" :key="n" height="2.5rem" class="w-full" />
      </div>
    </template>

    <Column field="name" header="Role Name" sortable>
      <template #body="{ data }">
        <div class="flex items-center gap-2">
          <i class="pi pi-shield text-primary-500" />
          <span class="font-medium">{{ data.name }}</span>
          <Tag
            v-if="data.is_system"
            value="System"
            severity="secondary"
            class="text-xs"
          />
        </div>
      </template>
    </Column>

    <Column field="description" header="Description">
      <template #body="{ data }">
        <span class="text-surface-500 text-sm">
          {{ data.description ?? '—' }}
        </span>
      </template>
    </Column>

    <Column field="permissions_count" header="Permissions" sortable>
      <template #body="{ data }">
        <Tag
          :value="`${data.permissions_count} permissions`"
          severity="info"
          class="text-xs"
        />
      </template>
    </Column>

    <Column field="users_count" header="Users" sortable>
      <template #body="{ data }">
        <div class="flex items-center gap-1">
          <i class="pi pi-users text-xs text-surface-400" />
          <span>{{ data.users_count }}</span>
        </div>
      </template>
    </Column>

    <Column header="Actions" style="width: 12rem">
      <template #body="{ data }">
        <div class="flex items-center gap-2">
          <Button
            icon="pi pi-key"
            text
            rounded
            severity="info"
            v-tooltip.top="'Manage Permissions'"
            @click="emit('manage-permissions', data)"
          />
          <Button
            icon="pi pi-pencil"
            text
            rounded
            severity="secondary"
            v-tooltip.top="canEdit(data) ? 'Edit Role' : 'System role cannot be edited'"
            :disabled="!canEdit(data)"
            @click="emit('edit', data)"
          />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            v-tooltip.top="
              !canEdit(data)
                ? 'System role cannot be deleted'
                : data.users_count > 0
                ? 'Remove all users before deleting'
                : 'Delete Role'
            "
            :disabled="!canDelete(data)"
            @click="emit('delete', data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>