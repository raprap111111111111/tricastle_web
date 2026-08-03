<!-- src/features/users/components/UserFilters.vue -->
<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import InputText    from 'primevue/inputtext'
import Dropdown     from 'primevue/dropdown'
import OverlayPanel from 'primevue/overlaypanel'
import { AppButton } from '@shared/ui'
import {
  GENDER_OPTIONS,
  ROLE_OPTIONS,
  ORDER_BY_OPTIONS,
  ACTIVE_OPTIONS,
  type UserFilters,
} from '../types'

const props = defineProps<{ modelValue?: UserFilters }>()

const emit = defineEmits<{
  (e: 'filter', filters: Partial<UserFilters>): void
  (e: 'reset'): void
}>()

const local = reactive<Partial<UserFilters>>({
  search: '', is_active: null, department: null, gender: null, role: null,
  order_by: 'created_at', order_dir: 'desc',
})

watch(() => props.modelValue, val => val && Object.assign(local, val), { immediate: true })

const advancedPanel = ref()
function toggleAdvanced(e: Event) { advancedPanel.value?.toggle(e) }

const orderDirOptions = [
  { label: 'Newest', value: 'desc' },
  { label: 'Oldest', value: 'asc'  },
]

function onSearch() { emit('filter', { ...local }) }

function onReset() {
  Object.assign(local, {
    search: '', is_active: null, department: null, gender: null, role: null,
    order_by: 'created_at', order_dir: 'desc',
  })
  emit('reset')
}

function activeAdvancedCount(): number {
  let c = 0
  if (local.department) c++
  if (local.gender)     c++
  if (local.role)       c++
  return c
}
</script>

<template>
  <div class="flex items-center gap-3 flex-wrap">
    <!-- Search -->
    <div class="flex-1 min-w-[280px] relative">
      <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-blueberry-400 pointer-events-none z-10" />
      <InputText
        v-model="local.search"
        placeholder="Search name, email, code..."
        class="w-full !pl-11 !h-[52px] !text-sm !rounded-xl !bg-white !border-appleCore-200"
        @keyup.enter="onSearch"
      />
    </div>

    <button
      type="button"
      class="w-[52px] h-[52px] rounded-xl bg-apricot-500 hover:bg-apricot-600 text-white
             flex items-center justify-center flex-shrink-0 transition-colors"
      @click="onSearch"
    >
      <i class="pi pi-search" />
    </button>

    <Dropdown
      v-model="local.is_active"
      :options="ACTIVE_OPTIONS"
      option-label="label"
      option-value="value"
      placeholder="All Status"
      class="!min-w-[160px] !text-sm !rounded-xl !bg-white !border-appleCore-200 !h-[52px]"
      @change="onSearch"
    />

    <button
      type="button"
      class="relative w-[52px] h-[52px] rounded-xl bg-white border border-appleCore-200
             text-blueberry-600 hover:bg-appleCore-50 flex items-center justify-center
             flex-shrink-0 transition-colors"
      v-tooltip.top="'Advanced filters'"
      @click="toggleAdvanced"
    >
      <i class="pi pi-sliders-h" />
      <span
        v-if="activeAdvancedCount() > 0"
        class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-apricot-500 text-white
               text-[10px] font-bold flex items-center justify-center"
      >
        {{ activeAdvancedCount() }}
      </span>
    </button>

    <button
      type="button"
      class="w-[52px] h-[52px] rounded-xl bg-white border border-appleCore-200
             text-blueberry-600 hover:bg-appleCore-50 flex items-center justify-center
             flex-shrink-0 transition-colors"
      v-tooltip.top="'Reset'"
      @click="onReset"
    >
      <i class="pi pi-refresh" />
    </button>
  </div>

  <!-- Advanced -->
  <OverlayPanel
    ref="advancedPanel"
    :pt="{
      root: '!rounded-2xl !border !border-appleCore-200 !shadow-xl !mt-2',
      content: '!p-5',
    }"
  >
    <div class="w-[420px] space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-appleCore-100">
        <div>
          <h4 class="text-sm font-semibold text-blueberry-800">Advanced Filters</h4>
          <p class="text-xs text-blueberry-400 mt-0.5">Refine user search</p>
        </div>
        <i class="pi pi-sliders-h text-blueberry-400 text-lg" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">Department</label>
        <InputText
          v-model="local.department"
          placeholder="e.g. HR, Documents"
          class="w-full !text-sm !rounded-xl !border-appleCore-200"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">Role</label>
        <Dropdown
          v-model="local.role"
          :options="ROLE_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Any role"
          show-clear
          class="w-full !text-sm !rounded-xl !border-appleCore-200"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">Gender</label>
        <Dropdown
          v-model="local.gender"
          :options="GENDER_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Any"
          show-clear
          class="w-full !text-sm !rounded-xl !border-appleCore-200"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-blueberry-500 uppercase tracking-wide">Sort By</label>
        <div class="flex gap-2">
          <Dropdown
            v-model="local.order_by"
            :options="ORDER_BY_OPTIONS"
            option-label="label"
            option-value="value"
            class="flex-1 !text-sm !rounded-xl !border-appleCore-200"
          />
          <Dropdown
            v-model="local.order_dir"
            :options="orderDirOptions"
            option-label="label"
            option-value="value"
            class="w-32 !text-sm !rounded-xl !border-appleCore-200"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-appleCore-100">
        <AppButton label="Clear" variant="neutral" icon="pi pi-times" size="small" outlined @click="onReset" />
        <AppButton label="Apply" variant="primary" icon="pi pi-check" size="small"
                   @click="() => { onSearch(); advancedPanel?.hide() }" />
      </div>
    </div>
  </OverlayPanel>
</template>