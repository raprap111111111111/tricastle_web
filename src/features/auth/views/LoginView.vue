<template>
  <div class="bg-white p-8 rounded-2xl shadow-medium border border-appleCore-100">
    <h2 class="text-2xl font-serif font-semibold text-blueberry-800 mb-1">Sign In</h2>
    <p class="text-blueberry-500 mb-6">Enter your credentials to access your account</p>

    <form class="space-y-5" @submit.prevent="onSubmit">
      <Message v-if="serverError" severity="error" :closable="false">{{ serverError }}</Message>

      <div>
        <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Email</label>
        <InputText v-model="email" type="email" class="w-full" placeholder="you@email.com" :invalid="!!errors.email" />
        <small v-if="errors.email" class="text-red-500 text-xs mt-1 block">{{ errors.email }}</small>
      </div>

      <div>
        <label class="block text-sm font-medium text-blueberry-700 mb-1.5">Password</label>
        <Password v-model="password" toggle-mask :feedback="false" input-class="w-full" class="w-full" placeholder="••••••••" :invalid="!!errors.password" />
        <small v-if="errors.password" class="text-red-500 text-xs mt-1 block">{{ errors.password }}</small>
      </div>

      <Button type="submit" label="Sign In" class="w-full !bg-apricot-500 hover:!bg-apricot-600 !border-none" :loading="isLoading" size="large" />

      <div class="text-center text-sm">
        <RouterLink to="/auth/forgot-password" class="text-blueberry-500 hover:text-apricot-500">Forgot password?</RouterLink>
      </div>
    </form>

    <p class="text-center text-sm text-blueberry-500 mt-6">
      Don't have an account?
      <RouterLink to="/auth/register" class="text-apricot-500 hover:text-apricot-600 font-medium">Create one</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password  from 'primevue/password'
import Button    from 'primevue/button'
import Message   from 'primevue/message'
import { loginSchema } from '../schemas/auth.schema'
import { useAuthStore } from '../stores/auth.store'

const router    = useRouter()
const route     = useRoute()
const toast     = useToast()
const authStore = useAuthStore()

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { email: '', password: '', deviceName: 'web' },
})

const { value: email }    = useField<string>('email')
const { value: password } = useField<string>('password')

const isLoading   = ref(false)
const serverError = ref('')

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  serverError.value = ''
  try {
    await authStore.login(values)
    toast.add({ severity: 'success', summary: 'Welcome back!', detail: `Hello ${authStore.fullName}`, life: 3000 })
    const redirectPath = (route.query.redirect as string) || '/dashboard'
    await router.push(redirectPath)
  } catch (err: any) {
    serverError.value = err?.response?.data?.message ?? authStore.error ?? 'Invalid credentials.'
  } finally {
    isLoading.value = false
  }
})
</script>