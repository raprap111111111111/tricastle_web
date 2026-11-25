<!-- src/features/applicants/components/tabs/Step4Deployment.vue -->
<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'

import { deploymentSchema, type DeploymentFormValues } from '@/features/applicants/schemas/applicant.schema'

const props = defineProps<{
  initialValues?: DeploymentFormValues
}>()

const emit = defineEmits<{
  next: [values: DeploymentFormValues]
  back: []
  validate: [values: DeploymentFormValues | null]
}>()

// ─── Form ─────────────────────────────────────────────────────────────────────
const { handleSubmit, values, setFieldValue } = useForm<DeploymentFormValues>({
  validationSchema: toTypedSchema(deploymentSchema),
  initialValues: props.initialValues ?? {
    understands_basic_english: false,
    willing_to_be_deployed: false,
    previous_japan_experience: false,
    years_japan_experience: 0,
    has_titp_certificate: false,
    expected_salary_currency: 'JPY',
    current_salary_currency: 'PHP',
  },
})

// ─── Options ──────────────────────────────────────────────────────────────────
const skillCategoryOptions = [
  { label: 'Select skill category...', value: null },
  { label: 'Skilled', value: 'skilled' },
  { label: 'Semi-Skilled', value: 'semi_skilled' },
  { label: 'Unskilled', value: 'unskilled' },
]

const jlptOptions = [
  { label: 'Not tested / Unknown', value: null },
  { label: 'N1 — Advanced', value: 'N1' },
  { label: 'N2 — Upper Intermediate', value: 'N2' },
  { label: 'N3 — Intermediate', value: 'N3' },
  { label: 'N4 — Elementary', value: 'N4' },
  { label: 'N5 — Beginner', value: 'N5' },
]

const currencyOptions = [
  { label: 'JPY (¥)', value: 'JPY' },
  { label: 'PHP (₱)', value: 'PHP' },
  { label: 'USD ($)', value: 'USD' },
]

// ─── Emit validate on every change ────────────────────────────────────────────
watch(
  values,
  (v) => emit('validate', v as DeploymentFormValues),
  { deep: true },
)

