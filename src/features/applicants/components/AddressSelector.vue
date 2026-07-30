<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import { psgcApi } from '../api/psgc.api'
import type {
  PsgcRegion,
  PsgcProvince,
  PsgcCity,
  PsgcBarangay,
} from '../types'

const props = defineProps<{
  modelValue: {
    country: string | null
    region: string | null
    province: string | null
    city: string | null
    barangay: string | null
    street: string | null
    postal_code: string | null
    full_address: string | null
  }
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
}>()

// ─── Local state ────────────────────────────────────────
const country      = ref<string>(props.modelValue.country ?? 'Philippines')
const regionCode   = ref<string | null>(null)
const provinceCode = ref<string | null>(null)
const cityCode     = ref<string | null>(null)
const barangayCode = ref<string | null>(null)
const street       = ref<string>(props.modelValue.street ?? '')
const postalCode   = ref<string>(props.modelValue.postal_code ?? '')

// ─── Data ───────────────────────────────────────────────
const regions      = ref<PsgcRegion[]>([])
const provinces    = ref<PsgcProvince[]>([])
const cities       = ref<PsgcCity[]>([])
const barangays    = ref<PsgcBarangay[]>([])

const loadingRegions   = ref(false)
const loadingProvinces = ref(false)
const loadingCities    = ref(false)
const loadingBarangays = ref(false)

// ─── Countries ──────────────────────────────────────────
const countryOptions = [
  { label: '🇵🇭 Philippines', value: 'Philippines' },
  { label: '🇯🇵 Japan',       value: 'Japan' },
  { label: '🇺🇸 United States', value: 'United States' },
  { label: '🇸🇬 Singapore',   value: 'Singapore' },
  { label: '🇦🇪 UAE',         value: 'UAE' },
  { label: '🇸🇦 Saudi Arabia', value: 'Saudi Arabia' },
  { label: 'Other',            value: 'Other' },
]

const isPhilippines = computed(() => country.value === 'Philippines')

// ─── Computed: Names ────────────────────────────────────
const regionName   = computed(() => regions.value.find(r => r.code === regionCode.value)?.name ?? null)
const provinceName = computed(() => provinces.value.find(p => p.code === provinceCode.value)?.name ?? null)
const cityName     = computed(() => cities.value.find(c => c.code === cityCode.value)?.name ?? null)
const barangayName = computed(() => barangays.value.find(b => b.code === barangayCode.value)?.name ?? null)

// ─── Full address preview ───────────────────────────────
const fullAddress = computed(() => {
  const parts = [
    street.value,
    barangayName.value ? `Brgy. ${barangayName.value}` : null,
    cityName.value,
    provinceName.value,
    regionName.value,
    country.value,
    postalCode.value,
  ].filter(Boolean)
  return parts.join(', ')
})

// ─── Load regions on mount ──────────────────────────────
onMounted(async () => {
  if (isPhilippines.value) {
    await loadRegions()
  }
})

async function loadRegions() {
  loadingRegions.value = true
  try {
    regions.value = await psgcApi.regions()
  } catch (e) {
    console.error('Failed to load regions:', e)
  } finally {
    loadingRegions.value = false
  }
}

async function loadProvinces(region: string) {
  loadingProvinces.value = true
  provinces.value = []
  cities.value = []
  barangays.value = []
  try {
    provinces.value = await psgcApi.provinces(region)
  } catch (e) {
    console.error('Failed to load provinces:', e)
  } finally {
    loadingProvinces.value = false
  }
}

async function loadCities(province: string) {
  loadingCities.value = true
  cities.value = []
  barangays.value = []
  try {
    cities.value = await psgcApi.cities(province)
  } catch (e) {
    console.error('Failed to load cities:', e)
  } finally {
    loadingCities.value = false
  }
}

async function loadBarangays(city: string) {
  loadingBarangays.value = true
  barangays.value = []
  try {
    barangays.value = await psgcApi.barangays(city)
  } catch (e) {
    console.error('Failed to load barangays:', e)
  } finally {
    loadingBarangays.value = false
  }
}

