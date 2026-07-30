<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { lifestyleSchema, type LifestyleFormValues } from '../../schemas/applicant.schema'
import type { ApplicantLifestyle } from '../../types'

const props = defineProps<{
  initialValues?: Partial<ApplicantLifestyle> | null
}>()

const emit = defineEmits<{
  (e: 'next', values: LifestyleFormValues): void
  (e: 'back'): void
}>()

const { handleSubmit, defineField } = useForm<LifestyleFormValues>({
  validationSchema: toTypedSchema(lifestyleSchema),
  initialValues: {
    is_smoking:           props.initialValues?.is_smoking           ?? false,
    is_drinking_alcohol:  props.initialValues?.is_drinking_alcohol  ?? false,
    is_using_drugs:       props.initialValues?.is_using_drugs       ?? false,
    was_smoking:          props.initialValues?.was_smoking          ?? false,
    was_drinking_alcohol: props.initialValues?.was_drinking_alcohol ?? false,
    was_using_drugs:      props.initialValues?.was_using_drugs      ?? false,
    smoking_frequency:    props.initialValues?.smoking_frequency    ?? '',
    drinking_frequency:   props.initialValues?.drinking_frequency   ?? '',
    drugs_notes:          props.initialValues?.drugs_notes          ?? '',
    has_medical_condition: props.initialValues?.has_medical_condition ?? false,
    medical_notes:        props.initialValues?.medical_notes        ?? '',
    has_allergies:        props.initialValues?.has_allergies        ?? false,
    allergies_notes:      props.initialValues?.allergies_notes      ?? '',
  },
})

const [is_smoking]           = defineField('is_smoking')
const [is_drinking_alcohol]  = defineField('is_drinking_alcohol')
const [is_using_drugs]       = defineField('is_using_drugs')
const [was_smoking]          = defineField('was_smoking')
const [was_drinking_alcohol] = defineField('was_drinking_alcohol')
const [was_using_drugs]      = defineField('was_using_drugs')
const [smoking_frequency]    = defineField('smoking_frequency')
const [drinking_frequency]   = defineField('drinking_frequency')
const [drugs_notes]          = defineField('drugs_notes')
const [has_medical_condition] = defineField('has_medical_condition')
const [medical_notes]        = defineField('medical_notes')
const [has_allergies]        = defineField('has_allergies')
const [allergies_notes]      = defineField('allergies_notes')

const onSubmit = handleSubmit((values) => {
  emit('next', values)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
    <!-- Current Habits -->
    <section class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">
        <i class="pi pi-shield mr-2" />Current Habits
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <Checkbox v-model="is_smoking" :binary="true" input-id="is_smoking" />
            <label for="is_smoking" class="text-sm font-medium text-gray-700">
              Currently Smoking
            </label>
          </div>
          <InputText
            v-if="is_smoking"
            v-model="smoking_frequency"
            placeholder="e.g., 5 sticks/day"
            class="ml-6"
          />
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <Checkbox v-model="is_drinking_alcohol" :binary="true" input-id="is_drinking" />
            <label for="is_drinking" class="text-sm font-medium text-gray-700">
              Currently Drinking Alcohol
            </label>
          </div>
          <InputText
            v-if="is_drinking_alcohol"
            v-model="drinking_frequency"
            placeholder="e.g., Socially, weekends"
            class="ml-6"
          />
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <Checkbox v-model="is_using_drugs" :binary="true" input-id="is_drugs" />
            <label for="is_drugs" class="text-sm font-medium text-gray-700">
              Currently Using Drugs
            </label>
          </div>
          <Textarea
            v-if="is_using_drugs"
            v-model="drugs_notes"
            rows="2"
            placeholder="Details..."
            auto-resize
            class="ml-6"
          />
        </div>
      </div>
    </section>

    <!-- Past Habits -->
    <section class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">
        <i class="pi pi-history mr-2" />Past Habits
      </h3>

      <div class="flex flex-wrap gap-6">
        <div class="flex items-center gap-2">
          <Checkbox v-model="was_smoking" :binary="true" input-id="was_smoking" />
          <label for="was_smoking" class="text-sm text-gray-700">Was Smoking</label>
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="was_drinking_alcohol" :binary="true" input-id="was_drinking" />
          <label for="was_drinking" class="text-sm text-gray-700">Was Drinking</label>
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="was_using_drugs" :binary="true" input-id="was_drugs" />
          <label for="was_drugs" class="text-sm text-gray-700">Was Using Drugs</label>
        </div>
      </div>
    </section>

    <!-- Health -->
    <section class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">
        <i class="pi pi-heart mr-2" />Health
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <Checkbox v-model="has_medical_condition" :binary="true" input-id="medical" />
            <label for="medical" class="text-sm font-medium text-gray-700">
              Has Medical Condition
            </label>
          </div>
          <Textarea
            v-if="has_medical_condition"
            v-model="medical_notes"
            rows="3"
            placeholder="Describe conditions..."
            auto-resize
            class="ml-6"
          />
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <Checkbox v-model="has_allergies" :binary="true" input-id="allergies" />
            <label for="allergies" class="text-sm font-medium text-gray-700">
              Has Allergies
            </label>
          </div>
          <Textarea
            v-if="has_allergies"
            v-model="allergies_notes"
            rows="3"
            placeholder="Describe allergies..."
            auto-resize
            class="ml-6"
          />
        </div>
      </div>
    </section>

    <!-- Nav -->
    <div class="flex justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg
               font-medium text-sm hover:bg-gray-300 transition-colors"
        @click="emit('back')"
      >
        <i class="pi pi-arrow-left text-xs" />
        Back
      </button>
      <button
        type="submit"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg
               font-medium text-sm hover:bg-indigo-700 transition-colors"
      >
        Next
        <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </form>
</template>