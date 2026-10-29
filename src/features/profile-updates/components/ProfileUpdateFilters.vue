<!-- src/features/profile-updates/components/ProfileUpdateFilters.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import { AppSearchBar } from '@shared/ui'
import { usePsgc } from '@shared/composables/usePsgc'

export type ProfileUpdateFilterPayload = {
  search?: string
  province?: string
  city?: string
  address?: string
}

const emit = defineEmits<{
  (e: 'filter', value: ProfileUpdateFilterPayload): void
  (e: 'reset'): void
}>()

// ─── PSGC (Philippine geographic data) ────────────────
const {
  provinces: psgcProvinces,
  fetchAllProvinces,
  fetchCitiesByProvince,
  loadingProvinces,
  loadingCities,
} = usePsgc()

const psgcCities = ref<any[]>([])

// ─── Main filters ─────────────────────────────────────
const search = ref('')

// ─── Advanced (staged) ────────────────────────────────
const province = ref<string>('')
const city = ref<string>('')
const address = ref<string>('')

const appliedAdvanced = ref<ProfileUpdateFilterPayload>({})
const showAdvanced = ref(false)

// ─── Options ──────────────────────────────────────────
const provinceOptions = computed(() => [
  { label: 'All Provinces', value: '' },
  ...psgcProvinces.value.map((p) => ({
    label: p.name,
    value: p.name,
  })),
])

const cityOptions = computed(() => [
  {
    label: province.value ? 'All Cities' : 'Select province first',
    value: '',
    isCity: false,
    isMunicipality: false,
  },
  ...psgcCities.value.map((c) => ({
    label: c.name,
    value: c.name,
    isCity: c.isCity,
    isMunicipality: c.isMunicipality,
  })),
])

// ─── Watch province → load cities ─────────────────────
watch(province, async (newProvince) => {
  if (!newProvince) {
    psgcCities.value = []
    city.value = ''
    return
  }

  const provinceObj = psgcProvinces.value.find((p) => p.name === newProvince)
  if (provinceObj) {
    psgcCities.value = await fetchCitiesByProvince(provinceObj.code)
    city.value = ''
  }
})

// ─── Handlers ─────────────────────────────────────────
function buildPayload(extra: ProfileUpdateFilterPayload = {}): ProfileUpdateFilterPayload {
  return {
    ...appliedAdvanced.value,
    search: search.value.trim() || undefined,
    ...extra,
  }
}

function onSearch(value: string) {
  search.value = value
  emit('filter', buildPayload({ search: value.trim() || undefined }))
}

function applyAdvanced() {
  const advanced: ProfileUpdateFilterPayload = {
    province: province.value || undefined,
    city: city.value.trim() || undefined,
    address: address.value.trim() || undefined,
  }

  Object.keys(advanced).forEach((k) => {
    if (advanced[k as keyof ProfileUpdateFilterPayload] === undefined) {
      delete advanced[k as keyof ProfileUpdateFilterPayload]
    }
  })

  appliedAdvanced.value = advanced

  emit('filter', buildPayload(advanced))
  showAdvanced.value = false
}

function clearAdvanced() {
  province.value = ''
  city.value = ''
  address.value = ''
  psgcCities.value = []
  appliedAdvanced.value = {}

  emit('filter', {
    search: search.value.trim() || undefined,
  })
}

function resetAll() {
  search.value = ''
  province.value = ''
  city.value = ''
  address.value = ''
  psgcCities.value = []
  appliedAdvanced.value = {}
  emit('reset')
}

// ─── Counts ───────────────────────────────────────────
const stagedAdvancedCount = computed(() => {
  let count = 0
  if (province.value) count++
  if (city.value.trim()) count++
  if (address.value.trim()) count++
  return count
})

const appliedAdvancedCount = computed(() => Object.keys(appliedAdvanced.value).length)

const hasUnsavedChanges = computed(() => {
  const current = JSON.stringify({
    province: province.value || undefined,
    city: city.value.trim() || undefined,
    address: address.value.trim() || undefined,
  })
  const applied = JSON.stringify({
    province: appliedAdvanced.value.province || undefined,
    city: appliedAdvanced.value.city || undefined,
    address: appliedAdvanced.value.address || undefined,
  })
  return current !== applied
})

