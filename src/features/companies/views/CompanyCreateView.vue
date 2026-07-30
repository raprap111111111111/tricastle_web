<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import CompanyForm from '../components/CompanyForm.vue'
import { useCompanies } from '../composables/useCompanies'
import { useCompanyStore } from '../stores/company.store'
import type { CompanyPayload } from '../types'

const router = useRouter()
const store  = useCompanyStore()
const { handleCreate } = useCompanies()

async function onSubmit(payload: CompanyPayload) {
  const created = await handleCreate(payload)
  router.push({ name: 'companies.show', params: { id: created.id } })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        text rounded
        @click="router.push({ name: 'companies.index' })"
      />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">
          New Company
        </h1>
        <p class="text-sm text-blueberry-500">
          Add a new employer or partner company
        </p>
      </div>
    </div>

    <CompanyForm
      submit-label="Create Company"
      :loading="store.submitting"
      @submit="onSubmit"
      @cancel="router.push({ name: 'companies.index' })"
    />
  </div>
</template>