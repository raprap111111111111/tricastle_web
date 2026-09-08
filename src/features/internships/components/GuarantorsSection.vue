<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import GuarantorFields from './GuarantorFields.vue'
import { useGuarantors } from '../composables/useGuarantors'
import type { ApplicantGuarantor } from '../types'

const props = defineProps<{ applicantId: number }>()
const emit = defineEmits<{ (e: 'saved', list: ApplicantGuarantor[]): void }>()

const toast = useToast()
const { fetch, sync, loading, saving } = useGuarantors()

const guarantors = ref<ApplicantGuarantor[]>([
  { sequence: 1, full_name: '', nationality: 'Filipino', civil_status: 'Single' },
  { sequence: 2, full_name: '', nationality: 'Filipino', civil_status: 'Single' },
])

onMounted(async () => {
  try {
    const existing = await fetch(props.applicantId)
    if (existing && existing.length > 0) {
      existing.forEach((item) => {
        const idx = item.sequence ? item.sequence - 1 : 0
        if (idx >= 0 && idx < 2) {
          guarantors.value[idx] = {
            id: item.id,
            sequence: idx + 1,
            full_name: item.full_name ?? '',
            age: item.age ?? null,
            civil_status: item.civil_status ?? 'Single',
            nationality: item.nationality ?? 'Filipino',
            address: item.address ?? '',
            residence_cert_no: item.residence_cert_no ?? '',
            residence_cert_issued_at: item.residence_cert_issued_at ?? null,
            residence_cert_place: item.residence_cert_place ?? '',
            relationship: item.relationship ?? '',
          }
        }
      })
    }
  } catch (err) {
    console.error('[GuarantorsSection] Fetch failed:', err)
  }
})

async function save() {
  const g1 = guarantors.value[0]
  const g2 = guarantors.value[1]

  if (!g1?.full_name || !g1.full_name.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Guarantor 1 Required',
      detail: 'Please enter the Full Name for Guarantor 1.',
      life: 4000,
    })
    return
  }

  if (!g2?.full_name || !g2.full_name.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Guarantor 2 Required',
      detail: 'Japan MOA requires two (2) guarantors. Please enter Full Name for Guarantor 2.',
      life: 5000,
    })
    return
  }

  const payload = guarantors.value.map((g, idx) => ({
    sequence: idx + 1,
    full_name: g.full_name.trim(),
    age: g.age || null,
    civil_status: g.civil_status || 'Single',
    nationality: g.nationality || 'Filipino',
    address: g.address || null,
    residence_cert_no: g.residence_cert_no || null,
    residence_cert_issued_at: g.residence_cert_issued_at || null,
    residence_cert_place: g.residence_cert_place || null,
    relationship: g.relationship || null,
  }))

  try {
    const savedList = await sync(props.applicantId, { guarantors: payload })
    if (savedList && savedList.length) {
      savedList.forEach((item) => {
        const idx = item.sequence ? item.sequence - 1 : 0
        if (idx >= 0 && idx < 2) {
          guarantors.value[idx] = { ...guarantors.value[idx], ...item }
        }
      })
    }
    emit('saved', savedList)
  } catch (err) {
    // Toast error handled in composable
  }
}
</script>

<template>
  <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 flex items-center gap-2">
        <i class="pi pi-user-plus text-apricot-500" />
        Guarantors
        <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">(2 required for MOA)</span>
      </h3>
    </div>

    <template v-if="loading">
      <Skeleton height="140px" border-radius="12px" class="mb-3" />
      <Skeleton height="140px" border-radius="12px" />
    </template>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GuarantorFields
          v-for="(g, i) in guarantors"
          :key="i"
          v-model="guarantors[i]"
          :index="i"
        />
      </div>

      <div class="flex justify-end mt-4">
        <Button
          label="Save Guarantors"
          icon="pi pi-save"
          :loading="saving"
          class="!bg-apricot-500 hover:!bg-apricot-600 !border-apricot-500 !text-white"
          @click="save"
        />
      </div>
    </template>
  </section>
</template>