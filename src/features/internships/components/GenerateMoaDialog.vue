<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import { useMoaDownload } from '../composables/useMoaDownload'
import type { GenerateMoaPayload } from '../types'

const props = defineProps<{
  visible: boolean
  internshipId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'generated', url?: string): void
}>()

const { generateSingle, generating } = useMoaDownload()

const form = reactive<GenerateMoaPayload>({
  agreement_date: null,
  municipality: 'Murcia',
})
const dateVal = ref<Date | null>(new Date())

watch(dateVal, (v) => {
  form.agreement_date = v ? v.toISOString().split('T')[0] : null
})

watch(
  () => props.visible,
  (open) => {
    if (open) {
      dateVal.value = new Date()
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
      <!-- 🎯 FIXED: PDF descriptors changed to Word (.docx) descriptors -->
      <p class="text-xs text-blueberry-500">
        Builds the official 9-page MOA on the server, then downloads the document as a Word (.docx) file.
      </p>
      <div>
        <label class="text-xs font-medium text-blueberry-700">Agreement Date</label>
        <DatePicker v-model="dateVal" show-icon class="w-full" />
      </div>
      <div>
        <label class="text-xs font-medium text-blueberry-700">Municipality</label>
        <InputText v-model="form.municipality" class="w-full" />
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="emit('update:visible', false)" />
      <!-- 🎯 FIXED: Changed label from PDF to DOCX -->
      <Button
        label="Generate & Download (.docx)"
        icon="pi pi-download"
        :loading="generating"
        :disabled="!internshipId"
        class="!bg-emerald-600 !border-emerald-600 !text-white"
        @click="submit"
      />
    </template>
  </Dialog>
</template>