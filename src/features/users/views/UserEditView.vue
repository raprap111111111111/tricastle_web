<!-- src/features/users/views/UserEditView.vue -->
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText  from 'primevue/inputtext'
import Password   from 'primevue/password'
import Dropdown   from 'primevue/dropdown'
import Checkbox   from 'primevue/checkbox'
import FileUpload from 'primevue/fileupload'
import { AppButton, AppCard } from '@shared/ui'
import { useUser } from '../composables/useUser'
import { ROLE_OPTIONS, type UpdateUserPayload } from '../types'

const props  = defineProps<{ id: number }>()
const router = useRouter()
const { store, handleUpdate } = useUser()

const form   = reactive<UpdateUserPayload>({})
const saving = ref(false)

onMounted(async () => {
  const user = await store.fetchUser(props.id)
  Object.assign(form, {
    first_name:    user.first_name,
    middle_name:   user.middle_name ?? undefined,
    last_name:     user.last_name,
    suffix:        user.suffix ?? undefined,
    email:         user.email,
    mobile:        user.mobile ?? undefined,
    employee_code: user.employee_code ?? undefined,
    department:    user.department ?? undefined,
    position:      user.position ?? undefined,
    role:          user.roles?.[0] ?? undefined,
    is_active:     user.is_active,
  })
})

function onFileSelect(event: any) {
  form.avatar = event.files?.[0] ?? null
}

async function submit() {
  saving.value = true
  try {
    const payload = { ...form }
    if (!payload.password)              delete payload.password
    if (!payload.password_confirmation) delete payload.password_confirmation

    const updated = await handleUpdate(props.id, payload)
    if (updated) router.push({ name: 'users.show', params: { id: updated.id } })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[1000px] mx-auto">
    <!-- ─── Header ─────────────────────────────────── -->
    <header class="flex flex-col gap-1">
      <div class="flex items-center gap-2 text-xs text-blueberry-400 mb-1">
        <button class="hover:text-apricot-600" @click="router.push({ name: 'users.index' })">
          Users
        </button>
        <i class="pi pi-chevron-right text-[10px]" />
        <span class="text-blueberry-600">Edit</span>
      </div>
      <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
        Edit User
      </h1>
      <p class="text-sm text-blueberry-500">Update account information and permissions</p>
    </header>

    <div v-if="store.loading" class="text-center py-16">
      <i class="pi pi-spin pi-spinner text-3xl text-apricot-500" />
    </div>

    <template v-else>
      <!-- ─── Personal ───────────────────────────────── -->
      <AppCard :padding="'normal'" :shadow="'soft'">
        <template #header>
          <h2 class="text-sm font-semibold text-blueberry-800">Personal Info</h2>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">First Name</label>
            <InputText v-model="form.first_name" class="!rounded-xl !border-appleCore-200" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Last Name</label>
            <InputText v-model="form.last_name" class="!rounded-xl !border-appleCore-200" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Middle Name</label>
            <InputText v-model="form.middle_name" class="!rounded-xl !border-appleCore-200" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Suffix</label>
            <InputText v-model="form.suffix" class="!rounded-xl !border-appleCore-200" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Email</label>
            <InputText v-model="form.email" type="email" class="!rounded-xl !border-appleCore-200" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Mobile</label>
            <InputText v-model="form.mobile" class="!rounded-xl !border-appleCore-200" />
          </div>
        </div>
      </AppCard>

      <!-- ─── Employment ─────────────────────────────── -->
      <AppCard :padding="'normal'" :shadow="'soft'">
        <template #header>
          <h2 class="text-sm font-semibold text-blueberry-800">Employment</h2>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Employee Code</label>
            <InputText v-model="form.employee_code" class="!rounded-xl !border-appleCore-200 !font-mono" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Department</label>
            <InputText v-model="form.department" class="!rounded-xl !border-appleCore-200" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Position</label>
            <InputText v-model="form.position" class="!rounded-xl !border-appleCore-200" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Role</label>
            <Dropdown
              v-model="form.role"
              :options="ROLE_OPTIONS"
              option-label="label"
              option-value="value"
              class="w-full !rounded-xl !border-appleCore-200"
            />
          </div>
        </div>
      </AppCard>

      <!-- ─── Password (Optional) ────────────────────── -->
      <AppCard :padding="'normal'" :shadow="'soft'">
        <template #header>
          <h2 class="text-sm font-semibold text-blueberry-800">
            Change Password
            <span class="text-xs text-blueberry-400 font-normal ml-2">
              (leave empty to keep current)
            </span>
          </h2>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">New Password</label>
            <Password v-model="form.password" toggle-mask :feedback="true"
                      input-class="!rounded-xl !border-appleCore-200 w-full" class="w-full" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Confirm Password</label>
            <Password v-model="form.password_confirmation" toggle-mask :feedback="false"
                      input-class="!rounded-xl !border-appleCore-200 w-full" class="w-full" />
          </div>
        </div>
      </AppCard>

      <!-- ─── Avatar & Status ────────────────────────── -->
      <AppCard :padding="'normal'" :shadow="'soft'">
        <template #header>
          <h2 class="text-sm font-semibold text-blueberry-800">Avatar & Status</h2>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-blueberry-500 uppercase">Change Avatar</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              :max-file-size="2000000"
              :auto="false"
              choose-label="Upload New Avatar"
              :custom-upload="true"
              class="!rounded-xl"
              @select="onFileSelect"
            />
          </div>

          <div class="flex items-center gap-2 pt-6">
            <Checkbox v-model="form.is_active" :binary="true" input-id="e-active" />
            <label for="e-active" class="text-sm text-blueberry-700 cursor-pointer">
              Account is active
            </label>
          </div>
        </div>
      </AppCard>

      <!-- ─── Actions ────────────────────────────────── -->
      <div class="flex justify-end gap-3 sticky bottom-4 bg-surface-page/80 backdrop-blur-sm
                  p-4 rounded-2xl border border-appleCore-200">
        <AppButton label="Cancel" variant="neutral" outlined @click="router.back()" />
        <AppButton
          label="Save Changes"
          variant="accent"
          icon="pi pi-check"
          :loading="saving || store.submitting"
          @click="submit"
        />
      </div>
    </template>
  </div>
</template>