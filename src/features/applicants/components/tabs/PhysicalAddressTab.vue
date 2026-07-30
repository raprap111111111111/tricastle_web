<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import AddressSelector from '../AddressSelector.vue'
import type { PhysicalAddressFormValues } from '../../schemas/applicant.schema'
import { physicalAddressSchema } from '../../schemas/applicant.schema'

const props = defineProps<{
  initialValues?: Partial<PhysicalAddressFormValues>
}>()

const emit = defineEmits<{
  (e: 'next', values: PhysicalAddressFormValues): void
  (e: 'back'): void
  (e: 'validate', values: PhysicalAddressFormValues | null): void
}>()

const { handleSubmit, defineField, errors, values, validate, setFieldValue } =
  useForm<PhysicalAddressFormValues>({
    validationSchema: toTypedSchema(physicalAddressSchema),
    initialValues: {
      height_cm:         props.initialValues?.height_cm         ?? null,
      weight_kg:         props.initialValues?.weight_kg         ?? null,
      dominant_hand:     props.initialValues?.dominant_hand     ?? null,
      blood_type:        props.initialValues?.blood_type        ?? null,
      current_address:   props.initialValues?.current_address   ?? '',
      permanent_address: props.initialValues?.permanent_address ?? '',
      city:              props.initialValues?.city              ?? '',
      province:          props.initialValues?.province          ?? '',
      postal_code:       props.initialValues?.postal_code       ?? '',
    },
  })

const [height_cm]     = defineField('height_cm')
const [weight_kg]     = defineField('weight_kg')
const [dominant_hand] = defineField('dominant_hand')
const [blood_type]    = defineField('blood_type')

// ─── Address states ─────────────────────────────────────
const currentAddress = ref({
  country: 'Philippines',
  region: null as string | null,
  province: null as string | null,
  city: null as string | null,
  barangay: null as string | null,
  street: '',
  postal_code: '',
  full_address: '',
})

const permanentAddress = ref({ ...currentAddress.value })
const sameAsCurrent    = ref(false)

// ─── Sync address to form fields ────────────────────────
watch(currentAddress, (val) => {
  setFieldValue('current_address', val.full_address)
  setFieldValue('city',            val.city ?? '')
  setFieldValue('province',        val.province ?? '')
  setFieldValue('postal_code',     val.postal_code ?? '')

  if (sameAsCurrent.value) {
    permanentAddress.value = { ...val }
  }
}, { deep: true })

watch(permanentAddress, (val) => {
  setFieldValue('permanent_address', val.full_address)
}, { deep: true })

watch(sameAsCurrent, (isSame) => {
  if (isSame) {
    permanentAddress.value = { ...currentAddress.value }
  }
})

// ─── Options ────────────────────────────────────────────
const handOptions = [
  { label: 'Left',  value: 'left'  },
  { label: 'Right', value: 'right' },
  { label: 'Both',  value: 'both'  },
]

const bloodOptions = [
  { label: 'A',  value: 'A'  },
  { label: 'B',  value: 'B'  },
  { label: 'AB', value: 'AB' },
  { label: 'O',  value: 'O'  },
]

// ─── Validation emit ────────────────────────────────────
watch(values, async () => {
  const result = await validate()
  emit('validate', result.valid ? { ...values } as PhysicalAddressFormValues : null)
}, { deep: true })

const onSubmit = handleSubmit((formValues) => {
  emit('next', formValues)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
    <!-- ─── Physical Info ────────────────────────────── -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4">
        <i class="pi pi-heart mr-2 text-apricot-500" />Physical Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Height (cm)</label>
          <InputNumber v-model="height_cm" :min="50" :max="250" placeholder="170" />
          <small class="text-red-500">{{ errors.height_cm }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Weight (kg)</label>
          <InputNumber v-model="weight_kg" :min="20" :max="300" placeholder="65" />
          <small class="text-red-500">{{ errors.weight_kg }}</small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Dominant Hand</label>
          <Select
            v-model="dominant_hand"
            :options="handOptions"
            option-label="label"
            option-value="value"
            placeholder="Select"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Blood Type</label>
          <Select
            v-model="blood_type"
            :options="bloodOptions"
            option-label="label"
            option-value="value"
            placeholder="Select"
          />
        </div>
      </div>
    </section>

    <!-- ─── Current Address ──────────────────────────── -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <AddressSelector
        v-model="currentAddress"
        label="Current Address"
      />
    </section>

    <!-- ─── Same as Current toggle ───────────────────── -->
    <label class="flex items-center gap-2 px-6 cursor-pointer">
      <input
        v-model="sameAsCurrent"
        type="checkbox"
        class="w-4 h-4 accent-apricot-500"
      />
      <span class="text-sm text-blueberry-700">
        Permanent address is the same as current address
      </span>
    </label>

    <!-- ─── Permanent Address ────────────────────────── -->
    <section
      v-if="!sameAsCurrent"
      class="bg-white rounded-xl border border-appleCore-100 p-6"
    >
      <AddressSelector
        v-model="permanentAddress"
        label="Permanent Address"
      />
    </section>

    <!-- ─── Actions ──────────────────────────────────── -->
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
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-apricot-500 text-white rounded-lg
               font-medium text-sm hover:bg-apricot-600 transition-colors"
      >
        Next
        <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </form>
</template>