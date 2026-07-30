<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import CompanyStatusBadge from '../components/CompanyStatusBadge.vue'
import { useCompanies } from '../composables/useCompanies'
import { useCompanyStore } from '../stores/company.store'

const props = defineProps<{ id: number }>()

const router = useRouter()
const store  = useCompanyStore()
const { handleToggleStatus } = useCompanies()

onMounted(async () => {
  store.clearCompany()
  await store.fetchCompany(props.id)
})

const c = computed(() => store.company)

function display(val: any, fallback = '—'): string {
  if (val === null || val === undefined || val === '') return fallback
  return String(val)
}

async function onToggleStatus() {
  if (!c.value) return
  await handleToggleStatus(c.value.id)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
    <!-- Header Nav -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text rounded
          @click="router.push({ name: 'companies.index' })"
        />
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-800">
            Company Details
          </h1>
          <p v-if="c" class="text-sm text-blueberry-500">
            {{ c.code }}
          </p>
        </div>
      </div>

      <div v-if="c" class="flex items-center gap-2">
        <Button
          :label="c.is_active ? 'Deactivate' : 'Activate'"
          :icon="c.is_active ? 'pi pi-ban' : 'pi pi-check-circle'"
          :severity="c.is_active ? 'warn' : 'success'"
          outlined
          :loading="store.submitting"
          @click="onToggleStatus"
        />
        <Button
          label="Edit"
          icon="pi pi-pencil"
          severity="secondary"
          outlined
          @click="router.push({ name: 'companies.edit', params: { id: c.id } })"
        />
      </div>
    </div>

    <!-- Loading -->
    <template v-if="store.loading">
      <Skeleton height="200px" border-radius="16px" />
      <Skeleton height="200px" border-radius="16px" />
    </template>

    <template v-else-if="!c">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-building text-4xl mb-3" />
        <p>Company not found</p>
      </div>
    </template>

    <template v-else>
      <!-- Header Card -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded">
                {{ c.code }}
              </span>
              <CompanyStatusBadge :is-active="c.is_active" />
              <span
                v-if="c.category"
                class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                       bg-blue-50 text-blue-700 ring-1 ring-blue-200"
              >
                {{ c.category.name }}
              </span>
            </div>
            <h2 class="text-2xl font-serif font-semibold text-blueberry-800">
              {{ c.name }}
            </h2>
            <p v-if="c.name_japanese" class="text-lg text-blueberry-600 mt-1">
              {{ c.name_japanese }}
            </p>
          </div>
        </div>
      </section>

      <!-- Address -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-map-marker text-apricot-500" />
          Address
        </h3>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Street</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(c.address) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">City</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(c.city) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Prefecture</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(c.prefecture) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Postal Code</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(c.postal_code) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Country</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ c.country }} <span v-if="c.country === 'Japan'">🇯🇵</span>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Contact -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-user text-apricot-500" />
          Contact
        </h3>
        <dl class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Person</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(c.contact_person) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Email</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              <a v-if="c.contact_email" :href="`mailto:${c.contact_email}`" class="text-apricot-600 hover:underline">
                {{ c.contact_email }}
              </a>
              <span v-else>—</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Phone</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              <a v-if="c.contact_phone" :href="`tel:${c.contact_phone}`" class="text-apricot-600 hover:underline">
                {{ c.contact_phone }}
              </a>
              <span v-else>—</span>
            </dd>
          </div>
        </dl>
      </section>

      <!-- Description -->
      <section
        v-if="c.description"
        class="bg-white rounded-2xl border border-appleCore-100 p-6"
      >
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-2 flex items-center gap-2">
          <i class="pi pi-align-left text-apricot-500" />
          About
        </h3>
        <p class="text-sm text-blueberry-700 whitespace-pre-line leading-relaxed">
          {{ c.description }}
        </p>
      </section>
    </template>
  </div>
</template>