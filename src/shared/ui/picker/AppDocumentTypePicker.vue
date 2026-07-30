<!-- src/shared/ui/picker/AppDocumentTypePicker.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import AutoComplete, {
  type AutoCompleteCompleteEvent,
  type AutoCompleteOptionSelectEvent,
} from 'primevue/autocomplete'
import { useDocumentTypeStore } from '@features/document-types/stores/documentType.store'
import type {
  DocumentType,
  DocumentTypeCategory,
} from '@features/document-types/types'

const props = withDefaults(
  defineProps<{
    modelValue:   number | null
    placeholder?: string
    disabled?:    boolean
    invalid?:     boolean
    debounceMs?:  number
    resultLimit?: number
    /** Restrict suggestions to a single category (primary / supporting) */
    category?:    DocumentTypeCategory | null
    /** Only show active types (default true) */
    activeOnly?:  boolean
    /** Only show required types */
    requiredOnly?: boolean
  }>(),
  {
    placeholder:  'Search document type by name or code…',
    disabled:     false,
    invalid:      false,
    debounceMs:   250,
    resultLimit:  20,
    category:     null,
    activeOnly:   true,
    requiredOnly: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
  (e: 'select', type: DocumentType): void
  (e: 'clear'): void
}>()

const store = useDocumentTypeStore()

const selected    = ref<DocumentType | null>(null)
const suggestions = ref<DocumentType[]>([])
const loading     = ref(false)

// ─── Pre-load if we already have an ID ───────────────────────────────────────
onMounted(async () => {
  if (props.modelValue != null) await loadById(props.modelValue)
})

// ─── Sync external prop changes ──────────────────────────────────────────────
watch(
  () => props.modelValue,
  async (id) => {
    if (id == null) {
      selected.value = null
    } else if (selected.value?.id !== id) {
      await loadById(id)
    }
  },
)

async function loadById(id: number) {
  // 1. Try local cache first (avoid a round-trip if we already have it)
  const cached = store.typeById(id)
  if (cached) {
    selected.value = cached
    return
  }

  // 2. Fallback: fetch from API
  try {
    await store.fetchType(id)
    if (store.type?.id === id) selected.value = store.type
  } catch {
    /* silent */
  }
}

// ─── Debounced search ────────────────────────────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function onComplete(event: AutoCompleteCompleteEvent) {
  const query = event.query.trim()

  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    loading.value = true
    try {
      // Snapshot current store filters so we don't pollute the list view
      const backup = { ...store.filters }

      store.setFilters({
        search:      query,
        category:    props.category,
        active_only: props.activeOnly   ? true : null,
        required_only: props.requiredOnly ? true : null,
      })
      store.filters.limit = props.resultLimit
      await store.fetchTypes()
      suggestions.value = [...store.types]

      // Restore prior filters
      store.filters = backup
    } finally {
      loading.value = false
    }
  }, props.debounceMs)
}

// ─── Select / Clear ──────────────────────────────────────────────────────────
function onSelect(event: AutoCompleteOptionSelectEvent) {
  const t = event.value as DocumentType
  selected.value = t
  emit('update:modelValue', t.id)
  emit('select', t)
}

function onClear() {
  selected.value = null
  emit('update:modelValue', null)
  emit('clear')
}

// ─── Formatters ──────────────────────────────────────────────────────────────
function typeLabel(t: DocumentType | null | undefined): string {
  return t?.name ?? ''
}

const categoryStyles: Record<DocumentTypeCategory, string> = {
  primary:    'bg-apricot-50 text-apricot-700',
  supporting: 'bg-blueberry-50 text-blueberry-700',
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
    :option-label="typeLabel"
    :force-selection="false"
    :complete-on-focus="true"
    :delay="0"
    class="w-full"
    :input-props="{
      autocomplete:     'off',
      autocorrect:      'off',
      autocapitalize:   'off',
      spellcheck:       false,
      name:             'document-type-picker-search',
      'data-lpignore':  'true',
      'data-form-type': 'other',
    }"
    :pt="{
      pcInputText: { root: 'w-full' },
    }"
    @complete="onComplete"
    @option-select="onSelect"
    @clear="onClear"
  >
    <!-- Selected chip -->
    <template #chip="{ value }">
      <span class="text-sm text-blueberry-800">
        {{ typeLabel(value) }}
      </span>
    </template>

    <!-- Dropdown item -->
    <template #option="{ option }">
      <div class="flex items-center gap-3 py-1">
        <div
          class="w-9 h-9 rounded-xl bg-apricot-50 text-apricot-600
                 flex items-center justify-center flex-shrink-0"
        >
          <i class="pi pi-tag text-sm" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-blueberry-800 truncate">
              {{ option.name }}
            </p>
            <span
              v-if="option.is_required"
              class="text-[10px] font-bold uppercase tracking-wide
                     text-red-600 bg-red-50 px-1.5 py-0.5 rounded"
            >
              Required
            </span>
          </div>

          <div class="flex items-center gap-2 text-xs mt-0.5">
            <span
              class="font-mono text-apricot-600 font-semibold
                     bg-apricot-50 px-1.5 py-0.5 rounded"
            >
              {{ option.code }}
            </span>
            <span
              class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
              :class="categoryStyles[option.category as DocumentTypeCategory]"
            >
              {{ option.category }}
            </span>
            <span
              v-if="option.validity_days"
              class="text-blueberry-400"
            >
              · {{ option.validity_days }}d validity
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
          No document types found. Try a different search.
        </p>
      </div>
    </template>
  </AutoComplete>
</template>