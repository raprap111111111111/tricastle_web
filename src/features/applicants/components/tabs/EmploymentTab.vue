<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import type { EmploymentEntryValues } from '../../schemas/applicant.schema'

const props = defineProps<{
  initialValues?: EmploymentEntryValues[]
}>()

const emit = defineEmits<{
  (e: 'next', values: { employments: EmploymentEntryValues[] }): void
  (e: 'back'): void
}>()

function toISO(val: Date | null | undefined): string | null {
  if (!val || !(val instanceof Date) || isNaN(val.getTime())) return null
  const y = val.getFullYear()
  const m = String(val.getMonth() + 1).padStart(2, '0')
  const d = String(val.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toDate(val: string | null | undefined): Date | null {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

type DatePickerValue = Date | Date[] | (Date | null)[] | null | undefined

function toSingleDate(val: DatePickerValue): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  if (Array.isArray(val)) {
    const first = val[0]
    return first instanceof Date ? first : null
  }
  return null
}

const entries = ref<EmploymentEntryValues[]>(
  props.initialValues?.map((emp) => ({
    id:                 emp.id,
    company_name:       emp.company_name,
    position:           emp.position,
    industry:           emp.industry ?? '',
    job_description:    emp.job_description ?? '',
    date_started:       emp.date_started,
    date_ended:         emp.date_ended ?? null,
    is_current:         emp.is_current,
    country:            emp.country ?? 'Philippines',
    city:               emp.city ?? '',
    salary:             emp.salary ?? null,
    salary_currency:    emp.salary_currency ?? 'PHP',
    reason_for_leaving: emp.reason_for_leaving ?? '',
  })) ?? [],
)

function getStartDate(idx: number): Date | null {
  return toDate(entries.value[idx]?.date_started)
}

function getEndDate(idx: number): Date | null {
  return toDate(entries.value[idx]?.date_ended)
}

function setStartDate(idx: number, val: DatePickerValue) {
  entries.value[idx].date_started = toISO(toSingleDate(val)) ?? ''
}

function setEndDate(idx: number, val: DatePickerValue) {
  entries.value[idx].date_ended = toISO(toSingleDate(val))
}

function addEntry() {
  entries.value.push({
    company_name:       '',
    position:           '',
    industry:           '',
    job_description:    '',
    date_started:       '',
    date_ended:         null,
    is_current:         false,
    country:            'Philippines',
    city:               '',
    salary:             null,
    salary_currency:    'PHP',
    reason_for_leaving: '',
  })
}

function removeEntry(idx: number) {
  entries.value.splice(idx, 1)
}

function onNext() {
  emit('next', { employments: entries.value })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-briefcase mr-2" />Employment History
        </h3>
        <Button
          label="Add Employment"
          icon="pi pi-plus"
          size="small"
          severity="success"
          outlined
          @click="addEntry"
        />
      </div>

      <div v-if="entries.length === 0" class="text-center py-8 text-blueberry-400">
        <i class="pi pi-briefcase text-3xl mb-2" />
        <p class="text-sm">No employment records yet. Click "Add Employment" to begin.</p>
      </div>

      <div
        v-for="(entry, idx) in entries"
        :key="idx"
        class="border border-appleCore-100 rounded-lg p-4 mb-4 relative"
      >
        <button
          type="button"
          class="absolute top-3 right-3 text-red-500 hover:text-red-700"
          @click="removeEntry(idx)"
        >
          <i class="pi pi-times" />
        </button>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Company Name *</label>
            <InputText v-model="entry.company_name" placeholder="Company Inc." />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Position *</label>
            <InputText v-model="entry.position" placeholder="Software Engineer" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Industry</label>
            <InputText v-model="entry.industry" placeholder="Construction" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Date Started *</label>
            <DatePicker
              :model-value="getStartDate(idx)"
              date-format="yy-mm-dd"
              placeholder="YYYY-MM-DD"
              show-icon
              @update:model-value="(v) => setStartDate(idx, v)"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Date Ended</label>
            <DatePicker
              :model-value="getEndDate(idx)"
              date-format="yy-mm-dd"
              placeholder="YYYY-MM-DD"
              show-icon
              :disabled="entry.is_current"
              @update:model-value="(v) => setEndDate(idx, v)"
            />
          </div>

          <div class="flex items-end gap-2 pb-1">
            <Checkbox v-model="entry.is_current" :binary="true" :input-id="`current_${idx}`" />
            <label :for="`current_${idx}`" class="text-sm text-blueberry-700">
              Currently working here
            </label>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Country</label>
            <InputText v-model="entry.country" placeholder="Philippines" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">City</label>
            <InputText v-model="entry.city" placeholder="Manila" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Salary</label>
            <InputNumber
              v-model="entry.salary"
              :min="0"
              mode="currency"
              :currency="entry.salary_currency || 'PHP'"
              locale="en-PH"
            />
          </div>

          <div class="flex flex-col gap-1 md:col-span-3">
            <label class="text-sm font-medium text-blueberry-700">Job Description</label>
            <Textarea
              v-model="entry.job_description"
              rows="2"
              placeholder="Responsibilities..."
              auto-resize
            />
          </div>

          <div class="flex flex-col gap-1 md:col-span-3">
            <label class="text-sm font-medium text-blueberry-700">Reason for Leaving</label>
            <InputText v-model="entry.reason_for_leaving" placeholder="Career growth, contract ended..." />
          </div>
        </div>
      </div>
    </section>

    <div class="flex justify-between">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg
               font-medium text-sm hover:bg-gray-300 transition-colors"
        @click="emit('back')"
      >
        <i class="pi pi-arrow-left text-xs" />
        Back
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-apricot-500 text-white rounded-lg
               font-medium text-sm hover:bg-apricot-600 transition-colors"
        @click="onNext"
      >
        Next
        <i class="pi pi-arrow-right text-xs" />
      </button>
    </div>
  </div>
</template>