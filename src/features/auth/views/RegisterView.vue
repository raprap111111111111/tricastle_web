<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { authApi } from '../api/auth.api'
import type { RegisterInput } from '../schemas/auth.schema'

const router = useRouter()
const toast = useToast()

const form = ref({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    phone: '',
    mobile: '',
})

const loading = ref(false)

async function onSubmit() {
    loading.value = true
    try {
        const payload: RegisterInput = {
            firstName: form.value.firstName,
            middleName: form.value.middleName || undefined,
            lastName: form.value.lastName,
            email: form.value.email,
            password: form.value.password,
            passwordConfirmation: form.value.passwordConfirmation,
            phone: form.value.phone || undefined,
            mobile: form.value.mobile, // required string — do NOT use || undefined
            role: 'staff',
        }

        await authApi.register(payload)

        toast.add({
            severity: 'success',
            summary: 'Registered',
            detail: 'Account created successfully',
            life: 3000,
        })

        router.push({ name: 'login' })
    } catch (e: any) {
        const msg =
            e?.response?.data?.message ||
            e?.response?.data?.errors?.email?.[0] ||
            'Please try again'

        toast.add({
            severity: 'error',
            summary: 'Registration failed',
            detail: msg,
            life: 4000,
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <form class="w-full max-w-md space-y-4" @submit.prevent="onSubmit">
            <h1 class="text-2xl font-bold">Create account</h1>

            <div class="grid grid-cols-2 gap-3">
                <InputText v-model="form.firstName" placeholder="First name" required class="w-full" />
                <InputText v-model="form.lastName" placeholder="Last name" required class="w-full" />
            </div>

            <InputText v-model="form.middleName" placeholder="Middle name (optional)" class="w-full" />

            <InputText v-model="form.email" type="email" placeholder="Email" required class="w-full" />

            <InputText v-model="form.phone" placeholder="Phone (optional)" class="w-full" />

            <InputText v-model="form.mobile" placeholder="Mobile (optional)" class="w-full" />

            <Password v-model="form.password" placeholder="Password" :feedback="false" toggle-mask class="w-full"
                input-class="w-full" />

            <Password v-model="form.passwordConfirmation" placeholder="Confirm password" :feedback="false" toggle-mask
                class="w-full" input-class="w-full" />

            <Button type="submit" label="Register" class="w-full" :loading="loading" />
        </form>
    </div>
</template>