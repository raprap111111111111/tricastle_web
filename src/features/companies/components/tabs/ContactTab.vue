<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { contactSchema, type ContactFormValues } from '../../schemas/company.schema'

const props = defineProps<{
  initialValues?: ContactFormValues
}>()

const emit = defineEmits<{
  (e: 'next', values: ContactFormValues): void
  (e: 'back'): void
  (e: 'validate', values: ContactFormValues | null): void
}>()

const { values, errors, defineField, handleSubmit, meta, validate } = useForm({
  validationSchema: toTypedSchema(contactSchema),
  initialValues: props.initialValues ?? {
    contact_person: '',
    contact_email: '',
    contact_phone: '',
  },
})

const [contactPerson] = defineField('contact_person')
const [contactEmail] = defineField('contact_email')
const [contactPhone] = defineField('contact_phone')

watch(
  () => meta.value.valid,
  async () => {
    const result = await validate()
    if (result.valid) {
      emit('validate', values as ContactFormValues)
    } else {
      emit('validate', null)
    }
  },
)

const onSubmit = handleSubmit((formValues) => {
  emit('next', formValues as ContactFormValues)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-6">

    <div class="bg-white border border-appleCore-100 rounded-2xl p-6 shadow-soft">
      <div class="flex items-center gap-2 mb-5">
        <i class="pi pi-phone text-apricot-500" />
        <h2 class="text-lg font-serif font-semibold text-blueberry-800">Contact Information</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Contact Person -->
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">
            Contact Person
          </label>
          <InputText
            v-model="contactPerson"
            placeholder="e.g. Yamada Taro"
            class="w-full"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">
            Email
          </label>
          <InputText
            v-model="contactEmail"
            type="email"
            placeholder="hr@company.jp"
            class="w-full"
            :class="{ '!border-red-500': errors.contact_email }"
          />
          <p v-if="errors.contact_email" class="text-[10px] text-red-500 mt-1">{{ errors.contact_email }}</p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1.5 uppercase tracking-wider">
            Phone
          </label>
          <InputText
            v-model="contactPhone"
            placeholder="+81 3 1234 5678"
            class="w-full"
          />
        </div>
      </div>

      <p class="text-xs text-blueberry-500 mt-4 flex items-center gap-1.5">
        <i class="pi pi-info-circle text-blueberry-400" />
        Contact info is optional but recommended for deployment coordination
      </p>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <Button label="Back" icon="pi pi-arrow-left" severity="secondary" text @click="emit('back')" />
      <Button type="submit" label="Next" icon="pi pi-arrow-right" icon-pos="right" />
    </div>
  </form>
</template>