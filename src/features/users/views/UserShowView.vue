<!-- src/features/users/views/UserShowView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter }   from 'vue-router'
import { storeToRefs } from 'pinia'
import { AppButton, AppCard } from '@shared/ui'
import UserAvatar           from '../components/UserAvatar.vue'
import UserStatusBadge      from '../components/UserStatusBadge.vue'
import UserRoleAssignDialog from '../components/UserRoleAssignDialog.vue'
import { useUserStore } from '../stores/user.store'
import { useUser }      from '../composables/useUser'

const props  = defineProps<{ id: number }>()
const router = useRouter()

const store = useUserStore()
const { selected } = storeToRefs(store)

const {
  handleToggleActive,
  openRoleAssign, showRoleDialog, selectedUser,
  handleAssignRoles,
} = useUser()

onMounted(() => store.fetchUser(props.id))

function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-CA', {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

async function onRolesConfirmed(roles: string[]) {
  if (selectedUser.value) await handleAssignRoles(selectedUser.value.id, roles)
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1200px] mx-auto">
    <div v-if="store.loading || !selected" class="text-center py-16">
      <i class="pi pi-spin pi-spinner text-3xl text-apricot-500" />
    </div>

    <template v-else>
      <!-- ─── Header ─────────────────────────────────── -->
      <header class="flex items-start justify-between gap-6">
        <div class="flex items-center gap-5">
          <UserAvatar :user="selected" size="xl" />
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-xs text-blueberry-400">
              <button class="hover:text-apricot-600" @click="router.push({ name: 'users.index' })">
                Users
              </button>
              <i class="pi pi-chevron-right text-[10px]" />
              <span class="text-blueberry-600">{{ selected.full_name }}</span>
            </div>
            <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
              {{ selected.full_name }}
            </h1>
            <p class="text-sm text-blueberry-500">{{ selected.email }}</p>
            <UserStatusBadge
              :is-active="selected.is_active"
              :is-locked="selected.is_locked"
              :two-factor-enabled="selected.two_factor_enabled"
            />
          </div>
        </div>

        <div class="flex gap-2 flex-wrap justify-end">
          <AppButton
            :label="selected.is_active ? 'Deactivate' : 'Activate'"
            :icon="selected.is_active ? 'pi pi-pause' : 'pi pi-play'"
            variant="secondary"
            outlined
            @click="handleToggleActive(selected)"
          />
          <AppButton
            label="Assign Roles"
            icon="pi pi-shield"
            variant="primary"
            outlined
            @click="openRoleAssign(selected)"
          />
          <AppButton
            label="Edit"
            icon="pi pi-pencil"
            variant="accent"
            @click="router.push({ name: 'users.edit', params: { id: selected.id } })"
          />
        </div>
      </header>

      <!-- ─── Employment ─────────────────────────────── -->
      <AppCard :padding="'normal'" :shadow="'soft'">
        <template #header>
          <h2 class="text-sm font-semibold text-blueberry-800">Employment</h2>
        </template>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Employee Code</p>
            <p class="text-sm text-blueberry-800 font-mono">{{ selected.employee_code ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Department</p>
            <p class="text-sm text-blueberry-800">{{ selected.department ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Position</p>
            <p class="text-sm text-blueberry-800">{{ selected.position ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Hired Date</p>
            <p class="text-sm text-blueberry-800">{{ selected.hired_date ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Supervisor</p>
            <p class="text-sm text-blueberry-800">{{ selected.supervisor?.full_name ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Login Count</p>
            <p class="text-sm text-blueberry-800 tabular-nums">{{ selected.login_count }}</p>
          </div>
        </div>
      </AppCard>

      <!-- ─── Roles ──────────────────────────────────── -->
      <AppCard :padding="'normal'" :shadow="'soft'">
        <template #header>
          <h2 class="text-sm font-semibold text-blueberry-800">Roles</h2>
        </template>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="role in (selected.roles ?? [])"
            :key="role"
            class="text-xs font-medium bg-blueberry-50 text-blueberry-700 px-3 py-1
                   rounded-full border border-blueberry-100"
          >
            <i class="pi pi-shield mr-1 text-[10px]" />
            {{ role }}
          </span>
          <span v-if="!(selected.roles ?? []).length" class="text-sm text-blueberry-400">
            No roles assigned
          </span>
        </div>
      </AppCard>

      <!-- ─── Contact ────────────────────────────────── -->
      <AppCard :padding="'normal'" :shadow="'soft'">
        <template #header>
          <h2 class="text-sm font-semibold text-blueberry-800">Contact Info</h2>
        </template>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Email</p>
            <p class="text-sm text-blueberry-800">{{ selected.email }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Phone</p>
            <p class="text-sm text-blueberry-800">{{ selected.phone ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Mobile</p>
            <p class="text-sm text-blueberry-800">{{ selected.mobile ?? '—' }}</p>
          </div>
        </div>
      </AppCard>

      <!-- ─── Activity ───────────────────────────────── -->
      <AppCard :padding="'normal'" :shadow="'soft'">
        <template #header>
          <h2 class="text-sm font-semibold text-blueberry-800">Account Activity</h2>
        </template>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Last Login</p>
            <p class="text-sm text-blueberry-800">{{ formatDate(selected.last_login_at) }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Last IP</p>
            <p class="text-sm text-blueberry-800 font-mono">{{ selected.last_login_ip ?? '—' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-blueberry-500 uppercase mb-1">Created</p>
            <p class="text-sm text-blueberry-800">{{ formatDate(selected.created_at) }}</p>
          </div>
        </div>
      </AppCard>

      <!-- ─── Role Dialog ────────────────────────────── -->
      <UserRoleAssignDialog
        v-model:visible="showRoleDialog"
        :user="selectedUser"
        :loading="store.submitting"
        @confirm="onRolesConfirmed"
      />
    </template>
  </div>
</template>