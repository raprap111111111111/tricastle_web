<script setup lang="ts">
import type { Permission } from '../types'

// PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

// ─────────────────────────────────────────────
const props = defineProps<{
  permissions: Permission[]
  loading:     boolean
  totalRecords: number
  rows:         number
  first:        number
}>()

const emit = defineEmits<{
  (e: 'edit',      permission: Permission): void
  (e: 'delete',    permission: Permission): void
  (e: 'search',    query: string): void
  (e: 'page',      event: { first: number; rows: number; page: number }): void
}>()

// ─────────────────────────────────────────────
function isProtected(permission: Permission): boolean {
  const protectedNames = [
    'role.viewAny',
    'role.create',
    'role.update',
    'role.delete',
    'permission.viewAny',
    'permission.manage',
  ]
  return protectedNames.includes(permission.name)
}

function moduleColor(module: string | null): string {
  if (!module) return 'secondary'
  const colors: Record<string, string> = {
    role:       'info',
    permission: 'warning',
    user:       'success',
    applicant:  'primary',
    document:   'secondary',
  }
  return colors[module] ?? 'secondary'
}
</script>

<template>
  <DataTable
    :value="permissions"
    :loading="loading"
    lazy
    paginator
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    :rows-per-page-options="[10, 25, 50, 100]"
    striped-rows
    class="p-datatable-sm"
    table-style="min-width: 50rem"
    @page="emit('page', $event as any)"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <span class="text-xl font-semibold text-surface-900 dark:text-surface-0">
          System Permissions
        </span>
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            placeholder="Search permissions..."
            class="w-64"
            @input="(e: Event) => emit('search', (e.target as HTMLInputElement).value)"
          />
        </IconField>
      </div>
    </template>

    <!-- Empty -->
    <template #empty>
      <div class="flex flex-col items-center justify-center py-16 text-surface-400">
        <i class="pi pi-key text-5xl mb-4" />
        <p class="text-lg font-medium">No permissions found</p>
        <p class="text-sm">Try adjusting your search or filters</p>
      </div>
    </template>

    <!-- Loading -->
    <template #loading>
      <div class="flex flex-col gap-2 p-4">
        <Skeleton v-for="n in 5" :key="n" height="2.5rem" class="w-full" />
      </div>
    </template>

    <!-- Columns -->
    <Column field="name" header="Permission" sortable>
      <template #body="{ data }">
        <div class="flex items-center gap-2">
          <i class="pi pi-key text-warning-500" />
          <span class="font-mono text-sm">{{ data.name }}</span>
          <Tag
            v-if="isProtected(data)"
            value="Protected"
            severity="danger"
            class="text-xs"
          />
        </div>
      </template>
    </Column>

    <Column field="module" header="Module" sortable>
      <template #body="{ data }">
        <Tag
          v-if="data.module"
          :value="data.module"
          :severity="moduleColor(data.module)"
          class="text-xs capitalize"
        />
        <span v-else class="text-surface-400">—</span>
      </template>
    </Column>

    <Column field="description" header="Description">
      <template #body="{ data }">
        <span class="text-surface-500 text-sm">
          {{ data.description ?? '—' }}
        </span>
      </template>
    </Column>

    <Column field="guard_name" header="Guard" sortable>
      <template #body="{ data }">
        <span class="text-xs text-surface-500 font-mono">
          {{ data.guard_name }}
        </span>
      </template>
    </Column>

    <Column header="Actions" style="width: 8rem">
      <template #body="{ data }">
        <div class="flex items-center gap-2">
          <Button
            icon="pi pi-pencil"
            text
            rounded
            severity="secondary"
            v-tooltip.top="isProtected(data) ? 'Protected permission' : 'Edit'"
            :disabled="isProtected(data)"
            @click="emit('edit', data)"
          />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            v-tooltip.top="isProtected(data) ? 'Protected permission' : 'Delete'"
            :disabled="isProtected(data)"
            @click="emit('delete', data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>