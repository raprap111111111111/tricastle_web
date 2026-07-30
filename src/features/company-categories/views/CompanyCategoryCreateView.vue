<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import CompanyCategoryForm from '../components/CompanyCategoryForm.vue'
import { useCompanyCategories } from '../composables/useCompanyCategories'
import { useCompanyCategoryStore } from '../stores/company-category.store'
import type { CompanyCategoryPayload } from '../types'

const router = useRouter()
const store  = useCompanyCategoryStore()
const { handleCreate } = useCompanyCategories()

async function onSubmit(payload: CompanyCategoryPayload) {
  const created = await handleCreate(payload)
  router.push({ name: 'company-categories.show', params: { id: created.id } })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
    <div class="flex items-center gap-3">
      <Button icon="pi pi-arrow-left" text rounded @click="router.push({ name: 'company-categories.index' })" />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">New Category</h1>
        <p class="text-sm text-blueberry-500">Add a new company category</p>
      </div>
    </div>

    <CompanyCategoryForm
      submit-label="Create Category"
      :loading="store.submitting"
      @submit="onSubmit"
      @cancel="router.push({ name: 'company-categories.index' })"
    />
  </div>
</template>