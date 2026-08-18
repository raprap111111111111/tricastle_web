<!-- src/features/applicants/components/final-list/AdvancedFiltersDialog.vue -->
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'

defineProps<{
  visible: boolean

  gender:                  string
  civilStatus:             string
  nationality:             string
  qualityGrade:            string
  city:                    string
  province:                string
  address:                 string
  skillCategory:           string
  jlptLevel:               string
  willingToBeDeployed:     string
  japanDeploymentReady:    string
  previousJapanExperience: string
  sswEligible:             string

  genderOptions:        any[]
  civilStatusOptions:   any[]
  nationalityOptions:   any[]
  qualityGradeOptions:  any[]
  skillCategoryOptions: any[]
  jlptLevelOptions:     any[]
  booleanOptions:       any[]
  provinceOptions:      any[]
  cityOptions:          any[]

  psgcProvinces:    any[]
  psgcCities:       any[]
  loadingProvinces: boolean
  loadingCities:    boolean

  stagedAdvancedCount: number
  hasUnsavedChanges:   boolean
}>()

const emit = defineEmits<{
  'update:visible':                 [v: boolean]
  'update:gender':                  [v: string]
  'update:civilStatus':             [v: string]
  'update:nationality':             [v: string]
  'update:qualityGrade':            [v: string]
  'update:city':                    [v: string]
  'update:province':                [v: string]
  'update:address':                 [v: string]
  'update:skillCategory':           [v: string]
  'update:jlptLevel':               [v: string]
  'update:willingToBeDeployed':     [v: string]
  'update:japanDeploymentReady':    [v: string]
  'update:previousJapanExperience': [v: string]
  'update:sswEligible':             [v: string]
  apply: []
  clear: []
}>()

// ✅ Typed helper — narrows the event name AND coerces unknown → string
type StringFieldEvent =
  | 'update:gender'
  | 'update:civilStatus'
  | 'update:nationality'
  | 'update:qualityGrade'
  | 'update:city'
  | 'update:province'
  | 'update:address'
  | 'update:skillCategory'
  | 'update:jlptLevel'
  | 'update:willingToBeDeployed'
  | 'update:japanDeploymentReady'
  | 'update:previousJapanExperience'
  | 'update:sswEligible'

function emitString(event: StringFieldEvent, value: unknown): void {
  // ✅ Cast bypasses Vue's overload confusion — safe because
  // all StringFieldEvent members are declared with [v: string] signatures.
  ;(emit as (e: string, v: string) => void)(event, String(value ?? ''))
}


function close() { emit('update:visible', false) }
</script>

