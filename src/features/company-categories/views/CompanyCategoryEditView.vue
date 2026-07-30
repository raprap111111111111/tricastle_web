<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import CompanyCategoryForm from '../components/CompanyCategoryForm.vue'
import { useCompanyCategories } from '../composables/useCompanyCategories'
import { useCompanyCategoryStore } from '../stores/company-category.store'
import type { CompanyCategoryPayload } from '../types'

const props = defineProps<{ id: number }>()
const router = useRouter()
const store  = useCompanyCategoryStore()
const { handleUpdate } = useCompanyCategories()

onMounted(async () => {
  store.clearCategory()
  await store.fetchCategory(props.id)
})

const category = computed(() => store.category)

async function onSubmit(payload: CompanyCategoryPayload) {
  await handleUpdate(props.id, payload)
  router.push({ name: 'company-categories.show', params: { id: props.id } })
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
    <div class="flex items-center gap-3">
      <Button icon="pi pi-arrow-left" text rounded @click="router.push({ name: 'company-categories.show', params: { id } })" />
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">Edit Category</h1>
        <p v-if="category" class="text-sm text-blueberry-500">{{ category.name }}</p>
      </div>
    </div>

    <Skeleton v-if="store.loading" height="400px" border-radius="16px" />

    <CompanyCategoryForm
      v-else-if="category"
      :initial="category"
      submit-label="Save Changes"
      :loading="store.submitting"
      @submit="onSubmit"
      @cancel="router.push({ name: 'company-categories.show', params: { id } })"
    />
  </div>
</template>