// ─── Submit ───────────────────────────────────────────────────────────────────
const onNext = handleSubmit((data) => {
  emit('next', data)
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onNext">

    <!-- ─── Info Banner ──────────────────────────────────────────────────────── -->
    <div
      class="flex items-start gap-2.5 px-3.5 py-3 bg-apricot-50 border border-apricot-200 rounded-xl text-xs sm:text-sm text-apricot-800">
      <i class="pi pi-info-circle text-apricot-500 mt-0.5 shrink-0 text-sm" />
      <span>
        This section collects <strong>screening information</strong> for Japan construction deployment.
        All fields are optional — fill what is available now.
      </span>
    </div>

    <!-- ─── Skill & Trade ────────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-4 sm:p-6 shadow-sm">
      <h3 class="text-sm sm:text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-wrench text-apricot-500" />
        Skill &amp; Trade
      </h3>
      <p class="text-[11px] sm:text-xs text-blueberry-400 mb-4">
        Used to match applicants with Japan job orders under TITP and SSW programs.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label class="block text-[11px] sm:text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Skill Category
          </label>
          <Select :model-value="values.skill_category ?? null" :options="skillCategoryOptions" option-label="label"
            option-value="value" placeholder="Select skill category..." class="w-full text-xs sm:text-sm" show-clear
            @update:model-value="(v) => setFieldValue('skill_category', v)" />
        </div>
        <div>
          <label class="block text-[11px] sm:text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Trade / Occupation
          </label>
          <InputText :model-value="values.trade_or_occupation ?? ''"
            placeholder="e.g. Formwork Carpenter, Concrete Finisher..." class="w-full text-xs sm:text-sm"
            @update:model-value="(v) => setFieldValue('trade_or_occupation', v || null)" />
          <p class="text-[10px] text-blueberry-400 mt-1">
            Match with JITCO occupation codes for TITP/SSW job orders
          </p>
        </div>
      </div>
    </div>

    <!-- ─── Language ─────────────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-4 sm:p-6 shadow-sm">
      <h3 class="text-sm sm:text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-comment text-apricot-500" />
        Language
      </h3>
      <p class="text-[11px] sm:text-xs text-blueberry-400 mb-4">
        English is used as a bridge language on Japanese sites. JLPT level affects visa tier.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div
          class="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-appleCore-50/70 border border-appleCore-100 gap-2">
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-semibold text-blueberry-800 truncate">Understands Basic English</p>
            <p class="text-[11px] text-blueberry-500 mt-0.5">Can follow site instructions</p>
          </div>
          <ToggleSwitch :model-value="values.understands_basic_english ?? false" class="shrink-0"
            @update:model-value="(v) => setFieldValue('understands_basic_english', v)" />
        </div>
        <div>
          <label class="block text-[11px] sm:text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            JLPT Level
          </label>
          <Select :model-value="values.jlpt_level ?? null" :options="jlptOptions" option-label="label"
            option-value="value" placeholder="Select JLPT level..." class="w-full text-xs sm:text-sm" show-clear
            @update:model-value="(v) => setFieldValue('jlpt_level', v)" />
          <p class="text-[10px] text-blueberry-400 mt-1">N3+ preferred for SSW construction</p>
        </div>
      </div>
    </div>

    <!-- ─── Deployment Willingness ───────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-4 sm:p-6 shadow-sm">
      <h3 class="text-sm sm:text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-send text-apricot-500" />
        Deployment Willingness
      </h3>
      <p class="text-[11px] sm:text-xs text-blueberry-400 mb-4">
        Confirms the applicant's intent to work in Japan as a construction worker.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div
          class="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-appleCore-50/70 border border-appleCore-100 gap-2">
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-semibold text-blueberry-800 truncate">Willing to Work in Japan</p>
            <p class="text-[11px] text-blueberry-500 mt-0.5">Agrees to Japan deployment</p>
          </div>
          <ToggleSwitch :model-value="values.willing_to_be_deployed ?? false" class="shrink-0"
            @update:model-value="(v) => setFieldValue('willing_to_be_deployed', v)" />
        </div>
        <div>
          <label class="block text-[11px] sm:text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Preferred Work Location in Japan
          </label>
          <InputText :model-value="values.preferred_work_location ?? ''" placeholder="e.g. Osaka, Nagoya, Tokyo..."
            class="w-full text-xs sm:text-sm"
            @update:model-value="(v) => setFieldValue('preferred_work_location', v || null)" />
          <p class="text-[10px] text-blueberry-400 mt-1">Optional regional preference</p>
        </div>
      </div>
    </div>

    <!-- ─── Prior Japan Experience ───────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-4 sm:p-6 shadow-sm">
      <h3 class="text-sm sm:text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-history text-apricot-500" />
        Prior Japan Experience
      </h3>
      <p class="text-[11px] sm:text-xs text-blueberry-400 mb-4">
        Applicants who have previously worked in Japan via other agencies.
      </p>

      <div
        class="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-appleCore-50/70 border border-appleCore-100 mb-4 gap-2">
        <div class="min-w-0">
          <p class="text-xs sm:text-sm font-semibold text-blueberry-800 truncate">Previously worked in Japan</p>
          <p class="text-[11px] text-blueberry-500 mt-0.5">Via another agency or program</p>
        </div>
        <ToggleSwitch :model-value="values.previous_japan_experience ?? false" class="shrink-0" @update:model-value="(v) => {
          setFieldValue('previous_japan_experience', v)
          if (!v) setFieldValue('years_japan_experience', 0)
        }" />
      </div>

      <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="values.previous_japan_experience" class="mb-4">
          <label class="block text-[11px] sm:text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Total Years of Japan Work Experience
          </label>
          <InputNumber :model-value="values.years_japan_experience ?? 0" :min="1" :max="50" :step="1" show-buttons
            button-layout="horizontal" fluid class="w-full sm:w-48"
            input-class="!text-center !text-xs sm:!text-sm !py-2" suffix=" yr(s)"
            @update:model-value="(v) => setFieldValue('years_japan_experience', v ?? 1)" />
        </div>
      </Transition>

      <!-- TITP -->
      <div class="pt-4 border-t border-appleCore-100">
        <div
          class="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-appleCore-50/70 border border-appleCore-100 mb-3 gap-2">
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-semibold text-blueberry-800 truncate">Has TITP Certificate</p>
            <p class="text-[11px] text-blueberry-500 mt-0.5">Technical Intern Training completion</p>
          </div>
          <ToggleSwitch :model-value="values.has_titp_certificate ?? false" class="shrink-0" @update:model-value="(v) => {
            setFieldValue('has_titp_certificate', v)
            if (!v) setFieldValue('titp_occupation', null)
          }" />
        </div>

        <Transition enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100"
          leave-to-class="opacity-0">
          <div v-if="values.has_titp_certificate">
            <label class="block text-[11px] sm:text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
              TITP Occupation / Trade
            </label>
            <InputText :model-value="values.titp_occupation ?? ''"
              placeholder="e.g. Reinforcing Iron Work, Concrete Work..." class="w-full text-xs sm:text-sm"
              @update:model-value="(v) => setFieldValue('titp_occupation', v || null)" />
            <p class="text-[10px] text-blueberry-400 mt-1">
              Use the JITCO occupation description from their certificate
            </p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ─── Salary ───────────────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-4 sm:p-6 shadow-sm">
      <h3 class="text-sm sm:text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-money-bill text-apricot-500" />
        Salary Expectations
      </h3>
      <p class="text-[11px] sm:text-xs text-blueberry-400 mb-4">
        Expected salary defaults to JPY for Japan deployment context.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <!-- Expected Salary -->
        <div class="flex flex-col gap-1.5">
          <label class="block text-[11px] sm:text-xs font-semibold text-blueberry-700 uppercase tracking-wide">
            Expected Monthly Salary
          </label>
          <div class="flex items-center gap-2 w-full">
            <Select :model-value="values.expected_salary_currency ?? 'JPY'" :options="currencyOptions"
              option-label="label" option-value="value" class="w-24 sm:w-32 shrink-0 text-xs sm:text-sm" :pt="{
                label: { class: '!py-2 !px-2 !text-xs truncate font-medium' },
                dropdown: { class: '!w-6' }
              }" @update:model-value="(v) => setFieldValue('expected_salary_currency', v)" />
            <InputNumber :model-value="values.expected_salary ?? undefined" placeholder="0" :min="0"
              :max-fraction-digits="2" fluid class="flex-1 min-w-0" input-class="w-full !text-xs sm:!text-sm !py-2"
              @update:model-value="(v) => setFieldValue('expected_salary', v ?? null)" />
          </div>
        </div>

        <!-- Current Salary -->
        <div class="flex flex-col gap-1.5">
          <label class="block text-[11px] sm:text-xs font-semibold text-blueberry-700 uppercase tracking-wide">
            Current Monthly Salary
          </label>
          <div class="flex items-center gap-2 w-full">
            <Select :model-value="values.current_salary_currency ?? 'PHP'" :options="currencyOptions"
              option-label="label" option-value="value" class="w-24 sm:w-32 shrink-0 text-xs sm:text-sm" :pt="{
                label: { class: '!py-2 !px-2 !text-xs truncate font-medium' },
                dropdown: { class: '!w-6' }
              }" @update:model-value="(v) => setFieldValue('current_salary_currency', v)" />
            <InputNumber :model-value="values.current_salary ?? undefined" placeholder="0" :min="0"
              :max-fraction-digits="2" fluid class="flex-1 min-w-0" input-class="w-full !text-xs sm:!text-sm !py-2"
              @update:model-value="(v) => setFieldValue('current_salary', v ?? null)" />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Navigation ───────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-3 pt-2">
      <Button type="button" label="Back" icon="pi pi-arrow-left" severity="secondary" outlined size="small"
        class="!text-xs sm:!text-sm" @click="emit('back')" />
      <div class="flex items-center gap-2 sm:gap-3">
        <span class="text-[11px] sm:text-xs text-blueberry-400 italic hidden sm:inline">All fields are optional</span>
        <Button type="submit" label="Next" icon="pi pi-arrow-right" icon-pos="right" size="small"
          class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white !text-xs sm:!text-sm" />
      </div>
    </div>

  </form>
</template>