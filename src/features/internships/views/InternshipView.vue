<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import InternshipStatusBadge from '../components/InternshipStatusBadge.vue'
import GenerateMoaDialog from '../components/GenerateMoaDialog.vue'
import ChangeCompanyDialog from '../components/ChangeCompanyDialog.vue'
import { useInternshipStore } from '../stores/internship.store'

const props = defineProps<{ id: number }>()
const router = useRouter()
const store = useInternshipStore()

const showMoa = ref(false)
const showChange = ref(false)

onMounted(async () => {
  store.clearInternship()
  await store.fetchInternship(props.id)
})

const i = computed(() => store.internship)
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Button icon="pi pi-arrow-left" text rounded
          @click="router.push({ name: 'internships.index' })" />
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-800">Internship Details</h1>
          <p v-if="i" class="text-sm text-blueberry-500">
            {{ i.applicant?.applicant_code }} — {{ i.applicant?.full_name }}
          </p>
        </div>
      </div>

      <div v-if="i" class="flex items-center gap-2">
        <Button label="Generate MOA" icon="pi pi-file-pdf" severity="secondary" outlined
          class="!text-emerald-700 !border-emerald-300 hover:!bg-emerald-50"
          @click="showMoa = true" />
        <Button v-if="i.can_change_company"
          label="Change Company" icon="pi pi-refresh" severity="secondary" outlined
          class="!text-indigo-700 !border-indigo-300 hover:!bg-indigo-50"
          @click="showChange = true" />
      </div>
    </div>

    <template v-if="store.loading">
      <Skeleton height="200px" border-radius="16px" />
      <Skeleton height="240px" border-radius="16px" />
    </template>

    <template v-else-if="!i">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-briefcase text-4xl mb-3" />
        <p>Internship not found</p>
      </div>
    </template>

    <template v-else>
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-center gap-2 mb-3">
          <span class="uppercase text-xs font-bold text-blueberry-700">{{ i.program_type }}</span>
          <InternshipStatusBadge :status="i.status" />
          <span v-if="i.is_current" class="text-[10px] font-semibold text-emerald-700">CURRENT</span>
        </div>
        <h2 class="text-xl font-serif font-semibold text-blueberry-800">
          {{ i.receiving_company?.name ?? '—' }}
        </h2>
        <p v-if="i.job_description" class="text-sm text-blueberry-600 mt-1">
          {{ i.job_description }}
        </p>

        <dl class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase">Contract Start</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ i.contract_start ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase">Contract End</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ i.contract_end ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase">Stipend</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ i.stipend_amount ?? '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase">Meal Allowance</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ i.meal_allowance_amount ?? '—' }}
            </dd>
          </div>
        </dl>
      </section>

      <section v-if="i.documents?.length" class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-3">Documents</h3>
        <div class="space-y-2">
          <a v-for="d in i.documents" :key="d.id"
             :href="d.download_url ?? '#'" target="_blank"
             class="flex items-center justify-between border border-appleCore-100 rounded-lg px-4 py-2 hover:bg-appleCore-50/50">
            <span class="text-sm font-medium text-blueberry-800">
              <i class="pi pi-file-pdf text-red-500 mr-2" />
              {{ d.document_no }} · {{ d.document_type }}
            </span>
            <span class="text-xs text-blueberry-500">{{ d.created_at }}</span>
          </a>
        </div>
      </section>

      <GenerateMoaDialog v-model:visible="showMoa" :internship-id="i.id" />
      <ChangeCompanyDialog v-model:visible="showChange" :internship="i" />
    </template>
  </div>
</template>