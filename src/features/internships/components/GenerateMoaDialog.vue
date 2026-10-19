<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import { useMoaDownload } from '../composables/useMoaDownload'
import type { GenerateMoaPayload } from '../types'

const props = defineProps<{
  visible: boolean
  internshipId: number | null
  defaultMunicipality?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'generated', url?: string): void
}>()

const { generateSingle, generating } = useMoaDownload()

// ⚡ Presets for quick selection
const LOCATION_PRESETS = [
  { label: 'Municipality of Murcia', value: 'Murcia' },
  { label: 'City of Bacolod', value: 'Bacolod' },
  { label: 'City of Talisay', value: 'Talisay' },
  { label: 'City of Silay', value: 'Silay' },
  { label: 'City of Bago', value: 'Bago' },
  { label: 'Custom Location...', value: '__custom__' },
]

const selectedPreset = ref('Murcia')
const customLocation = ref('')

const isCustom = computed(() => selectedPreset.value === '__custom__')

const form = reactive<GenerateMoaPayload>({
  agreement_date: null,
  municipality: 'Murcia',
})

const dateVal = ref<Date | null>(new Date())

// Sync selected location to form.municipality
watch([selectedPreset, customLocation], () => {
  if (isCustom.value) {
    form.municipality = customLocation.value.trim()
  } else {
    form.municipality = selectedPreset.value
  }
})

watch(dateVal, (v) => {
  form.agreement_date = v ? v.toISOString().split('T')[0] : null
})

watch(
  () => props.visible,
  (open) => {
    if (open) {
      dateVal.value = new Date()
      selectedPreset.value = 'Murcia'
      customLocation.value = ''
      form.municipality = 'Murcia'
    }
  },
)

async function submit() {
  if (!props.internshipId) return
  const url = await generateSingle(props.internshipId, { ...form })
  emit('generated', url)
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Generate MOA Word Document"
    :style="{ width: '460px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-3">
      <p class="text-xs text-blueberry-500">
        Builds the official MOA on the server, then downloads the document as a Word (.docx) file.
      </p>

      <div>
        <label class="text-xs font-medium text-blueberry-700">Agreement Date</label>
        <DatePicker v-model="dateVal" show-icon class="w-full" />
      </div>

      <div>
        <label class="text-xs font-medium text-blueberry-700">Place of Signing</label>
        <Select
          v-model="selectedPreset"
          :options="LOCATION_PRESETS"
          option-label="label"
          option-value="value"
          class="w-full"
          placeholder="Select location"
        />
        <p class="text-[11px] text-blueberry-400 mt-1">
          Backend automatically formats output as "City of ..." or "Municipality of ...".
        </p>
      </div>

      <div v-if="isCustom">
        <label class="text-xs font-medium text-blueberry-700">Custom City / Municipality</label>
        <InputText
          v-model="customLocation"
          class="w-full"
          placeholder="e.g. Murcia or Bacolod"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="emit('update:visible', false)" />
      <Button
        label="Generate & Download (.docx)"
        icon="pi pi-download"
        :loading="generating"
        :disabled="!internshipId || (isCustom && !customLocation.trim())"
        class="!bg-emerald-600 !border-emerald-600 !text-white"
        @click="submit"
      />
    </template>
  </Dialog>
</template>