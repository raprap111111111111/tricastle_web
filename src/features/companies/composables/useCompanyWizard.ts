import { ref, computed } from 'vue'

export type StepKey = 'basic' | 'address' | 'contact' | 'description' | 'review'
export type StepState = 'pristine' | 'valid' | 'invalid'

export interface WizardStep {
  key: StepKey
  label: string
  description: string
  icon: string
}

export function useCompanyWizard() {
  const steps: WizardStep[] = [
    {
      key: 'basic',
      label: 'Basic Info',
      description: 'Company name, code, and category',
      icon: 'pi pi-building',
    },
    {
      key: 'address',
      label: 'Address',
      description: 'Company location',
      icon: 'pi pi-map-marker',
    },
    {
      key: 'contact',
      label: 'Contact',
      description: 'Contact person and details',
      icon: 'pi pi-phone',
    },
    {
      key: 'description',
      label: 'Description',
      description: 'Additional notes (optional)',
      icon: 'pi pi-file-edit',
    },
    {
      key: 'review',
      label: 'Review',
      description: 'Confirm all information before saving',
      icon: 'pi pi-check-circle',
    },
  ]

  const currentStepIndex = ref(0)
  const currentStep = computed(() => steps[currentStepIndex.value])

  const progress = computed(() =>
    Math.round(((currentStepIndex.value + 1) / steps.length) * 100),
  )

  // Track step validation states
  const stepStates = ref<Record<StepKey, StepState>>({
    basic: 'pristine',
    address: 'pristine',
    contact: 'pristine',
    description: 'pristine',
    review: 'pristine',
  })

  function setStepState(key: StepKey, state: StepState) {
    stepStates.value[key] = state
  }

  const invalidSteps = computed(() =>
    steps.filter((s) => stepStates.value[s.key] === 'invalid'),
  )

  const hasErrors = computed(() => invalidSteps.value.length > 0)

  const firstInvalidStepIndex = computed(() => {
    if (invalidSteps.value.length === 0) return null
    return steps.findIndex((s) => s.key === invalidSteps.value[0].key)
  })

  function goNext() {
    if (currentStepIndex.value < steps.length - 1) {
      currentStepIndex.value++
    }
  }

  function goBack() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
    }
  }

  function goToStep(index: number) {
    if (index >= 0 && index < steps.length) {
      currentStepIndex.value = index
    }
  }

  return {
    steps,
    currentStepIndex,
    currentStep,
    progress,
    stepStates,
    hasErrors,
    invalidSteps,
    firstInvalidStepIndex,
    setStepState,
    goNext,
    goBack,
    goToStep,
  }
}