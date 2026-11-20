<!-- src/public-apply/components/tabs/EducationTab.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { EducationEntryValues } from '@/features/applicants/schemas/applicant.schema'

const props = defineProps<{
  initialValues?: EducationEntryValues[]
}>()

const emit = defineEmits<{
  (e: 'next', values: { educations: EducationEntryValues[] }): void
  (e: 'back'): void
}>()

const levelOptions = [
  { label: 'Elementary', value: 'elementary' },
  { label: 'High School / Junior High', value: 'high_school' },
  { label: 'Senior High School', value: 'senior_high' },
  { label: 'Vocational / Tech-Voc / TESDA', value: 'vocational' },
  { label: 'College / University', value: 'college' },
  { label: 'Postgraduate / Masteral', value: 'post_graduate' },
]

const statusOptions = [
  { label: 'Graduated', value: 'graduate' },
  { label: 'Undergraduate', value: 'undergraduate' },
  { label: 'Ongoing', value: 'ongoing' },
]

const entries = ref<EducationEntryValues[]>(
  props.initialValues?.map((edu) => ({
    id: edu.id,
    education_level: edu.education_level ?? 'high_school',
    education_status: edu.education_status ?? 'graduate',
    school_name: edu.school_name ?? '',
    course: edu.course ?? '',
    year_started: typeof edu.year_started === 'number' ? edu.year_started : null,
    year_ended: typeof edu.year_ended === 'number' ? edu.year_ended : null,
    honors: edu.honors ?? '',
    remarks: edu.remarks ?? '',
  })) ?? [],
)

function addEntry() {
  entries.value.push({
    education_level: 'high_school',
    education_status: 'graduate',
    school_name: '',
    course: '',
    year_started: null,
    year_ended: null,
    honors: '',
    remarks: '',
  })
}

function removeEntry(idx: number) {
  entries.value.splice(idx, 1)
}

function onNext() {
  emit('next', { educations: entries.value })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="bg-white rounded-xl border border-appleCore-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-serif font-semibold text-blueberry-800">
          <i class="pi pi-graduation-cap mr-2" />Educational Background
        </h3>
        <Button
          label="Add Education"
          icon="pi pi-plus"
          size="small"
          severity="success"
          outlined
          @click="addEntry"
        />
      </div>

      <div v-if="entries.length === 0" class="text-center py-8 text-blueberry-400">
        <i class="pi pi-graduation-cap text-3xl mb-2" />
        <p class="text-sm">No education records added yet. Click "Add Education" to begin.</p>
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Education Level *</label>
            <Select
              v-model="entry.education_level"
              :options="levelOptions"
              option-label="label"
              option-value="value"
              placeholder="Select level"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Status *</label>
            <Select
              v-model="entry.education_status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Select status"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">School Name *</label>
            <InputText v-model="entry.school_name" placeholder="University / High School Name" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Course / Degree / Strand</label>
            <InputText v-model="entry.course" placeholder="BS Computer Science, General, etc." />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-blueberry-700">Year Started</label>
              <InputNumber
                v-model="entry.year_started"
                :use-grouping="false"
                :min="1950"
                :max="2099"
                placeholder="2018"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-blueberry-700">Year Ended / Graduated</label>
              <InputNumber
                v-model="entry.year_ended"
                :use-grouping="false"
                :min="1950"
                :max="2099"
                placeholder="2022"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-sm font-medium text-blueberry-700">Honors / Awards</label>
            <InputText v-model="entry.honors" placeholder="Cum Laude, With Honors, NC II..." />
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