<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { AppButton, AppCard } from '@shared/ui'
import { useAuthStore } from '@features/auth/stores/auth.store'
import { useUserFormatters } from '@/features/users/composables/useUserFormatters'

interface ProfileField {
  label: string
  value: string | null | undefined
  mono?: boolean
  span?: boolean
}

const router = useRouter()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

const {
  fullName,
  initials,
  primaryRole,
  avatarUrl,
  formatDate,
  formatDateTime,
} = useUserFormatters(user)

onMounted(() => {
  if (!user.value) auth.fetchProfile?.()
})

function display(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

const contactItems = computed(() => {
  if (!user.value) return []
  return [
    { icon: 'pi-envelope', label: user.value.email, href: `mailto:${user.value.email}` },
    user.value.phone
      ? { icon: 'pi-phone', label: user.value.phone, href: `tel:${user.value.phone}` }
      : null,
    user.value.mobile
      ? { icon: 'pi-mobile', label: user.value.mobile, href: `tel:${user.value.mobile}` }
      : null,
    user.value.department
      ? { icon: 'pi-building', label: user.value.department, href: null }
      : null,
  ].filter(Boolean) as { icon: string; label: string; href: string | null }[]
})

const employmentFields = computed<ProfileField[]>(() => {
  if (!user.value) return []
  return [
    { label: 'Employee code', value: user.value.employee_code, mono: true },
    { label: 'Department', value: user.value.department },
    { label: 'Position', value: user.value.position },
    { label: 'Hired date', value: formatDate(user.value.hired_date) },
    { label: 'Supervisor', value: user.value.supervisor?.full_name, span: true },
  ]
})

const personalFields = computed<ProfileField[]>(() => {
  if (!user.value) return []
  return [
    { label: 'First name', value: user.value.first_name },
    { label: 'Middle name', value: user.value.middle_name },
    { label: 'Last name', value: user.value.last_name },
    { label: 'Suffix', value: user.value.suffix },
    { label: 'Date of birth', value: formatDate(user.value.date_of_birth) },
    {
      label: 'Gender',
      value: user.value.gender
        ? String(user.value.gender).charAt(0).toUpperCase() + String(user.value.gender).slice(1)
        : null,
    },
  ]
})

const addressFields = computed<ProfileField[]>(() => {
  if (!user.value) return []
  return [
    { label: 'City', value: user.value.city },
    { label: 'Province', value: user.value.province },
    { label: 'Country', value: user.value.country ?? 'Philippines' },
    { label: 'Postal code', value: user.value.postal_code },
  ]
})

const activityStats = computed(() => {
  if (!user.value) return []
  return [
    {
      label: 'Last login',
      value: formatDateTime(user.value.last_login_at),
      icon: 'pi-clock',
    },
    {
      label: 'Last IP',
      value: user.value.last_login_ip ?? '—',
      icon: 'pi-globe',
      mono: true,
    },
    {
      label: 'Login count',
      value: String(user.value.login_count ?? 0),
      icon: 'pi-chart-line',
    },
    {
      label: 'Member since',
      value: formatDate(user.value.created_at),
      icon: 'pi-calendar',
    },
  ]
})
</script>

<template>
  <div class="min-h-full">
    <div class="mx-auto flex max-w-[1100px] flex-col gap-6 p-6 md:gap-8 md:p-8">
      <!-- Page header -->
      <header class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-apricot-600">
            Account
          </p>
          <h1 class="mt-1 text-3xl font-serif font-semibold tracking-tight text-blueberry-800">
            My Profile
          </h1>
          <p class="mt-1 text-sm text-blueberry-500">
            Personal information and account settings
          </p>
        </div>
      </header>

      <!-- Loading -->
      <div
        v-if="!user"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-appleCore-100 bg-white py-20 shadow-sm"
      >
        <i class="pi pi-spin pi-spinner text-3xl text-apricot-500" />
        <p class="text-sm text-blueberry-500">Loading your profile…</p>
      </div>

      <template v-else>
        <!-- Hero Card -->
        <section
          class="relative overflow-hidden rounded-2xl border border-appleCore-100 bg-white shadow-sm"
        >
          <!-- Soft top accent -->
          <div
            class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-apricot-50 via-white to-blueberry-50"
          />
          <div
            class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-apricot-100/40 blur-2xl"
          />

          <div class="relative flex flex-col gap-6 p-6 md:p-8">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <!-- Identity -->
              <div class="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <!-- Avatar -->
                <div class="relative shrink-0 self-start sm:self-center">
                  <div
                    class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full
                           bg-apricot-500 text-3xl font-bold text-white shadow-lg
                           ring-4 ring-white ring-offset-2 ring-offset-apricot-100"
                  >
                    <img
                      v-if="avatarUrl"
                      :src="avatarUrl"
                      alt=""
                      class="h-full w-full object-cover"
                    />
                    <span v-else>{{ initials }}</span>
                  </div>
                  <span
                    class="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                    :class="user.is_active ? 'bg-green-500' : 'bg-gray-400'"
                    :title="user.is_active ? 'Active' : 'Inactive'"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2
                      class="truncate text-2xl font-serif font-semibold tracking-tight text-blueberry-800 md:text-[1.7rem]"
                    >
                      {{ fullName }}
                    </h2>
                    <span
                      v-if="primaryRole"
                      class="inline-flex items-center rounded-full bg-apricot-50 px-2.5 py-0.5
                             text-xs font-semibold capitalize text-apricot-700 ring-1 ring-apricot-200"
                    >
                      {{ primaryRole }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset"
                      :class="
                        user.is_active
                          ? 'bg-green-50 text-green-700 ring-green-200'
                          : 'bg-gray-50 text-gray-600 ring-gray-200'
                      "
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full"
                        :class="user.is_active ? 'bg-green-500' : 'bg-gray-400'"
                      />
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>

                  <!-- Contact chips -->
                  <ul class="mt-3 flex flex-wrap gap-2">
                    <li v-for="(item, i) in contactItems" :key="i">
                      <a
                        v-if="item.href"
                        :href="item.href"
                        class="inline-flex items-center gap-1.5 rounded-full border border-appleCore-100
                               bg-white/80 px-3 py-1 text-sm text-blueberry-600 shadow-sm
                               transition hover:border-apricot-200 hover:text-apricot-700"
                      >
                        <i :class="['pi text-[11px] text-apricot-500', item.icon]" />
                        <span class="max-w-[220px] truncate">{{ item.label }}</span>
                      </a>
                      <span
                        v-else
                        class="inline-flex items-center gap-1.5 rounded-full border border-appleCore-100
                               bg-white/80 px-3 py-1 text-sm text-blueberry-600 shadow-sm"
                      >
                        <i :class="['pi text-[11px] text-apricot-500', item.icon]" />
                        {{ item.label }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex shrink-0 flex-wrap gap-2 lg:flex-col xl:flex-row">
                <AppButton
                  label="Edit Profile"
                  icon="pi pi-pencil"
                  variant="accent"
                  @click="router.push({ name: 'profile.edit' })"
                />
                <AppButton
                  label="Change Password"
                  icon="pi pi-key"
                  variant="secondary"
                  outlined
                  @click="router.push({ name: 'profile.password' })"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <!-- Employment -->
          <AppCard padding="normal" shadow="soft" class="h-full">
            <template #header>
              <div class="flex w-full items-center justify-between gap-2">
                <h3 class="flex items-center gap-2 text-sm font-semibold text-blueberry-800">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-apricot-50 text-apricot-600"
                  >
                    <i class="pi pi-briefcase text-sm" />
                  </span>
                  Employment
                </h3>
              </div>
            </template>

            <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="field in employmentFields"
                :key="field.label"
                class="rounded-xl border border-appleCore-50 bg-appleCore-50/40 px-3.5 py-3"
                :class="field.span ? 'sm:col-span-2' : ''"
              >
                <dt class="text-[11px] font-semibold uppercase tracking-wider text-blueberry-400">
                  {{ field.label }}
                </dt>
                <dd
                  class="mt-1 text-sm font-medium text-blueberry-800"
                  :class="field.mono ? 'font-mono' : ''"
                >
                  {{ display(field.value) }}
                </dd>
              </div>
            </dl>
          </AppCard>

          <!-- Personal -->
          <AppCard padding="normal" shadow="soft" class="h-full">
            <template #header>
              <div class="flex w-full items-center justify-between gap-2">
                <h3 class="flex items-center gap-2 text-sm font-semibold text-blueberry-800">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-apricot-50 text-apricot-600"
                  >
                    <i class="pi pi-user text-sm" />
                  </span>
                  Personal information
                </h3>
              </div>
            </template>

            <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="field in personalFields"
                :key="field.label"
                class="rounded-xl border border-appleCore-50 bg-appleCore-50/40 px-3.5 py-3"
              >
                <dt class="text-[11px] font-semibold uppercase tracking-wider text-blueberry-400">
                  {{ field.label }}
                </dt>
                <dd class="mt-1 text-sm font-medium text-blueberry-800">
                  {{ display(field.value) }}
                </dd>
              </div>
            </dl>
          </AppCard>

          <!-- Address -->
          <AppCard padding="normal" shadow="soft" class="h-full">
            <template #header>
              <div class="flex w-full items-center justify-between gap-2">
                <h3 class="flex items-center gap-2 text-sm font-semibold text-blueberry-800">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-apricot-50 text-apricot-600"
                  >
                    <i class="pi pi-map-marker text-sm" />
                  </span>
                  Address
                </h3>
              </div>
            </template>

            <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                class="rounded-xl border border-appleCore-50 bg-appleCore-50/40 px-3.5 py-3 sm:col-span-2"
              >
                <dt class="text-[11px] font-semibold uppercase tracking-wider text-blueberry-400">
                  Street address
                </dt>
                <dd class="mt-1 text-sm font-medium text-blueberry-800">
                  {{ display(user.address) }}
                </dd>
              </div>
              <div
                v-for="field in addressFields"
                :key="field.label"
                class="rounded-xl border border-appleCore-50 bg-appleCore-50/40 px-3.5 py-3"
              >
                <dt class="text-[11px] font-semibold uppercase tracking-wider text-blueberry-400">
                  {{ field.label }}
                </dt>
                <dd class="mt-1 text-sm font-medium text-blueberry-800">
                  {{ display(field.value) }}
                </dd>
              </div>
            </dl>
          </AppCard>

          <!-- Security / Activity -->
          <AppCard padding="normal" shadow="soft" class="h-full">
            <template #header>
              <div class="flex w-full items-center justify-between gap-2">
                <h3 class="flex items-center gap-2 text-sm font-semibold text-blueberry-800">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-apricot-50 text-apricot-600"
                  >
                    <i class="pi pi-shield text-sm" />
                  </span>
                  Security & activity
                </h3>
              </div>
            </template>

            <!-- 2FA banner -->
            <div
              class="mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
              :class="
                user.two_factor_enabled
                  ? 'border-green-200 bg-green-50/80'
                  : 'border-amber-200 bg-amber-50/70'
              "
            >
              <div class="flex items-center gap-3">
                <span
                  class="flex h-9 w-9 items-center justify-center rounded-full"
                  :class="
                    user.two_factor_enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  "
                >
                  <i
                    :class="user.two_factor_enabled ? 'pi pi-lock' : 'pi pi-exclamation-triangle'"
                    class="text-sm"
                  />
                </span>
                <div>
                  <p class="text-sm font-semibold text-blueberry-800">Two-factor authentication</p>
                  <p class="text-xs text-blueberry-500">
                    {{
                      user.two_factor_enabled
                        ? 'Your account has an extra layer of security.'
                        : 'Not enabled yet — consider turning this on.'
                    }}
                  </p>
                </div>
              </div>
              <span
                class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset"
                :class="
                  user.two_factor_enabled
                    ? 'bg-green-50 text-green-700 ring-green-200'
                    : 'bg-white text-amber-700 ring-amber-200'
                "
              >
                {{ user.two_factor_enabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="stat in activityStats"
                :key="stat.label"
                class="rounded-xl border border-appleCore-50 bg-appleCore-50/40 px-3.5 py-3"
              >
                <div class="flex items-start gap-2.5">
                  <i :class="['pi mt-0.5 text-xs text-apricot-500', stat.icon]" />
                  <div class="min-w-0">
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-blueberry-400">
                      {{ stat.label }}
                    </p>
                    <p
                      class="mt-1 truncate text-sm font-medium text-blueberry-800"
                      :class="stat.mono ? 'font-mono text-[13px]' : ''"
                    >
                      {{ stat.value }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </template>
    </div>
  </div>
</template>