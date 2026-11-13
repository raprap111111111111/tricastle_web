<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ref, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import AddressSelector from '../AddressSelector.vue'
import type { PhysicalAddressFormValues } from '../../schemas/applicant.schema'
import { physicalAddressSchema } from '../../schemas/applicant.schema'

const props = defineProps<{
  initialValues?: Partial<PhysicalAddressFormValues> & {
    currentAddress?: any
    permanentAddress?: any
    sameAsCurrent?: boolean
  }
}>()

const emit = defineEmits<{
  (e: 'next', values: PhysicalAddressFormValues): void
  (e: 'back'): void
  (e: 'validate', values: PhysicalAddressFormValues | null): void
}>()

// ─── Initialize Address States from props.initialValues ───
const currentAddress = ref({
  country: props.initialValues?.currentAddress?.country ?? 'Philippines',
  region: props.initialValues?.currentAddress?.region ?? null,
  province: props.initialValues?.currentAddress?.province ?? props.initialValues?.province ?? null,
  city: props.initialValues?.currentAddress?.city ?? props.initialValues?.city ?? null,
  barangay: props.initialValues?.currentAddress?.barangay ?? null,
  street: props.initialValues?.currentAddress?.street ?? '',
  postal_code: props.initialValues?.currentAddress?.postal_code ?? props.initialValues?.postal_code ?? '',
  full_address: props.initialValues?.currentAddress?.full_address ?? props.initialValues?.current_address ?? '',
})

const sameAsCurrent = ref(props.initialValues?.sameAsCurrent ?? false)

const permanentAddress = ref({
  country: props.initialValues?.permanentAddress?.country ?? 'Philippines',
  region: props.initialValues?.permanentAddress?.region ?? null,
  province: props.initialValues?.permanentAddress?.province ?? null,
  city: props.initialValues?.permanentAddress?.city ?? null,
  barangay: props.initialValues?.permanentAddress?.barangay ?? null,
  street: props.initialValues?.permanentAddress?.street ?? '',
  postal_code: props.initialValues?.permanentAddress?.postal_code ?? '',
  full_address: props.initialValues?.permanentAddress?.full_address ?? props.initialValues?.permanent_address ?? '',
})

// ─── VeeValidate Setup ──────────────────────────────────
const { handleSubmit, defineField, errors, values, validate, setFieldValue } =
  useForm<PhysicalAddressFormValues>({
    validationSchema: toTypedSchema(physicalAddressSchema),
    initialValues: {
      height_cm: props.initialValues?.height_cm ?? null,
      weight_kg: props.initialValues?.weight_kg ?? null,
      dominant_hand: props.initialValues?.dominant_hand ?? null,
      blood_type: props.initialValues?.blood_type ?? null,
      current_address: currentAddress.value.full_address || (props.initialValues?.current_address ?? ''),
      permanent_address: permanentAddress.value.full_address || (props.initialValues?.permanent_address ?? ''),
      city: currentAddress.value.city || (props.initialValues?.city ?? ''),
      province: currentAddress.value.province || (props.initialValues?.province ?? ''),
      postal_code: currentAddress.value.postal_code || (props.initialValues?.postal_code ?? ''),
    },
  })

const [height_cm] = defineField('height_cm')
const [weight_kg] = defineField('weight_kg')
const [dominant_hand] = defineField('dominant_hand')
const [blood_type] = defineField('blood_type')

// ─── Sync address to form fields ────────────────────────
watch(
  currentAddress,
  (val) => {
    if (val.full_address) setFieldValue('current_address', val.full_address)
    if (val.city) setFieldValue('city', val.city)
    if (val.province) setFieldValue('province', val.province)
    if (val.postal_code) setFieldValue('postal_code', val.postal_code)

    if (sameAsCurrent.value) {
      permanentAddress.value = { ...val }
    }
  },
  { deep: true }
)

watch(
  permanentAddress,
  (val) => {
    if (val.full_address) setFieldValue('permanent_address', val.full_address)
  },
  { deep: true }
)

watch(sameAsCurrent, (isSame) => {
  if (isSame) {
    permanentAddress.value = { ...currentAddress.value }
    setFieldValue('permanent_address', currentAddress.value.full_address)
  }
})

// ─── Options ────────────────────────────────────────────
const handOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Both', value: 'both' },
]

const bloodTypeOptions = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
]

// Helper to construct full payload to preserve address state
const getFullFormPayload = (formValues: PhysicalAddressFormValues) => {
  return {
    ...formValues,
    current_address: currentAddress.value.full_address || formValues.current_address,
    permanent_address: sameAsCurrent.value
      ? (currentAddress.value.full_address || formValues.current_address)
      : (permanentAddress.value.full_address || formValues.permanent_address),
    city: currentAddress.value.city || formValues.city,
    province: currentAddress.value.province || formValues.province,
    postal_code: currentAddress.value.postal_code || formValues.postal_code,
    // Preserve full objects for AddressSelector when coming back
    currentAddress: currentAddress.value,
    permanentAddress: permanentAddress.value,
    sameAsCurrent: sameAsCurrent.value,
  }
}

// ─── Validation emit ────────────────────────────────────
watch(
  [values, currentAddress, permanentAddress, sameAsCurrent],
  async () => {
    const result = await validate()
    emit(
      'validate',
      result.valid ? (getFullFormPayload(values as PhysicalAddressFormValues) as any) : null
    )
  },
  { deep: true }
)

const onSubmit = handleSubmit((formValues) => {
  emit('next', getFullFormPayload(formValues) as any)
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
          <Select v-model="dominant_hand" :options="handOptions" option-label="label" option-value="value"
            placeholder="Select" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-blueberry-700">Blood Type</label>
          <Select v-model="blood_type" :options="bloodTypeOptions" option-label="label" option-value="value"
            placeholder="Select" />
        </div>
      </div>
    </section>

    <!-- ─── Current Address ──────────────────────────── -->
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <AddressSelector v-model="currentAddress" label="Current Address" />
    </section>

    <!-- ─── Same as Current toggle ───────────────────── -->
    <label class="flex items-center gap-2 px-6 cursor-pointer">
      <input v-model="sameAsCurrent" type="checkbox" class="w-4 h-4 accent-apricot-500" />
      <span class="text-sm text-blueberry-700">
        Permanent address is the same as current address
      </span>
    </label>

    <!-- ─── Permanent Address ────────────────────────── -->
    <section v-if="!sameAsCurrent" class="bg-white rounded-xl border border-appleCore-100 p-6">
      <AddressSelector v-model="permanentAddress" label="Permanent Address" />
    </section>

    <!-- ─── Actions ──────────────────────────────────── -->
    <div class="flex justify-between">
      <button type="button" class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg
               font-medium text-sm hover:bg-gray-300 transition-colors" @click="emit('back')">
        <i class="pi pi-arrow-left text-xs" />
        Back
      </button>
      <button type="submit" class="inline-flex items-center gap-2 px-6 py-2.5 bg-apricot-500 text-white rounded-lg
               font-medium text-sm hover:bg-apricot-600 transition-colors">
        Next
        <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </form>
</template>