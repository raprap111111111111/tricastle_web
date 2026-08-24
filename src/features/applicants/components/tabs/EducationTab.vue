<!-- src/features/applicants/components/tabs/EducationTab.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { EducationEntryValues } from '../../schemas/applicant.schema'

const props = defineProps<{
  initialValues?: EducationEntryValues[]
}>()

const emit = defineEmits<{
  (e: 'next', values: { educations: EducationEntryValues[] }): void
  (e: 'back'): void
}>()

const entries = ref<EducationEntryValues[]>(
  props.initialValues?.map((ed) => ({
    id:               ed.id,
    education_level:  ed.education_level,
    education_status: ed.education_status,
    school_name:      ed.school_name,
    course:           ed.course ?? '',
    year_started:     ed.year_started ?? null,
    year_ended:       ed.year_ended ?? null,
    honors:           ed.honors ?? '',
  })) ?? [],
)

const levelOptions = [
  { label: 'Elementary',    value: 'elementary'    },
  { label: 'High School',   value: 'high_school'   },
  { label: 'Senior High',   value: 'senior_high'   },
  { label: 'Vocational',    value: 'vocational'    },
  { label: 'College',       value: 'college'       },
  { label: 'Post Graduate', value: 'post_graduate' },
]

const statusOptions = [
  { label: 'Graduate',      value: 'graduate'      },
  { label: 'Undergraduate', value: 'undergraduate' },
  { label: 'Ongoing',       value: 'ongoing'       },
]

function addEntry() {
  entries.value.push({
    education_level:  'college',
    education_status: 'graduate',
    school_name:      '',
    course:           '',
    year_started:     null,
    year_ended:       null,
    honors:           '',
  })
}

function removeEntry(index: number) {
  entries.value.splice(index, 1)
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
          <i class="pi pi-book mr-2" />Education History
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
        <i class="pi pi-book text-3xl mb-2" />
        <p class="text-sm">No education records yet. Click "Add Education" to begin.</p>
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
            <label class="text-sm font-medium text-blueberry-700">Level *</label>
            <Select
              v-model="entry.education_level"
              :options="levelOptions"
              option-label="label"
              option-value="value"
              placeholder="Select level"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Status</label>
            <Select
              v-model="entry.education_status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">School Name *</label>
            <InputText v-model="entry.school_name" placeholder="University of..." />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Course</label>
            <InputText v-model="entry.course" placeholder="BS Computer Science" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Year Started</label>
            <InputNumber v-model="entry.year_started" placeholder="e.g. 2018" :min="1950" :max="2100" :use-grouping="false" />
          </div>

          <!-- 🎯 RELABELED TO "Year Graduated" -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-blueberry-700">Year Graduated</label>
            <InputNumber v-model="entry.year_ended" placeholder="e.g. 2022" :min="1950" :max="2100" :use-grouping="false" />
          </div>

          <div class="flex flex-col gap-1 md:col-span-3">
            <label class="text-sm font-medium text-blueberry-700">Honors</label>
            <InputText v-model="entry.honors" placeholder="Cum Laude, Dean's List" />
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