// ─── Active chips ─────────────────────────────────────
const activeFilters = computed(() => {
  const filters: { key: string; label: string; value: string }[] = []

  if (search.value.trim()) {
    filters.push({ key: 'search', label: 'Search', value: search.value })
  }
  if (appliedAdvanced.value.province) {
    filters.push({ key: 'province', label: 'Province', value: appliedAdvanced.value.province })
  }
  if (appliedAdvanced.value.city) {
    filters.push({ key: 'city', label: 'City', value: appliedAdvanced.value.city })
  }
  if (appliedAdvanced.value.address) {
    filters.push({ key: 'address', label: 'Address', value: appliedAdvanced.value.address })
  }

  return filters
})

const hasActiveFilters = computed(() => activeFilters.value.length > 0)

function removeFilter(key: string) {
  switch (key) {
    case 'search':
      search.value = ''
      onSearch('')
      break
    case 'province':
      province.value = ''
      psgcCities.value = []
      city.value = ''
      delete appliedAdvanced.value.province
      delete appliedAdvanced.value.city
      emit('filter', buildPayload())
      break
    case 'city':
      city.value = ''
      delete appliedAdvanced.value.city
      emit('filter', buildPayload())
      break
    case 'address':
      address.value = ''
      delete appliedAdvanced.value.address
      emit('filter', buildPayload())
      break
  }
}