// ─── Cascading watchers ─────────────────────────────────
watch(country, (val) => {
  if (val === 'Philippines' && regions.value.length === 0) {
    loadRegions()
  }
  // Reset all when country changes
  regionCode.value = null
  provinceCode.value = null
  cityCode.value = null
  barangayCode.value = null
})

watch(regionCode, (val) => {
  provinceCode.value = null
  cityCode.value = null
  barangayCode.value = null
  if (val) loadProvinces(val)
})

watch(provinceCode, (val) => {
  cityCode.value = null
  barangayCode.value = null
  if (val) loadCities(val)
})

watch(cityCode, (val) => {
  barangayCode.value = null
  if (val) loadBarangays(val)
})

// ─── Emit to parent whenever anything changes ───────────
watch(
  [country, regionCode, provinceCode, cityCode, barangayCode, street, postalCode, fullAddress],
  () => {
    emit('update:modelValue', {
      country:      country.value,
      region:       regionName.value,
      province:     provinceName.value,
      city:         cityName.value,
      barangay:     barangayName.value,
      street:       street.value,
      postal_code:  postalCode.value,
      full_address: fullAddress.value,
    })
  },
  { deep: true },
)
</script>

<template>
  <div class="space-y-4">
    <!-- Section header -->
    <div class="flex items-center gap-2 mb-2">
      <i class="pi pi-map-marker text-apricot-500" />
      <h3 class="text-base font-serif font-semibold text-blueberry-800">
        {{ label ?? 'Address' }}
      </h3>
    </div>

    <!-- Country -->
    <div>
      <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
        Country <span class="text-red-500">*</span>
      </label>
      <Select
        v-model="country"
        :options="countryOptions"
        option-label="label"
        option-value="value"
        placeholder="Select country..."
        filter
        class="w-full"
      />
    </div>

    <!-- Philippines cascading dropdowns -->
    <template v-if="isPhilippines">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Region -->
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Region <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="regionCode"
            :options="regions"
            option-label="name"
            option-value="code"
            placeholder="Select region..."
            filter
            :loading="loadingRegions"
            class="w-full"
          >
            <template #option="{ option }">
              <span class="text-sm">{{ option.name }}</span>
            </template>
          </Select>
        </div>

        <!-- Province -->
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Province <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="provinceCode"
            :options="provinces"
            option-label="name"
            option-value="code"
            placeholder="Select province..."
            filter
            :disabled="!regionCode || loadingProvinces"
            :loading="loadingProvinces"
            class="w-full"
          />
        </div>

        <!-- City / Municipality -->
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            City / Municipality <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="cityCode"
            :options="cities"
            option-label="name"
            option-value="code"
            placeholder="Select city..."
            filter
            :disabled="!provinceCode || loadingCities"
            :loading="loadingCities"
            class="w-full"
          />
        </div>

        <!-- Barangay -->
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Barangay
          </label>
          <Select
            v-model="barangayCode"
            :options="barangays"
            option-label="name"
            option-value="code"
            placeholder="Select barangay..."
            filter
            :disabled="!cityCode || loadingBarangays"
            :loading="loadingBarangays"
            class="w-full"
          />
        </div>
      </div>
    </template>

    <!-- Street & Postal Code -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Street / House No. / Unit
        </label>
        <InputText
          v-model="street"
          placeholder="123 Rizal Street"
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
          Postal Code
        </label>
        <InputText
          v-model="postalCode"
          placeholder="6100"
          class="w-full"
        />
      </div>
    </div>

    <!-- Full address preview -->
    <div
      v-if="fullAddress"
      class="p-3 bg-apricot-50/50 border border-apricot-100 rounded-lg"
    >
      <p class="text-xs font-semibold text-apricot-700 uppercase tracking-wider mb-1">
        Full Address Preview
      </p>
      <p class="text-sm text-blueberry-800 leading-relaxed">
        {{ fullAddress }}
      </p>
    </div>
  </div>
</template>