<!-- src/features/applicants/components/tabs/FamilyTab.vue -->
<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'

import { familySchema, type FamilyFormValues } from '../../schemas/applicant.schema'

const props = defineProps<{
  initialValues?: FamilyFormValues
}>()

const emit = defineEmits<{
  next:     [values: FamilyFormValues]
  back:     []
  validate: [values: FamilyFormValues | null]
}>()

// ─── Form ─────────────────────────────────────────────────────────────────────
const { handleSubmit, values, setFieldValue } = useForm<FamilyFormValues>({
  validationSchema: toTypedSchema(familySchema),
  initialValues: props.initialValues ?? {
    spouse_salary_unit: 'per_month',
  },
})

// ─── Options ──────────────────────────────────────────────────────────────────
const salaryUnitOptions = [
  { label: 'per month', value: 'per_month' },
  { label: 'per day',   value: 'per_day' },
  { label: 'per year',  value: 'per_year' },
]

// ─── Emit validate on every change ────────────────────────────────────────────
watch(
  values,
  (v) => emit('validate', v as FamilyFormValues),
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
    <div class="flex items-start gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700">
      <i class="pi pi-info-circle text-indigo-500 mt-0.5 flex-shrink-0" />
      <span>
        This section collects <strong>family background &amp; relative details</strong> for AIS generation and emergency contact.
        All fields are optional — fill what is available now.
      </span>
    </div>

    <!-- ─── Family Background (AIS Sentences) ────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-home text-apricot-500" />
        Household &amp; Living Situation
      </h3>
      <p class="text-xs text-blueberry-400 mb-4">
        Used on the AIS Family Background section (living situation + birth order sentences).
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-apricot-50 border border-apricot-200">
        <div class="md:col-span-3">
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Living Situation
          </label>
          <InputText
            :model-value="values.living_situation ?? ''"
            placeholder="e.g. living in his parents house together with his siblings"
            class="w-full"
            @update:model-value="(v) => setFieldValue('living_situation', v || null)"
          />
          <p class="text-[10px] text-blueberry-400 mt-1">
            Printed on AIS as: <em>: living in his parents house together with his siblings</em>
          </p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Birth Order
          </label>
          <InputNumber
            :model-value="values.birth_order ?? undefined"
            placeholder="e.g. 2"
            :min="1"
            :max="20"
            class="w-full"
            @update:model-value="(v) => setFieldValue('birth_order', v ?? null)"
          />
          <p class="text-[10px] text-blueberry-400 mt-1">2 → “2nd child”</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Total Siblings
          </label>
          <InputNumber
            :model-value="values.siblings_count ?? undefined"
            placeholder="e.g. 4"
            :min="0"
            :max="30"
            class="w-full"
            @update:model-value="(v) => setFieldValue('siblings_count', v ?? null)"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">
            Siblings Note
          </label>
          <InputText
            :model-value="values.siblings_description ?? ''"
            placeholder="e.g. all boys"
            class="w-full"
            @update:model-value="(v) => setFieldValue('siblings_description', v || null)"
          />
          <p class="text-[10px] text-blueberry-400 mt-1">
            Prints as: <em>2nd child among 4 siblings (all boys)</em>
          </p>
        </div>
      </div>
    </div>

    <!-- ─── Parents Information ──────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
        <i class="pi pi-users text-apricot-500" />
        Parents Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Father -->
        <div class="space-y-3 p-4 rounded-xl bg-appleCore-50 border border-appleCore-100">
          <p class="text-xs font-bold text-blueberry-600 uppercase tracking-wider">Father</p>
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1">Full Name</label>
            <InputText
              :model-value="values.father_name ?? ''"
              placeholder="Father's full name"
              class="w-full"
              @update:model-value="(v) => setFieldValue('father_name', v || null)"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1">Occupation</label>
            <InputText
              :model-value="values.father_occupation ?? ''"
              placeholder="Occupation"
              class="w-full"
              @update:model-value="(v) => setFieldValue('father_occupation', v || null)"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1">Contact Number</label>
            <InputText
              :model-value="values.father_contact ?? ''"
              placeholder="e.g. 09xxxxxxxxx"
              class="w-full"
              @update:model-value="(v) => setFieldValue('father_contact', v || null)"
            />
          </div>
        </div>

        <!-- Mother -->
        <div class="space-y-3 p-4 rounded-xl bg-appleCore-50 border border-appleCore-100">
          <p class="text-xs font-bold text-blueberry-600 uppercase tracking-wider">Mother</p>
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1">Full Name</label>
            <InputText
              :model-value="values.mother_name ?? ''"
              placeholder="Mother's full name"
              class="w-full"
              @update:model-value="(v) => setFieldValue('mother_name', v || null)"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1">Occupation</label>
            <InputText
              :model-value="values.mother_occupation ?? ''"
              placeholder="Occupation"
              class="w-full"
              @update:model-value="(v) => setFieldValue('mother_occupation', v || null)"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-blueberry-700 mb-1">Contact Number</label>
            <InputText
              :model-value="values.mother_contact ?? ''"
              placeholder="e.g. 09xxxxxxxxx"
              class="w-full"
              @update:model-value="(v) => setFieldValue('mother_contact', v || null)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Spouse Information ───────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-heart text-apricot-500" />
        Spouse Information
        <span class="text-xs font-normal text-blueberry-400">(if married)</span>
      </h3>
      <p class="text-xs text-blueberry-400 mb-4">Provide spouse details if applicant is married.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-appleCore-50 border border-appleCore-100">
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1">Full Name</label>
          <InputText
            :model-value="values.spouse_name ?? ''"
            placeholder="Spouse's full name"
            class="w-full"
            @update:model-value="(v) => setFieldValue('spouse_name', v || null)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1">Contact Number</label>
          <InputText
            :model-value="values.spouse_contact ?? ''"
            placeholder="e.g. 09xxxxxxxxx"
            class="w-full"
            @update:model-value="(v) => setFieldValue('spouse_contact', v || null)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1">Occupation</label>
          <InputText
            :model-value="values.spouse_occupation ?? ''"
            placeholder="Occupation"
            class="w-full"
            @update:model-value="(v) => setFieldValue('spouse_occupation', v || null)"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-blueberry-700 mb-1">Spouse Salary</label>
          <div class="flex items-center gap-2">
            <InputNumber
              :model-value="values.spouse_salary ?? undefined"
              placeholder="0"
              :min="0"
              class="flex-1 min-w-0"
              @update:model-value="(v) => setFieldValue('spouse_salary', v ?? null)"
            />
            <Select
              :model-value="values.spouse_salary_unit ?? 'per_month'"
              :options="salaryUnitOptions"
              option-label="label"
              option-value="value"
              class="w-36 flex-shrink-0 min-w-0"
              @update:model-value="(v) => setFieldValue('spouse_salary_unit', v)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Emergency Contact ─────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-appleCore-100 p-6">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-1 flex items-center gap-2">
        <i class="pi pi-phone text-apricot-500" />
        Emergency Contact
      </h3>
      <p class="text-xs text-blueberry-400 mb-4">
        Person to contact in case of emergency during deployment.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">Full Name</label>
          <InputText
            :model-value="values.emergency_contact_name ?? ''"
            placeholder="Emergency contact full name"
            class="w-full"
            @update:model-value="(v) => setFieldValue('emergency_contact_name', v || null)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">Relationship</label>
          <InputText
            :model-value="values.emergency_contact_relationship ?? ''"
            placeholder="e.g. Brother, Aunt, Close Friend..."
            class="w-full"
            @update:model-value="(v) => setFieldValue('emergency_contact_relationship', v || null)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">Phone Number</label>
          <InputText
            :model-value="values.emergency_contact_phone ?? ''"
            placeholder="e.g. 09xxxxxxxxx"
            class="w-full"
            @update:model-value="(v) => setFieldValue('emergency_contact_phone', v || null)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 mb-1.5 uppercase tracking-wide">Address</label>
          <InputText
            :model-value="values.emergency_contact_address ?? ''"
            placeholder="Full home address"
            class="w-full"
            @update:model-value="(v) => setFieldValue('emergency_contact_address', v || null)"
          />
        </div>
      </div>
    </div>

    <!-- ─── Navigation ───────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-3 pt-2">
      <Button
        type="button"
        label="Back"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="emit('back')"
      />
      <div class="flex items-center gap-3">
        <span class="text-xs text-blueberry-400 italic">All fields are optional</span>
        <Button
          type="submit"
          label="Next"
          icon="pi pi-arrow-right"
          icon-pos="right"
        />
      </div>
    </div>

  </form>
</template>