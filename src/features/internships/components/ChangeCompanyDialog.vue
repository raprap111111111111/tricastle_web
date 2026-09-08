<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import { useInternships } from '../composables/useInternships'
import { useCompanyStore } from '@features/companies/stores/company.store'
import type { ChangeCompanyPayload, Internship } from '../types'

const props = defineProps<{
  visible: boolean
  internship: Internship | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'changed', newInternship: Internship): void
}>()

const { handleChangeCompany } = useInternships()
const companyStore = useCompanyStore()

const form = reactive<ChangeCompanyPayload>({
  receiving_company_id: 0,
  contract_start: '',
  change_reason: '',
})

const startDate = ref<Date | null>(null)

watch(startDate, (v) => {
  form.contract_start = v ? v.toISOString().split('T')[0] : ''
})

watch(() => props.visible, async (v) => {
  if (v) {
    if (companyStore.companies.length === 0) {
      await companyStore.fetchCompanies()
    }
    form.receiving_company_id = 0
    form.change_reason = ''
    form.job_description = props.internship?.job_description ?? ''
    startDate.value = null
  }
})

onMounted(async () => {
  if (companyStore.companies.length === 0) {
    await companyStore.fetchCompanies()
  }
})

// Filter out current company from options
const companyOptions = computed(() => {
  return companyStore.companies
    .filter(c => c.id !== props.internship?.receiving_company?.id)
    .map(c => ({
      label: `${c.name} ${c.code ? `(${c.code})` : ''}`,
      value: c.id,
    }))
})

async function submit() {
  if (!props.internship || !form.receiving_company_id) return
  const res = await handleChangeCompany(props.internship.id, form)
  if (res) emit('changed', res)
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '520px' }"
    header="Change Receiving Company (SSW Transfer)"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4 pt-1">
      <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
        <i class="pi pi-info-circle mr-1" />
        This will complete/transfer the current internship and create a new placement record linked to the new company.
      </div>

      <!-- New Company Dropdown -->
      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1">
          New Receiving Company *
        </label>
        <Select
          v-model="form.receiving_company_id"
          :options="companyOptions"
          option-label="label"
          option-value="value"
          filter
          :loading="companyStore.loading"
          placeholder="Search and select new company..."
          class="w-full"
        />
      </div>

      <!-- Contract Start -->
      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1">
          New Contract Start Date *
        </label>
        <DatePicker v-model="startDate" show-icon class="w-full" placeholder="Select date" />
      </div>

      <!-- Job Description -->
      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1">
          Job Description
        </label>
        <InputText v-model="form.job_description" class="w-full" />
      </div>

      <!-- Change Reason -->
      <div>
        <label class="block text-xs font-medium text-blueberry-700 mb-1">
          Transfer Reason *
        </label>
        <Textarea
          v-model="form.change_reason"
          rows="3"
          class="w-full"
          placeholder="e.g. Worker requested transfer due to company relocation..."
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 pt-3">
        <Button label="Cancel" severity="secondary" text @click="emit('update:visible', false)" />
        <Button
          label="Confirm Transfer"
          icon="pi pi-refresh"
          :disabled="!form.receiving_company_id || !form.contract_start || !form.change_reason"
          class="!bg-indigo-600 hover:!bg-indigo-700 !border-indigo-600 !text-white"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>