// src/features/applicants/composables/useFinalListFilters.ts

import { ref, computed, watch } from 'vue'
import { usePsgc } from '@shared/composables/usePsgc'

export type AdvancedFilters = {
  gender?: string
  civil_status?: string
  nationality?: string
  quality_grade?: string
  city?: string
  province?: string
  address?: string
  skill_category?: string
  jlpt_level?: string
  willing_to_be_deployed?: string
  japan_deployment_ready?: string
  previous_japan_experience?: string
  ssw_eligible?: string
}

export function useFinalListFilters() {
  // ─── Main filters ─────────────────────────────────────────────────────────
  const searchQuery     = ref('')
  const selectedBatchId = ref<number | null>(null)

  // ─── PSGC ─────────────────────────────────────────────────────────────────
  const {
    provinces:            psgcProvinces,
    fetchAllProvinces,
    fetchCitiesByProvince,
    loadingProvinces,
    loadingCities,
  } = usePsgc()

  const psgcCities = ref<any[]>([])

  // ─── Staged (in-dialog) advanced values ───────────────────────────────────
  const gender                  = ref('')
  const civilStatus             = ref('')
  const nationality             = ref('')
  const qualityGrade            = ref('')
  const city                    = ref('')
  const province                = ref('')
  const address                 = ref('')
  const skillCategory           = ref('')
  const jlptLevel               = ref('')
  const willingToBeDeployed     = ref('')
  const japanDeploymentReady    = ref('')
  const previousJapanExperience = ref('')
  const sswEligible             = ref('')

  const appliedAdvanced = ref<AdvancedFilters>({})
  const showAdvanced    = ref(false)

  // ─── Province → cities cascade ────────────────────────────────────────────
  watch(province, async (newProvince) => {
    if (!newProvince) {
      psgcCities.value = []
      city.value       = ''
      return
    }
    const provinceObj = psgcProvinces.value.find((p) => p.name === newProvince)
    if (provinceObj) {
      psgcCities.value = await fetchCitiesByProvince(provinceObj.code)
      city.value       = ''
    }
  })

  // ─── Options ──────────────────────────────────────────────────────────────
  const genderOptions = [
    { label: 'All Genders', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ]

  const civilStatusOptions = [
    { label: 'All Civil Status', value: '' },
    { label: 'Single', value: 'single' },
    { label: 'Married', value: 'married' },
    { label: 'Widowed', value: 'widowed' },
    { label: 'Separated', value: 'separated' },
    { label: 'Divorced', value: 'divorced' },
  ]

  const nationalityOptions = [
    { label: 'All Nationalities', value: '' },
    { label: 'Filipino', value: 'Filipino' },
    { label: 'American', value: 'American' },
    { label: 'Japanese', value: 'Japanese' },
    { label: 'Chinese', value: 'Chinese' },
    { label: 'Korean', value: 'Korean' },
  ]

  const qualityGradeOptions = [
    { label: 'All Grades', value: '' },
    { label: 'Grade A', value: 'A' },
    { label: 'Grade B', value: 'B' },
    { label: 'Grade C', value: 'C' },
    { label: 'Grade D', value: 'D' },
    { label: 'Grade F', value: 'F' },
  ]

  const skillCategoryOptions = [
    { label: 'All Skills', value: '' },
    { label: 'Skilled', value: 'skilled' },
    { label: 'Semi-Skilled', value: 'semi_skilled' },
    { label: 'Unskilled', value: 'unskilled' },
  ]

  const jlptLevelOptions = [
    { label: 'Any JLPT', value: '' },
    { label: 'N1', value: 'N1' },
    { label: 'N2', value: 'N2' },
    { label: 'N3', value: 'N3' },
    { label: 'N4', value: 'N4' },
    { label: 'N5', value: 'N5' },
  ]

  const booleanOptions = [
    { label: 'Any', value: '' },
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
  ]

  const provinceOptions = computed(() => [
    { label: 'All Provinces', value: '' },
    ...psgcProvinces.value.map((p) => ({ label: p.name, value: p.name })),
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

  // ─── Filter apply / clear ─────────────────────────────────────────────────
  function applyAdvanced() {
    const advanced: AdvancedFilters = {
      gender:                    gender.value || undefined,
      civil_status:              civilStatus.value || undefined,
      nationality:               nationality.value || undefined,
      quality_grade:             qualityGrade.value || undefined,
      city:                      city.value.trim() || undefined,
      province:                  province.value || undefined,
      address:                   address.value.trim() || undefined,
      skill_category:            skillCategory.value || undefined,
      jlpt_level:                jlptLevel.value || undefined,
      willing_to_be_deployed:    willingToBeDeployed.value || undefined,
      japan_deployment_ready:    japanDeploymentReady.value || undefined,
      previous_japan_experience: previousJapanExperience.value || undefined,
      ssw_eligible:              sswEligible.value || undefined,
    }
    Object.keys(advanced).forEach((k) => {
      if (advanced[k as keyof AdvancedFilters] === undefined) {
        delete advanced[k as keyof AdvancedFilters]
      }
    })
    appliedAdvanced.value = advanced
    showAdvanced.value    = false
  }

  function clearAdvanced() {
    gender.value                  = ''
    civilStatus.value             = ''
    nationality.value             = ''
    qualityGrade.value            = ''
    city.value                    = ''
    province.value                = ''
    address.value                 = ''
    skillCategory.value           = ''
    jlptLevel.value               = ''
    willingToBeDeployed.value     = ''
    japanDeploymentReady.value    = ''
    previousJapanExperience.value = ''
    sswEligible.value             = ''
    psgcCities.value              = []
    appliedAdvanced.value         = {}
  }

  function onSearch(v: string) { searchQuery.value = v.trim() }

  function resetAll() {
    searchQuery.value    = ''
    selectedBatchId.value = null
    clearAdvanced()
  }

  // ─── Computed helpers ─────────────────────────────────────────────────────
  const appliedAdvancedCount = computed(() => Object.keys(appliedAdvanced.value).length)

  const hasFilters = computed(() =>
    searchQuery.value !== '' || selectedBatchId.value !== null || appliedAdvancedCount.value > 0,
  )

  const stagedAdvancedCount = computed(() => {
    let count = 0
    if (gender.value) count++
    if (civilStatus.value) count++
    if (nationality.value) count++
    if (qualityGrade.value) count++
    if (city.value.trim()) count++
    if (province.value) count++
    if (address.value.trim()) count++
    if (skillCategory.value) count++
    if (jlptLevel.value) count++
    if (willingToBeDeployed.value) count++
    if (japanDeploymentReady.value) count++
    if (previousJapanExperience.value) count++
    if (sswEligible.value) count++
    return count
  })

  const hasUnsavedChanges = computed(() => {
    const s = JSON.stringify({
      gender: gender.value || undefined,
      civil_status: civilStatus.value || undefined,
      nationality: nationality.value || undefined,
      quality_grade: qualityGrade.value || undefined,
      city: city.value.trim() || undefined,
      province: province.value || undefined,
      address: address.value.trim() || undefined,
      skill_category: skillCategory.value || undefined,
      jlpt_level: jlptLevel.value || undefined,
      willing_to_be_deployed: willingToBeDeployed.value || undefined,
      japan_deployment_ready: japanDeploymentReady.value || undefined,
      previous_japan_experience: previousJapanExperience.value || undefined,
      ssw_eligible: sswEligible.value || undefined,
    })
    const a = JSON.stringify(appliedAdvanced.value)
    return s !== a
  })

  return {
    // main
    searchQuery, selectedBatchId,
    // psgc
    psgcProvinces, psgcCities, loadingProvinces, loadingCities, fetchAllProvinces,
    // staged
    gender, civilStatus, nationality, qualityGrade, city, province, address,
    skillCategory, jlptLevel, willingToBeDeployed, japanDeploymentReady,
    previousJapanExperience, sswEligible,
    // applied
    appliedAdvanced, showAdvanced,
    // options
    genderOptions, civilStatusOptions, nationalityOptions, qualityGradeOptions,
    skillCategoryOptions, jlptLevelOptions, booleanOptions,
    provinceOptions, cityOptions,
    // actions
    applyAdvanced, clearAdvanced, onSearch, resetAll,
    // computed
    appliedAdvancedCount, hasFilters, stagedAdvancedCount, hasUnsavedChanges,
  }
}