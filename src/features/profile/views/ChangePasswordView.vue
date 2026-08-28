<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { AppButton, AppCard } from '@shared/ui'
import { useProfile } from '../composables/useProfile'

const router = useRouter()
const { isSaving, error, handleChangePassword } = useProfile()

const inputClass = 'w-full rounded-lg border border-appleCore-100 px-3 py-2 text-sm focus:border-apricot-400 focus:ring-2 focus:ring-apricot-200'

const form = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

async function onSubmit() {
  if (form.password !== form.password_confirmation) {
    error.value = 'Passwords do not match'
    return
  }
  await handleChangePassword(form)
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[520px] mx-auto">
    <header>
      <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
        Change Password
      </h1>
      <p class="text-sm text-blueberry-500 mt-1">
        Choose a strong password you don’t use elsewhere
      </p>
    </header>

    <AppCard padding="normal" shadow="soft">
      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          {{ error }}
        </div>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Current password</span>
          <input v-model="form.current_password" type="password" required :class="inputClass" />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">New password</span>
          <input v-model="form.password" type="password" required minlength="8" :class="inputClass" />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Confirm new password</span>
          <input v-model="form.password_confirmation" type="password" required minlength="8" :class="inputClass" />
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <AppButton type="button" label="Cancel" variant="secondary" outlined @click="router.push({ name: 'Profile' })" />
          <AppButton type="submit" label="Update password" icon="pi pi-key" variant="accent" :loading="isSaving" />
        </div>
      </form>
    </AppCard>
  </div>
</template>