<template>
  <Dialog :visible="visible" modal :draggable="false" :dismissable-mask="false" :closable="false"
    :style="{ width: '560px' }"
    :pt="{
      root:    { class: 'rounded-2xl overflow-hidden' },
      header:  { class: '!p-0' },
      content: { class: '!p-0' },
    }"
    @update:visible="emit('update:visible', $event)">
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
              <p class="text-[11px] text-blueberry-500">Set criteria and click Apply</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="stagedAdvancedCount > 0" type="button"
              class="text-[11px] text-red-500 hover:text-red-700 hover:underline" @click="emit('clear')">
              Clear all
            </button>
            <button type="button"
              class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-appleCore-100 text-blueberry-500"
              @click="close">
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

          <!-- Demographics -->
          <div>
            <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="pi pi-user text-blueberry-400 text-xs" />
              Demographics
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Gender</label>
                <Select :model-value="gender" :options="genderOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:gender', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Civil Status</label>
                <Select :model-value="civilStatus" :options="civilStatusOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:civilStatus', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Nationality</label>
                <Select :model-value="nationality" :options="nationalityOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:nationality', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Quality Grade</label>
                <Select :model-value="qualityGrade" :options="qualityGradeOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:qualityGrade', $event)" />
              </div>
            </div>
          </div>

          <!-- Japan Deployment -->
          <div class="pt-4 border-t border-appleCore-100">
            <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="pi pi-send text-apricot-500 text-xs" />
              Japan Deployment
            </p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Skill Category</label>
                <Select :model-value="skillCategory" :options="skillCategoryOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:skillCategory', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">JLPT Level</label>
                <Select :model-value="jlptLevel" :options="jlptLevelOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:jlptLevel', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Willing to Deploy</label>
                <Select :model-value="willingToBeDeployed" :options="booleanOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:willingToBeDeployed', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Japan Ready</label>
                <Select :model-value="japanDeploymentReady" :options="booleanOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:japanDeploymentReady', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Japan Experience</label>
                <Select :model-value="previousJapanExperience" :options="booleanOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:previousJapanExperience', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">SSW Eligible</label>
                <Select :model-value="sswEligible" :options="booleanOptions" option-label="label" option-value="value"
                  class="w-full" size="small"
                  @update:model-value="emitString('update:sswEligible', $event)" />
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="pt-4 border-t border-appleCore-100">
            <p class="text-[11px] font-bold text-blueberry-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i class="pi pi-map-marker text-apricot-500 text-xs" />
              Location
            </p>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                  <span>Province</span>
                  <span v-if="!loadingProvinces && psgcProvinces.length > 0"
                    class="text-[10px] text-blueberry-400 font-normal">
                    ({{ psgcProvinces.length }} available)
                  </span>
                </label>
                <Select :model-value="province" :options="provinceOptions" option-label="label" option-value="value"
                  :placeholder="loadingProvinces ? 'Loading provinces...' : 'Select province...'"
                  class="w-full" size="small" filter show-clear :loading="loadingProvinces"
                  @update:model-value="emitString('update:province', $event)" />
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5 flex items-center gap-1">
                  <span>City / Municipality</span>
                  <span v-if="province && !loadingCities && psgcCities.length > 0"
                    class="text-[10px] text-blueberry-400 font-normal">
                    ({{ psgcCities.length }} available)
                  </span>
                  <i v-if="loadingCities" class="pi pi-spin pi-spinner text-[10px] text-apricot-500" />
                </label>
                <Select :model-value="city" :options="cityOptions" option-label="label" option-value="value"
                  :placeholder="!province ? 'Select province first...' : loadingCities ? 'Loading cities...' : 'Select city...'"
                  class="w-full" size="small" filter show-clear :loading="loadingCities"
                  :disabled="!province || loadingCities"
                  @update:model-value="emitString('update:city', $event)">
                  <template #option="{ option }">
                    <div class="flex items-center gap-2 w-full">
                      <i v-if="option.value === ''" class="pi pi-list text-blueberry-400 text-xs" />
                      <i v-else class="pi pi-building text-blueberry-400 text-xs" />
                      <span class="flex-1 truncate">{{ option.label }}</span>
                      <span v-if="option.isCity"
                        class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">CITY</span>
                      <span v-else-if="option.isMunicipality"
                        class="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">MUN.</span>
                    </div>
                  </template>
                </Select>
                <p v-if="!province" class="text-[10px] text-blueberry-400 mt-1 flex items-center gap-1">
                  <i class="pi pi-info-circle text-[9px]" />
                  Choose a province to enable city selection
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-blueberry-700 mb-1.5">Address Keyword</label>
                <div class="relative">
                  <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-blueberry-400 text-xs z-10" />
                  <InputText :model-value="address" placeholder="e.g. Bonifacio Street..." class="w-full !pl-9"
                    size="small"
                    @update:model-value="emitString('update:address', $event)"
                    @keyup.enter="emit('apply')" />
                </div>
                <p class="text-[10px] text-blueberry-400 mt-1 flex items-center gap-1">
                  <i class="pi pi-info-circle text-[9px]" />
                  Searches both current and permanent address
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
            <span v-if="hasUnsavedChanges" class="ml-1 text-amber-600">(unsaved)</span>
          </span>
          <div class="flex items-center gap-2">
            <Button label="Cancel" severity="secondary" text size="small" @click="close" />
            <Button label="Apply Filters" icon="pi pi-check" size="small"
              class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500" @click="emit('apply')" />
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>