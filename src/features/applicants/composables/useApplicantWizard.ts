import { ref, computed } from 'vue'

export interface WizardStep {
  key: string
  label: string
  icon: string
  description: string
}

export type StepValidationState = 'untouched' | 'valid' | 'invalid'

const STEPS: WizardStep[] = [
  { key: 'personal',   label: 'Personal',           icon: 'pi pi-user',         description: 'Basic personal information' },
  { key: 'physical',   label: 'Physical & Address', icon: 'pi pi-heart',        description: 'Physical details and address' },
  { key: 'documents',  label: 'Documents',          icon: 'pi pi-id-card',      description: 'Passport and government IDs' },
  { key: 'lifestyle',  label: 'Lifestyle',          icon: 'pi pi-shield',       description: 'Habits and medical info' },
  { key: 'education',  label: 'Education',          icon: 'pi pi-book',         description: 'Educational background' },
  { key: 'employment', label: 'Employment',         icon: 'pi pi-briefcase',    description: 'Work experience' },
  { key: 'tattoos',    label: 'Tattoos',            icon: 'pi pi-palette',      description: 'Tattoo records' },
  { key: 'batch',      label: 'Batch',              icon: 'pi pi-users',        description: 'Assign to a deployment batch (optional)' },
  { key: 'review',     label: 'Review',             icon: 'pi pi-check-circle', description: 'Review and submit' },
]

export function useApplicantWizard() {
  const currentStepIndex = ref(0)
  const steps = STEPS
  const totalSteps = STEPS.length

  const stepStates = ref<Record<string, StepValidationState>>(
    Object.fromEntries(STEPS.map((s) => [s.key, 'untouched'])),
  )

  const currentStep = computed(() => STEPS[currentStepIndex.value])
  const isFirstStep = computed(() => currentStepIndex.value === 0)
  const isLastStep  = computed(() => currentStepIndex.value === totalSteps - 1)

  const progress = computed(
    () => Math.round(((currentStepIndex.value + 1) / totalSteps) * 100),
  )

  const invalidSteps = computed(() =>
    STEPS.filter((s) => stepStates.value[s.key] === 'invalid'),
  )

  const hasErrors = computed(() => invalidSteps.value.length > 0)

  const firstInvalidStepIndex = computed(() => {
    const idx = STEPS.findIndex((s) => stepStates.value[s.key] === 'invalid')
    return idx === -1 ? null : idx
  })

  function setStepState(key: string, state: StepValidationState) {
    stepStates.value[key] = state
  }

  function goNext() {
    if (currentStepIndex.value < totalSteps - 1) currentStepIndex.value++
  }

  function goBack() {
    if (currentStepIndex.value > 0) currentStepIndex.value--
  }

  function goToStep(index: number) {
    if (index >= 0 && index < totalSteps) currentStepIndex.value = index
  }

  function reset() {
    currentStepIndex.value = 0
    stepStates.value = Object.fromEntries(STEPS.map((s) => [s.key, 'untouched']))
  }

  return {
    steps,
    totalSteps,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    stepStates,
    invalidSteps,
    hasErrors,
    firstInvalidStepIndex,
    setStepState,
    goNext,
    goBack,
    goToStep,
    reset,
  }
}