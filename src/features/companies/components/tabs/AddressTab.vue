<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

import { addressSchema, type AddressFormValues } from '../../schemas/company.schema'
import { useGeo } from '@shared/composables/useGeo'
import type { CountryData, StateData } from '@shared/api/geo.api'

const props = defineProps<{
  initialValues?: AddressFormValues
}>()

const emit = defineEmits<{
  next:     [values: AddressFormValues]
  back:     []
  validate: [values: AddressFormValues | null]
}>()

// ─── Form ────────────────────────────────────────────
const { defineField, handleSubmit, values, errors, meta, setValues } =
  useForm<AddressFormValues>({
    validationSchema: toTypedSchema(addressSchema),
    validateOnMount: false,
    initialValues:
      props.initialValues ?? {
        country:     'Japan',
        address:     '',
        city:        '',
        prefecture:  '',
        postal_code: '',
      },
  })

const [country]       = defineField('country')
const [streetAddress] = defineField('address')
const [city]          = defineField('city')
const [prefecture]    = defineField('prefecture')
const [postalCode]    = defineField('postal_code')

// ─── Dynamic geo data ───────────────────────────────
const {
  fetchCountries,
  fetchStates,
  fetchCities,
  loadingCountries,
  loadingStates,
  loadingCities,
} = useGeo()

const countriesList = ref<CountryData[]>([])
const statesList    = ref<StateData[]>([])
const citiesList    = ref<string[]>([])

// ─── Country options with flag emoji ────────────────
const countryOptions = computed(() =>
  countriesList.value.map((c) => ({
    label: `${c.flag} ${c.name}`,
    value: c.name,
  })),
)

// ─── Cascade: country change ────────────────────────
watch(country, async (newCountry, oldCountry) => {
  if (newCountry === oldCountry) return

  prefecture.value = ''
  city.value       = ''
  postalCode.value = ''
  statesList.value = []
  citiesList.value = []

  if (!newCountry) return
  statesList.value = await fetchStates(newCountry)
})

// ─── Cascade: state change ──────────────────────────
watch(prefecture, async (newState, oldState) => {
  if (newState === oldState) return

  city.value       = ''
  citiesList.value = []

  if (!newState || !country.value) return
  citiesList.value = await fetchCities(country.value, newState)
})

// ─── Full-address preview ────────────────────────────
const fullAddress = computed(() => {
  const parts: string[] = []
  if (streetAddress.value) parts.push(streetAddress.value)
  if (city.value)          parts.push(city.value)
  if (prefecture.value)    parts.push(prefecture.value)
  if (postalCode.value)    parts.push(postalCode.value)
  if (country.value)       parts.push(country.value)
  return parts.filter(Boolean).join(', ')
})

// ─── Live validation ─────────────────────────────────
watch(
  [values, meta],
  () => {
    if (!meta.value.touched) return
    if (meta.value.valid) emit('validate', values as AddressFormValues)
    else emit('validate', null)
  },
  { deep: true },
)

// ─── Submit ──────────────────────────────────────────
const onSubmit = handleSubmit((v) => emit('next', v))

// ─── Init ────────────────────────────────────────────
onMounted(async () => {
  if (props.initialValues) setValues(props.initialValues)

  // 1) Load countries first
  countriesList.value = await fetchCountries()

  // 2) Rehydrate cascade if editing
  if (country.value) {
    statesList.value = await fetchStates(country.value)
    if (prefecture.value) {
      citiesList.value = await fetchCities(country.value, prefecture.value)
    }
  }
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">

    <div class="bg-white rounded-xl border border-blueberry-100 p-6 shadow-sm">

      <div class="flex items-center gap-2 mb-5">
        <i class="pi pi-map-marker text-carrot-500" />
        <h3 class="text-lg font-serif font-semibold text-blueberry-800">
          Address
        </h3>
      </div>

      <!-- ─── Country ────────────────────────────────── -->
      <div class="mb-4">
        <label class="text-xs font-semibold text-blueberry-600 uppercase tracking-wide mb-1.5 block">
          Country <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="country"
          :options="countryOptions"
          option-label="label"
          option-value="value"
          :placeholder="loadingCountries ? 'Loading countries…' : 'Select country…'"
          :loading="loadingCountries"
          class="w-full"
          filter
          :invalid="!!errors.country && meta.touched"
        />
        <small v-if="errors.country && meta.touched" class="text-red-500 text-xs">
          {{ errors.country }}
        </small>
      </div>

      <!-- ─── State/Prefecture + City ────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        <!-- State / Prefecture / Province -->
        <div>
          <label class="text-xs font-semibold text-blueberry-600 uppercase tracking-wide mb-1.5 block">
            State / Prefecture / Province
          </label>
          <Select
            v-model="prefecture"
            :options="statesList"
            option-label="name"
            option-value="name"
            :placeholder="
              !country
                ? 'Select country first'
                : loadingStates
                ? 'Loading…'
                : statesList.length
                ? 'Select state / prefecture…'
                : 'No states available'
            "
            :loading="loadingStates"
            :disabled="!country || loadingStates || !statesList.length"
            class="w-full"
            filter
            show-clear
          />
        </div>

        <!-- City -->
        <div>
          <label class="text-xs font-semibold text-blueberry-600 uppercase tracking-wide mb-1.5 block">
            City <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="city"
            :options="citiesList"
            :placeholder="
              !prefecture
                ? 'Select state first'
                : loadingCities
                ? 'Loading cities…'
                : citiesList.length
                ? 'Select city…'
                : 'Type city name'
            "
            :loading="loadingCities"
            :disabled="!prefecture || loadingCities"
            class="w-full"
            filter
            editable
            :invalid="!!errors.city && meta.touched"
          />
          <small v-if="errors.city && meta.touched" class="text-red-500 text-xs">
            {{ errors.city }}
          </small>
        </div>
      </div>

      <!-- ─── Street + Postal ────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4">
        <div>
          <label class="text-xs font-semibold text-blueberry-600 uppercase tracking-wide mb-1.5 block">
            Street Address <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="streetAddress"
            placeholder="Street, building, block, floor…"
            class="w-full"
            :invalid="!!errors.address && meta.touched"
          />
          <small v-if="errors.address && meta.touched" class="text-red-500 text-xs">
            {{ errors.address }}
          </small>
        </div>

        <div>
          <label class="text-xs font-semibold text-blueberry-600 uppercase tracking-wide mb-1.5 block">
            Postal Code
          </label>
          <InputText
            v-model="postalCode"
            placeholder="Postal / ZIP code"
            class="w-full"
          />
        </div>
      </div>

      <!-- ─── Full Address Preview ───────────────────── -->
      <div
        v-if="fullAddress"
        class="mt-5 p-3 bg-blueberry-50 border border-blueberry-100 rounded-lg"
      >
        <div class="text-[10px] font-semibold text-blueberry-500 uppercase tracking-wide mb-1">
          Full Address Preview
        </div>
        <div class="text-sm text-blueberry-800">{{ fullAddress }}</div>
      </div>
    </div>

    <!-- Nav Buttons -->
    <div class="flex items-center justify-between">
      <Button
        type="button"
        label="Back"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="emit('back')"
      />
      <Button
        type="submit"
        label="Next"
        icon="pi pi-arrow-right"
        icon-pos="right"
        :disabled="!meta.valid"
      />
    </div>
  </form>
</template>