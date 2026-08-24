<!-- src/features/users/components/UserTable.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import AppPagination from '@shared/ui/table/AppPagination.vue'
import UserAvatar from './UserAvatar.vue'
import UserStatusBadge from './UserStatusBadge.vue'
import type { User, Pagination } from '../types'

const props = defineProps<{
  users: User[]
  pagination: Pagination | null
  loading: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'page', page: number): void
  (e: 'limit', limit: number): void
  (e: 'toggle', user: User): void
  (e: 'assign-roles', user: User): void
  (e: 'delete', user: User): void
}>()

const router = useRouter()

function onRowClick(event: DataTableRowClickEvent) {
  const target = event.originalEvent?.target as HTMLElement | null
  if (target?.closest('button, a, .p-button')) return
  router.push({ name: 'users.show', params: { id: (event.data as User).id } })
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-CA')
  } catch { return '—' }
}
</script>

<template>
  <div class="flex flex-col relative">
    <DataTable
      :value="users"
      :loading="loading"
      class="!border-none"
      size="small"
      :row-hover="true"
      @row-click="onRowClick"
      :pt="{
        table: 'text-sm',
        headerRow: '!bg-appleCore-50/50 !border-b !border-appleCore-100',
        bodyRow: 'cursor-pointer !border-b !border-appleCore-100/60 hover:!bg-appleCore-50/40 transition-colors',
      }"
    >
      <!-- User -->
      <Column header="User" sortable sort-field="last_name">
        <template #body="{ data }">
          <div class="flex items-center gap-3 py-1">
            <UserAvatar :user="data" size="md" />
            <div class="flex flex-col min-w-0">
              <span class="font-medium text-blueberry-800 text-sm truncate">
                {{ data.full_name }}
              </span>
              <span class="text-xs text-blueberry-400 truncate">
                {{ data.email }}
              </span>
            </div>
          </div>
        </template>
      </Column>

      <Column header="Code" sortable sort-field="employee_code" style="width: 130px">
        <template #body="{ data }">
          <span v-if="data.employee_code" class="font-mono text-xs text-apricot-600 font-semibold">
            {{ data.employee_code }}
          </span>
          <span v-else class="text-xs text-blueberry-300">—</span>
        </template>
      </Column>

      <Column header="Department" sortable sort-field="department" style="width: 150px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">{{ data.department ?? '—' }}</span>
        </template>
      </Column>

      <Column header="Position" style="width: 150px">
        <template #body="{ data }">
          <span class="text-sm text-blueberry-600">{{ data.position ?? '—' }}</span>
        </template>
      </Column>

      <Column header="Roles" style="width: 180px">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="role in (data.roles ?? []).slice(0, 2)"
              :key="role"
              class="text-[10px] font-medium bg-blueberry-50 text-blueberry-700 px-2 py-0.5 rounded"
            >
              {{ role }}
            </span>
            <span
              v-if="(data.roles ?? []).length > 2"
              class="text-[10px] text-blueberry-400"
            >
              +{{ data.roles.length - 2 }}
            </span>
            <span v-if="!(data.roles ?? []).length" class="text-xs text-blueberry-300">—</span>
          </div>
        </template>
      </Column>

      <Column header="Status" style="width: 200px">
        <template #body="{ data }">
          <UserStatusBadge
            :is-active="data.is_active"
            :is-locked="data.is_locked"
            :two-factor-enabled="data.two_factor_enabled"
          />
        </template>
      </Column>

      <Column header="Last Login" sortable sort-field="last_login_at" style="width: 130px">
        <template #body="{ data }">
          <span class="text-xs text-blueberry-500">{{ formatDate(data.last_login_at) }}</span>
        </template>
      </Column>

      <Column header="Actions" style="width: 170px">
        <template #body="{ data }">
          <div class="flex items-center gap-0.5" @click.stop>
            <Button
              icon="pi pi-eye"
              text rounded size="small"
              class="!text-blueberry-400 hover:!text-blue-500 hover:!bg-blue-50"
              v-tooltip.top="'View'"
              @click="router.push({ name: 'users.show', params: { id: data.id } })"
            />
            <Button
              icon="pi pi-pencil"
              text rounded size="small"
              class="!text-blueberry-400 hover:!text-apricot-500 hover:!bg-apricot-50"
              v-tooltip.top="'Edit'"
              @click="router.push({ name: 'users.edit', params: { id: data.id } })"
            />
            <Button
              icon="pi pi-shield"
              text rounded size="small"
              class="!text-blueberry-400 hover:!text-purple-500 hover:!bg-purple-50"
              v-tooltip.top="'Assign Roles'"
              @click="emit('assign-roles', data)"
            />
            <Button
              :icon="data.is_active ? 'pi pi-pause' : 'pi pi-play'"
              text rounded size="small"
              class="!text-blueberry-400 hover:!text-citrus-600 hover:!bg-citrus-50"
              v-tooltip.top="data.is_active ? 'Deactivate' : 'Activate'"
              @click="emit('toggle', data)"
            />
            <Button
              icon="pi pi-trash"
              text rounded size="small"
              class="!text-blueberry-400 hover:!text-red-500 hover:!bg-red-50"
              v-tooltip.top="'Delete'"
              @click="emit('delete', data)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-16 h-16 rounded-full bg-appleCore-50 flex items-center justify-center">
            <i class="pi pi-users text-2xl text-blueberry-300" />
          </div>
          <p class="text-sm text-blueberry-500 font-medium">No users found</p>
          <p class="text-xs text-blueberry-400">Try adjusting your filters</p>
        </div>
      </template>

      <template #loading>
        <div class="flex flex-col items-center justify-center py-16 gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-apricot-500" />
          <p class="text-sm text-blueberry-500">Loading users...</p>
        </div>
      </template>
    </DataTable>

    <!-- 🎯 UNIFIED CUSTOM PAGINATION BAR -->
    <AppPagination
      v-if="props.pagination && props.pagination.total > 0"
      :pagination="props.pagination"
      @page-change="(page) => emit('page', page)"
      @limit-change="(limit) => emit('limit', limit)"
    />
  </div>
</template>