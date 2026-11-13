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
const country        = ref<string>(props.modelValue.country ?? 'Philippines')
const regionCode     = ref<string | null>(null)
const provinceCode   = ref<string | null>(null)
const cityCode       = ref<string | null>(null)
const barangayCode   = ref<string | null>(null)
const street         = ref<string>(props.modelValue.street ?? '')
const postalCode     = ref<string>(props.modelValue.postal_code ?? '')
const isInitializing = ref(false)

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
  { label: '🇵🇭 Philippines',   value: 'Philippines' },
  { label: '🇯🇵 Japan',         value: 'Japan' },
  { label: '🇺🇸 United States', value: 'United States' },
  { label: '🇸🇬 Singapore',     value: 'Singapore' },
  { label: '🇦🇪 UAE',           value: 'UAE' },
  { label: '🇸🇦 Saudi Arabia',  value: 'Saudi Arabia' },
  { label: 'Other',              value: 'Other' },
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

// ─── Name Normalizer & Matching Helper ─────────────────
// Handles differences like "City of Bacolod" vs "Bacolod City", "Brgy. 11" vs "Barangay 11 (Pob.)"
function normalize(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/^(city of|brgy\.?|barangay)\s+/gi, '')
    .replace(/\s+(city|pob\.?|poblacion)$/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

function matchName(apiName: string, targetName: string | null | undefined): boolean {
  if (!targetName) return false
  const a = normalize(apiName)
  const b = normalize(targetName)
  if (!a || !b) return false
  return a === b || a.includes(b) || b.includes(a)
}

// ─── Robust Address Initialization ──────────────────────
async function initAddress() {
  if (!isPhilippines.value) return

  isInitializing.value = true

  try {
    await loadRegions()

    // Sync primitive fields in case they changed
    street.value = props.modelValue.street ?? ''
    postalCode.value = props.modelValue.postal_code ?? ''

    const hasSavedData = Boolean(
      props.modelValue.province ||
      props.modelValue.city ||
      props.modelValue.barangay ||
      props.modelValue.region ||
      props.modelValue.full_address
    )

    if (hasSavedData) {
      // 🎯 RESTORE PREVIOUSLY SELECTED ADDRESS
      
      // 1. Restore Region (or default to Western Visayas if region wasn't saved)
      let targetRegion = regions.value.find(r => matchName(r.name, props.modelValue.region))
      if (!targetRegion) {
        targetRegion = regions.value.find(r => matchName(r.name, 'Western Visayas'))
      }

      if (targetRegion) {
        regionCode.value = targetRegion.code
        await loadProvinces(targetRegion.code)

        // 2. Restore Province
        const targetProv = provinces.value.find(p => matchName(p.name, props.modelValue.province))
        if (targetProv) {
          provinceCode.value = targetProv.code
          await loadCities(targetProv.code)

          // 3. Restore City
          const targetCity = cities.value.find(c => matchName(c.name, props.modelValue.city))
          if (targetCity) {
            cityCode.value = targetCity.code
            await loadBarangays(targetCity.code)

            // 4. Restore Barangay
            const targetBrgy = barangays.value.find(b => matchName(b.name, props.modelValue.barangay))
            if (targetBrgy) {
              barangayCode.value = targetBrgy.code
            }
          }
        }
      }
    } else {
      // 🎯 BRAND NEW ADDRESS DEFAULT (Western Visayas + Negros Occidental)
      const westernVisayas = regions.value.find(r => matchName(r.name, 'Western Visayas'))
      if (westernVisayas) {
        regionCode.value = westernVisayas.code
        await loadProvinces(westernVisayas.code)

        const negrosOccidental = provinces.value.find(p => matchName(p.name, 'Negros Occidental'))
        if (negrosOccidental) {
          provinceCode.value = negrosOccidental.code
          await loadCities(negrosOccidental.code)
        }
      }
    }
  } catch (e) {
    console.error('Failed to initialize address options:', e)
  } finally {
    isInitializing.value = false
  }
}

onMounted(initAddress)

// ─── API Loaders ────────────────────────────────────────
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

// ─── Cascading watchers (User Manual Selection) ─────────
watch(country, (val) => {
  if (isInitializing.value) return
  if (val === 'Philippines' && regions.value.length === 0) {
    loadRegions()
  }
  regionCode.value = null
  provinceCode.value = null
  cityCode.value = null
  barangayCode.value = null
})

watch(regionCode, (val) => {
  if (isInitializing.value) return
  provinceCode.value = null
  cityCode.value = null
  barangayCode.value = null
  if (val) loadProvinces(val)
})

watch(provinceCode, (val) => {
  if (isInitializing.value) return
  cityCode.value = null
  barangayCode.value = null
  if (val) loadCities(val)
})

watch(cityCode, (val) => {
  if (isInitializing.value) return
  barangayCode.value = null
  if (val) loadBarangays(val)
})

// ─── Emit to parent whenever anything changes ───────────
watch(
  [country, regionCode, provinceCode, cityCode, barangayCode, street, postalCode, fullAddress],
  () => {
    if (isInitializing.value) return // Prevent emitting incomplete address during init load
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