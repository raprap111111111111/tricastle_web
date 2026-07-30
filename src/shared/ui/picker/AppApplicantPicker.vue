<!-- src/shared/ui/picker/AppApplicantPicker.vue -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import AutoComplete, {
  type AutoCompleteCompleteEvent,
  type AutoCompleteOptionSelectEvent,
} from 'primevue/autocomplete'
import { useApplicantStore } from '@features/applicants/stores/applicant.store'
import type { Applicant } from '@features/applicants/types'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
    debounceMs?: number
    resultLimit?: number
  }>(),
  {
    placeholder: 'Search by name, code, or email...',
    disabled: false,
    invalid: false,
    debounceMs: 250,
    resultLimit: 20,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
  (e: 'select', applicant: Applicant): void
  (e: 'clear'): void
}>()

const store = useApplicantStore()

const selected    = ref<Applicant | null>(null)
const suggestions = ref<Applicant[]>([])
const loading     = ref(false)

// ─── Pre-load if we already have an ID ───────────────
onMounted(async () => {
  if (props.modelValue) await loadById(props.modelValue)
})

// ─── Sync external prop changes ──────────────────────
watch(
  () => props.modelValue,
  async (id) => {
    if (id === null) {
      selected.value = null
    } else if (selected.value?.id !== id) {
      await loadById(id)
    }
  },
)

async function loadById(id: number) {
  try {
    await store.fetchApplicant(id)
    if (store.applicant?.id === id) selected.value = store.applicant
  } catch {
    /* silent */
  }
}

// ─── Debounced search ────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function onComplete(event: AutoCompleteCompleteEvent) {
  const query = event.query.trim()

  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    loading.value = true
    try {
      // Snapshot the current list filters so we don't pollute the list view
      const backup = { ...store.filters }

      store.setFilters({ search: query })
      store.filters.limit = props.resultLimit
      await store.fetchApplicants()
      suggestions.value = [...store.applicants]

      // Restore
      store.filters = backup
    } finally {
      loading.value = false
    }
  }, props.debounceMs)
}

// ─── Select / Clear ──────────────────────────────────
function onSelect(event: AutoCompleteOptionSelectEvent) {
  const app = event.value as Applicant
  selected.value = app
  emit('update:modelValue', app.id)
  emit('select', app)
}

function onClear() {
  selected.value = null
  emit('update:modelValue', null)
  emit('clear')
}

// ─── Formatters ──────────────────────────────────────
function applicantLabel(app: Applicant | null | undefined): string {
  if (!app) return ''
  const middle = app.middle_name ? ` ${app.middle_name}` : ''
  const suffix = app.suffix ? ` ${app.suffix}` : ''
  return `${app.first_name}${middle} ${app.last_name}${suffix}`.trim()
}

function initials(app: Applicant): string {
  const f = app.first_name?.charAt(0) ?? ''
  const l = app.last_name?.charAt(0) ?? ''
  return (f + l).toUpperCase() || '?'
}
</script>

<template>
  <AutoComplete
    :model-value="selected"
    :suggestions="suggestions"
    :loading="loading"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :option-label="applicantLabel"
    :force-selection="false"
    :complete-on-focus="true"
    :delay="0"
    class="w-full"
    :input-props="{
      autocomplete: 'off',
      autocorrect: 'off',
      autocapitalize: 'off',
      spellcheck: false,
      name: 'applicant-picker-search',
      'data-lpignore': 'true',
      'data-form-type': 'other',
    }"
    :pt="{
      pcInputText: { root: 'w-full' },
    }"
    @complete="onComplete"
    @option-select="onSelect"
    @clear="onClear"
  >
    <!-- Selected chip / input display -->
    <template #chip="{ value }">
      <span class="text-sm text-blueberry-800">
        {{ applicantLabel(value) }}
      </span>
    </template>

    <!-- Dropdown item -->
    <template #option="{ option }">
      <div class="flex items-center gap-3 py-1">
        <div
          class="w-9 h-9 rounded-full bg-apricot-500 text-white
                 flex items-center justify-center flex-shrink-0
                 font-serif font-bold text-sm"
        >
          {{ initials(option) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-blueberry-800 truncate">
            {{ applicantLabel(option) }}
          </p>
          <div class="flex items-center gap-2 text-xs mt-0.5">
            <span class="font-mono text-apricot-600 font-semibold">
              {{ option.applicant_code }}
            </span>
            <span class="text-blueberry-400 truncate">
              · {{ option.email }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <template #empty>
      <div class="px-4 py-6 text-center">
        <i class="pi pi-search text-blueberry-300 text-lg" />
        <p class="text-sm text-blueberry-500 mt-2">
          No applicants found. Try a different search.
        </p>
      </div>
    </template>
  </AutoComplete>
</template>