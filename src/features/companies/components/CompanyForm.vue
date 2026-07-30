<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import http from '@shared/api/http'
import type { Company, CompanyPayload, CompanyCategory } from '../types'

const props = defineProps<{
  initial?: Company | null
  submitLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CompanyPayload]
  cancel: []
}>()

// ─── Form state ──────────────────────────────────────────
interface FormState {
  code: string
  name: string
  name_japanese: string | null
  category_id: number | null
  address: string | null
  city: string | null
  prefecture: string | null
  postal_code: string | null
  country: string | null
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  description: string | null
  is_active: boolean
}

const form = ref<FormState>({
  code:           props.initial?.code ?? '',
  name:           props.initial?.name ?? '',
  name_japanese:  props.initial?.name_japanese ?? null,
  category_id:    props.initial?.category_id ?? null,
  address:        props.initial?.address ?? null,
  city:           props.initial?.city ?? null,
  prefecture:     props.initial?.prefecture ?? null,
  postal_code:    props.initial?.postal_code ?? null,
  country:        props.initial?.country ?? 'Japan',
  contact_person: props.initial?.contact_person ?? null,
  contact_email:  props.initial?.contact_email ?? null,
  contact_phone:  props.initial?.contact_phone ?? null,
  description:    props.initial?.description ?? null,
  is_active:      props.initial?.is_active ?? true,
})

// ─── Categories ──────────────────────────────────────────
const categories = ref<CompanyCategory[]>([])
const loadingCategories = ref(false)

async function loadCategories() {
  loadingCategories.value = true
  try {
    const { data } = await http.get('/company-categories', {
      params: { limit: 100 },
    })
    categories.value = data.records ?? data.data ?? []
  } catch (e) {
    console.error('Failed to load categories:', e)
  } finally {
    loadingCategories.value = false
  }
}

onMounted(loadCategories)

// Sync on external change
watch(
  () => props.initial,
  (val) => {
    if (val) {
      form.value = {
        code:           val.code,
        name:           val.name,
        name_japanese:  val.name_japanese,
        category_id:    val.category_id,
        address:        val.address,
        city:           val.city,
        prefecture:     val.prefecture,
        postal_code:    val.postal_code,
        country:        val.country,
        contact_person: val.contact_person,
        contact_email:  val.contact_email,
        contact_phone:  val.contact_phone,
        description:    val.description,
        is_active:      val.is_active,
      }
    }
  },
)

function onSubmit() {
  emit('submit', { ...form.value, category_id: form.value.category_id! })
}
</script>

<template>
  <form
    class="bg-white rounded-2xl border border-appleCore-100 p-6 space-y-6"
    @submit.prevent="onSubmit"
  >
    <!-- ─── Basic Info ────────────────────────────────── -->
    <section>
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
        <i class="pi pi-building text-apricot-500" />
        Basic Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Company Code <span class="text-red-500">*</span>
          </label>
          <InputText v-model="form.code" placeholder="e.g. TOYOTA-JP" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Category <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.category_id"
            :options="categories"
            option-label="name"
            option-value="id"
            placeholder="Select category..."
            filter
            :loading="loadingCategories"
            class="w-full"
          />
        </div>

        <div class="md:col-span-1">
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Status
          </label>
          <div class="flex items-center gap-2 mt-2">
            <ToggleSwitch v-model="form.is_active" input-id="is-active" />
            <label for="is-active" class="text-sm text-blueberry-700 cursor-pointer">
              {{ form.is_active ? 'Active' : 'Inactive' }}
            </label>
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Company Name <span class="text-red-500">*</span>
          </label>
          <InputText v-model="form.name" placeholder="Toyota Motor Corporation" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Japanese Name
          </label>
          <InputText v-model="form.name_japanese" placeholder="トヨタ自動車" class="w-full" />
        </div>
      </div>
    </section>

    <!-- ─── Address ──────────────────────────────────── -->
    <section class="pt-4 border-t border-appleCore-100">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
        <i class="pi pi-map-marker text-apricot-500" />
        Address
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-4">
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Street Address
          </label>
          <InputText v-model="form.address" placeholder="1 Toyota-Cho, Toyota City" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            City
          </label>
          <InputText v-model="form.city" placeholder="Toyota" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Prefecture
          </label>
          <InputText v-model="form.prefecture" placeholder="Aichi" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Postal Code
          </label>
          <InputText v-model="form.postal_code" placeholder="471-8571" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Country
          </label>
          <InputText v-model="form.country" placeholder="Japan" class="w-full" />
        </div>
      </div>
    </section>

    <!-- ─── Contact ──────────────────────────────────── -->
    <section class="pt-4 border-t border-appleCore-100">
      <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
        <i class="pi pi-user text-apricot-500" />
        Contact Information
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Contact Person
          </label>
          <InputText v-model="form.contact_person" placeholder="Yamada Taro" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Email
          </label>
          <InputText v-model="form.contact_email" type="email" placeholder="hr@company.jp" class="w-full" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
            Phone
          </label>
          <InputText v-model="form.contact_phone" placeholder="+81 3 1234 5678" class="w-full" />
        </div>
      </div>
    </section>

    <!-- ─── Description ──────────────────────────────── -->
    <section class="pt-4 border-t border-appleCore-100">
      <label class="block text-xs font-semibold text-blueberry-700 uppercase tracking-wider mb-2">
        Description
      </label>
      <Textarea
        v-model="form.description"
        rows="4"
        placeholder="Company profile, industry, services..."
        class="w-full"
      />
    </section>

    <!-- ─── Actions ──────────────────────────────────── -->
    <div class="flex items-center justify-end gap-2 pt-4 border-t border-appleCore-100">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        outlined
        @click="emit('cancel')"
      />
      <Button
        type="submit"
        :label="submitLabel ?? 'Save'"
        :loading="loading"
        icon="pi pi-check"
      />
    </div>
  </form>
</template>