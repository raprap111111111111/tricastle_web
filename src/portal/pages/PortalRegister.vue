<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { usePortalAuth } from '../composables/usePortalAuth'

const route = useRoute()
const router = useRouter()
const { register, loading } = usePortalAuth()

const form = ref({ first_name: '', last_name: '', date_of_birth: '', email: '', password: '', password_confirmation: '' })
const errors = ref<Record<string, string>>({})

onMounted(() => {
  form.value.first_name = (route.query.first_name as string) ?? ''
  form.value.last_name = (route.query.last_name as string) ?? ''
  form.value.date_of_birth = (route.query.date_of_birth as string) ?? ''
  if (!route.query.applicant_id) router.replace('/portal/verify')
})

async function handleRegister() {
  errors.value = {}
  try {
    await register(form.value)
  } catch (err: any) {
    errors.value = { general: err.response?.data?.message ?? 'Registration failed.' }
  }
}
</script>

<template>
  <div class="max-w-md mx-auto relative z-10 w-full animate-fadeIn">
    <div class="text-center mb-6">
      <div class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-user-plus text-green-600 text-2xl" />
      </div>
      <h1 class="text-3xl font-serif font-bold text-blueberry-800">Create your account</h1>
    </div>

    <div class="bg-white/95 backdrop-blur-md p-8 rounded-[1.5rem] shadow-medium border border-appleCore-100">
      <p class="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 mb-6 font-medium">
        <i class="pi pi-check-circle mr-1" />
        Your identity has been verified. Set an email and password to access your applicant portal.
      </p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div v-if="errors.general" class="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <i class="pi pi-exclamation-circle mt-0.5" />
          {{ errors.general }}
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Email</label>
          <InputText v-model="form.email" type="email" class="w-full !bg-[#eef3f7] !border-transparent focus:!border-apricot-400 !rounded-xl !px-4 !py-3" />
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Password</label>
          <Password v-model="form.password" toggle-mask :feedback="true" input-class="w-full !bg-[#eef3f7] !border-transparent focus:!border-apricot-400 !rounded-xl !px-4 !py-3" class="w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Confirm Password</label>
          <Password v-model="form.password_confirmation" toggle-mask :feedback="false" input-class="w-full !bg-[#eef3f7] !border-transparent focus:!border-apricot-400 !rounded-xl !px-4 !py-3" class="w-full" />
        </div>

        <div class="pt-2">
          <Button type="submit" label="Create Account" class="w-full !bg-apricot-500 hover:!bg-apricot-600 !border-none !rounded-xl !py-3.5 !font-bold" :loading="loading" />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
:deep(.p-password i) { color: #64748b !important; right: 1rem !important; }
</style>