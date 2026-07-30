<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import CompanyForm from '../components/CompanyForm.vue'
import { useCompanies } from '../composables/useCompanies'
import { useCompanyStore } from '../stores/company.store'
import type { CompanyPayload } from '../types'

const props = defineProps<{ id: number }>()

const router = useRouter()
const store  = useCompanyStore()
const { handleUpdate } = useCompanies()

onMounted(async () => {
  store.clearCompany()
  await store.fetchCompany(props.id)
})

const company = computed(() => store.company)

async function onSubmit(payload: CompanyPayload) {
  await handleUpdate(props.id, payload)
  router.push({ name: 'companies.show', params: { id: props.id } })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
    <div class="flex items-center gap-3">
      <Button
        icon="pi pi-arrow-left"
        text rounded
        @click="router.push({ name: 'companies.show', params: { id } })"
      />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">Edit Company</h1>
        <p v-if="company" class="text-sm text-blueberry-500">{{ company.name }}</p>
      </div>
    </div>

    <Skeleton v-if="store.loading" height="500px" border-radius="16px" />

    <CompanyForm
      v-else-if="company"
      :initial="company"
      submit-label="Save Changes"
      :loading="store.submitting"
      @submit="onSubmit"
      @cancel="router.push({ name: 'companies.show', params: { id } })"
    />
  </div>
</template>