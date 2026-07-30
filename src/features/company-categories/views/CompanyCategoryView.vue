<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useCompanyCategoryStore } from '../stores/company-category.store'
import { useCompanyCategories } from '../composables/useCompanyCategories'

const props = defineProps<{ id: number }>()
const router = useRouter()
const store  = useCompanyCategoryStore()
const { handleToggleStatus } = useCompanyCategories()

onMounted(async () => {
  store.clearCategory()
  await store.fetchCategory(props.id)
})

const c = computed(() => store.category)

async function onToggle() {
  if (c.value) await handleToggleStatus(c.value.id)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button icon="pi pi-arrow-left" text rounded @click="router.push({ name: 'company-categories.index' })" />
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">Category Details</h1>
      </div>
      <div v-if="c" class="flex gap-2">
        <Button
          :label="c.is_active ? 'Deactivate' : 'Activate'"
          :icon="c.is_active ? 'pi pi-ban' : 'pi pi-check-circle'"
          :severity="c.is_active ? 'warn' : 'success'"
          outlined
          :loading="store.submitting"
          @click="onToggle"
        />
        <Button
          label="Edit"
          icon="pi pi-pencil"
          severity="secondary"
          outlined
          @click="router.push({ name: 'company-categories.edit', params: { id: c.id } })"
        />
      </div>
    </div>

    <Skeleton v-if="store.loading" height="300px" border-radius="16px" />

    <template v-else-if="c">
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-center gap-2 mb-3">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset"
            :class="c.is_active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-50 text-gray-600 ring-gray-200'"
          >
            <i :class="c.is_active ? 'pi pi-check-circle' : 'pi pi-ban'" class="text-[10px]" />
            {{ c.is_active ? 'Active' : 'Inactive' }}
          </span>
          <span class="font-mono text-xs text-blueberry-500 bg-appleCore-50 px-2 py-0.5 rounded">
            {{ c.slug }}
          </span>
        </div>

        <h2 class="text-2xl font-serif font-semibold text-blueberry-800">{{ c.name }}</h2>

        <p v-if="c.description" class="text-sm text-blueberry-700 mt-4 leading-relaxed whitespace-pre-line">
          {{ c.description }}
        </p>
      </section>
    </template>
  </div>
</template>