// ─── Lifecycle ────────────────────────────────────────
onMounted(async () => {
  await fetchAllProvinces()
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Main Row -->
    <div class="flex flex-wrap items-center gap-3">
      <AppSearchBar
        v-model="search"
        placeholder="Search name, code, or mobile..."
        button-label=""
        class="flex-1 min-w-[280px]"
        @search="onSearch"
      />

      <Button severity="secondary" outlined @click="showAdvanced = true">
        <template #default>
          <i class="pi pi-sliders-h mr-2" />
          <span>Advanced</span>
          <span
            v-if="appliedAdvancedCount > 0"
            class="ml-2 px-1.5 py-0.5 rounded-full bg-apricot-500 text-white text-[10px] font-bold min-w-[20px] text-center"
          >
            {{ appliedAdvancedCount }}
          </span>
        </template>
      </Button>

      <Button
        v-if="hasActiveFilters"
        icon="pi pi-refresh"
        severity="secondary"
        text
        rounded
        v-tooltip.top="'Reset all filters'"
        @click="resetAll"
      />
    </div>

    <!-- Active Chips -->
    <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2">
      <span class="text-xs text-blueberry-500 font-medium">Active:</span>

      <span
        v-for="f in activeFilters"
        :key="f.key"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-apricot-50 text-apricot-700
               rounded-full text-xs font-medium ring-1 ring-apricot-200"
      >
        <span class="font-semibold">{{ f.label }}:</span>
        <span>{{ f.value }}</span>
        <button
          type="button"
          class="ml-0.5 hover:text-apricot-900 transition-colors"
          @click="removeFilter(f.key)"
        >
          <i class="pi pi-times text-[10px]" />
        </button>
      </span>
    </div>

    <!-- Advanced Filter DIALOG -->
    <Dialog
      v-model:visible="showAdvanced"
      modal
      :draggable="false"
      :dismissable-mask="false"
      :closable="false"
      :style="{ width: '480px' }"
      :pt="{
        root: { class: 'rounded-2xl overflow-hidden' },
        header: { class: '!p-0' },
        content: { class: '!p-0' },
      }"
    >
      <template #container>
        <div class="bg-white rounded-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-appleCore-100">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-lg bg-apricot-100 flex items-center justify-center">
                <i class="pi pi-sliders-h text-apricot-600 text-sm" />
              </div>
              <div>
                <p class="text-sm font-semibold text-blueberry-800">Advanced Filters</p>
                <p class="text-[11px] text-blueberry-500">Filter by place / location</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="stagedAdvancedCount > 0"
                type="button"
                class="text-[11px] text-red-500 hover:text-red-700 hover:underline"
                @click="clearAdvanced"
              >
                Clear
              </button>
              <button
                type="button"
                class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
                @click="showAdvanced = false"
              >
                <i class="pi pi-times text-xs" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <!-- Location -->
            <div>
              <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i class="pi pi-map-marker text-apricot-500 text-xs" />
                Place / Location
              </p>

              <div class="space-y-3">
                <!-- Province -->
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>Province</span>
                    <span
                      v-if="!loadingProvinces && psgcProvinces.length > 0"
                      class="text-[10px] text-blueberry-400 font-normal"
                    >
                      ({{ psgcProvinces.length }} available)
                    </span>
                  </label>
                  <Select
                    v-model="province"
                    :options="provinceOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="loadingProvinces ? 'Loading provinces...' : 'Select province...'"
                    class="w-full"
                    size="small"
                    filter
                    show-clear
                    :loading="loadingProvinces"
                  />
                </div>

                <!-- City -->
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                    <span>City / Municipality</span>
                    <span
                      v-if="province && !loadingCities && psgcCities.length > 0"
                      class="text-[10px] text-blueberry-400 font-normal"
                    >
                      ({{ psgcCities.length }} available)
                    </span>
                    <i
                      v-if="loadingCities"
                      class="pi pi-spin pi-spinner text-[10px] text-apricot-500"
                    />
                  </label>
                  <Select
                    v-model="city"
                    :options="cityOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="
                      !province
                        ? 'Select province first...'
                        : loadingCities
                          ? 'Loading cities...'
                          : 'Select city or municipality...'
                    "
                    class="w-full"
                    size="small"
                    filter
                    show-clear
                    :loading="loadingCities"
                    :disabled="!province || loadingCities"
                  >
                    <template #option="{ option }">
                      <div class="flex items-center gap-2 w-full">
                        <i
                          v-if="option.value === ''"
                          class="pi pi-list text-blueberry-400 text-xs"
                        />
                        <i
                          v-else
                          class="pi pi-building text-blueberry-400 text-xs"
                        />
                        <span class="flex-1 truncate">{{ option.label }}</span>
                        <span
                          v-if="option.isCity"
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium"
                        >
                          CITY
                        </span>
                        <span
                          v-else-if="option.isMunicipality"
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium"
                        >
                          MUN.
                        </span>
                      </div>
                    </template>
                  </Select>
                  <p
                    v-if="!province"
                    class="text-[10px] text-blueberry-400 mt-1 flex items-center gap-1"
                  >
                    <i class="pi pi-info-circle text-[9px]" />
                    Choose a province to enable city selection
                  </p>
                </div>

                <!-- Address keyword -->
                <div>
                  <label class="block text-xs font-medium text-blueberry-700 mb-1.5">
                    Address Keyword
                  </label>
                  <div class="relative">
                    <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-blueberry-400 text-xs z-10" />
                    <InputText
                      v-model="address"
                      placeholder="e.g. Bonifacio Street..."
                      class="w-full !pl-9"
                      size="small"
                      @keyup.enter="applyAdvanced"
                    />
                  </div>
                  <p class="text-[10px] text-blueberry-400 mt-1 flex items-center gap-1">
                    <i class="pi pi-info-circle text-[9px]" />
                    Searches applicant current / permanent address
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-2 px-5 py-4 border-t border-appleCore-100 bg-appleCore-50/50">
            <span class="text-xs text-blueberry-500">
              <span v-if="stagedAdvancedCount > 0">
                <strong class="text-apricot-600">{{ stagedAdvancedCount }}</strong>
                {{ stagedAdvancedCount === 1 ? 'filter' : 'filters' }} staged
              </span>
              <span v-if="hasUnsavedChanges" class="ml-1 text-amber-600">
                (unsaved)
              </span>
            </span>

            <div class="flex items-center gap-2">
              <Button
                label="Cancel"
                severity="secondary"
                text
                size="small"
                @click="showAdvanced = false"
              />
              <Button
                label="Apply Filters"
                icon="pi pi-check"
                size="small"
                class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500"
                @click="applyAdvanced"
              />
            </div>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>