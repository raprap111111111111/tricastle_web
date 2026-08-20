<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { basicInfoSchema, type BasicInfoFormValues } from '../../schemas/company.schema'
import { useCompanyCategoryStore } from '@features/company-categories/stores/company-category.store'

const props = defineProps<{
  initialValues?: BasicInfoFormValues
}>()

const emit = defineEmits<{
  (e: 'next', values: BasicInfoFormValues): void
  (e: 'validate', values: BasicInfoFormValues | null): void
}>()

// 🏷️ Category store
const categoryStore = useCompanyCategoryStore()

onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    categoryStore.setFilters({ limit: 1000, is_active: true as any } as any)
    await categoryStore.fetchCategories()
  }
})

const categoryOptions = computed(() =>
  categoryStore.categories
    .filter((c) => c.is_active)
    .map((c) => ({ label: c.name, value: c.id })),
)

// Form
const { values, errors, defineField, handleSubmit, meta, validate } = useForm({
  validationSchema: toTypedSchema(basicInfoSchema),
  initialValues: props.initialValues ?? {
    code: '',
    name: '',
    name_japanese: '',
    category_id: undefined as any,
    is_active: true,
  },
})

const [code] = defineField('code')
const [name] = defineField('name')
const [nameJapanese] = defineField('name_japanese')
const [categoryId] = defineField('category_id')
const [isActive] = defineField('is_active')

// Auto-validate for parent step tracking
watch(
  () => meta.value.valid,
  async () => {
    const result = await validate()
    if (result.valid) {
      emit('validate', values as BasicInfoFormValues)
    } else {
      emit('validate', null)
    }
  },
)

const onSubmit = handleSubmit((formValues) => {
  emit('next', formValues as BasicInfoFormValues)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-6">

    <!-- Card container -->
    <div class="bg-white border border-appleCore-100 rounded-2xl p-6 shadow-soft">
      <div class="flex items-center gap-2 mb-5">
        <i class="pi pi-building text-apricot-500" />
        <h2 class="text-lg font-serif font-semibold text-blueberry-800">Basic Information</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Company Code -->
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">
            Company Code <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="code"
            placeholder="e.g. ABC-001"
            class="w-full"
            :class="{ '!border-red-500': errors.code }"
          />
          <p v-if="errors.code" class="text-[10px] text-red-500 mt-1">{{ errors.code }}</p>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">
            Category <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="categoryId"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            :placeholder="categoryStore.loading ? 'Loading categories...' : 'Select category...'"
            class="w-full"
            :loading="categoryStore.loading"
            filter
            :class="{ '!border-red-500': errors.category_id }"
          />
          <p v-if="errors.category_id" class="text-[10px] text-red-500 mt-1">{{ errors.category_id }}</p>
        </div>

        <!-- Company Name -->
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">
            Company Name <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="name"
            placeholder="e.g. ABC Manning Corp"
            class="w-full"
            :class="{ '!border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="text-[10px] text-red-500 mt-1">{{ errors.name }}</p>
        </div>

        <!-- Japanese Name -->
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">
            Japanese Name
          </label>
          <InputText
            v-model="nameJapanese"
            placeholder="e.g. トヨタ自動車"
            class="w-full"
          />
        </div>

        <!-- Status -->
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">Status</label>
          <div class="flex items-center gap-3 p-3 bg-appleCore-50 rounded-lg">
            <ToggleSwitch v-model="isActive" />
            <div>
              <p class="text-sm font-medium text-blueberry-800">
                {{ isActive ? '✅ Active' : '⏸️ Inactive' }}
              </p>
              <p class="text-xs text-blueberry-500">
                {{ isActive ? 'This company can receive deployments' : 'Hidden from dropdowns and lists' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end">
      <Button type="submit" label="Next" icon="pi pi-arrow-right" icon-pos="right" />
    </div>
  </form>
</template>