<!-- src/shared/ui/export/ExcelExportButton.vue -->

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { useToast } from 'primevue/usetoast'

import {
  exportSingleApplicant,
  exportByBatch,
  exportByLocation,
  exportByStatus,
  exportApplicantList,
} from '@shared/utils/excel-export'

// ─── Props ────────────────────────────────────────────────────────────────────

const props = withDefaults(
  defineProps<{
    /** Single applicant object (detail page) */
    applicant?: any
    /** List of applicants (index / batch page) */
    applicants?: any[]
    /** Pre-select export mode */
    mode?: 'single' | 'batch' | 'location' | 'status' | 'list'
    /** Context metadata */
    batchId?:   number
    batchName?: string
    location?:  string
    status?:    string
    /** ✅ NEW — column keys selected from the picker (optional) */
    columnKeys?: string[]
    /** Label override */
    label?:     string
    /** Optional disabled flag (e.g. when 0 columns selected) */
    disabled?:  boolean
  }>(),
  {
    label:      'Export',
    mode:       'list',
    applicants: () => [],
    disabled:   false,
  },
)

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  exported: []
}>()

// ─── Setup ────────────────────────────────────────────────────────────────────

const toast   = useToast()
const menu    = ref()
const loading = ref(false)

// ─── Menu Items ───────────────────────────────────────────────────────────────

const menuItems = computed(() => {
  // ── Single applicant page ──
  if (props.mode === 'single' && props.applicant) {
    return [
      {
        label:   'Export This Applicant',
        icon:    'pi pi-file-excel',
        command: () => doExport('single'),
      },
    ]
  }

  // ── List / index / batch pages ──
  return [
    {
      label: 'Export Options',
      items: [
        {
          label:   'All Applicants',
          icon:    'pi pi-users',
          command: () => doExport('list'),
        },
        {
          label:   'By Status (separate sheets)',
          icon:    'pi pi-tag',
          command: () => doExport('status'),
        },
        {
          label:   'By Location (separate sheets)',
          icon:    'pi pi-map-marker',
          command: () => doExport('location'),
        },
        ...(props.batchId
          ? [
              {
                label:   `By Batch: ${props.batchName ?? '#' + props.batchId}`,
                icon:    'pi pi-sitemap',
                command: () => doExport('batch'),
              },
            ]
          : []),
      ],
    },
  ]
})

// ─── Export Handler ───────────────────────────────────────────────────────────

async function doExport(mode: string): Promise<void> {
  loading.value = true

  try {
    switch (mode) {

      // ── Single applicant ──────────────────────────────────────────────────
      case 'single':
        if (!props.applicant) break
        exportSingleApplicant(props.applicant, props.columnKeys)
        toast.add({
          severity: 'success',
          summary:  'Exported',
          detail:   `Applicant ${props.applicant.applicant_code} exported successfully`,
          life:     3000,
        })
        emit('exported')
        break

      // ── By batch ──────────────────────────────────────────────────────────
      case 'batch':
        exportByBatch(
          props.applicants!,
          props.batchName ?? `Batch #${props.batchId}`,
          props.batchId!,
          props.columnKeys,
        )
        toast.add({
          severity: 'success',
          summary:  'Exported',
          detail:   `${props.batchName ?? 'Batch'} exported — ${props.applicants!.length} applicant${props.applicants!.length !== 1 ? 's' : ''}`,
          life:     3000,
        })
        emit('exported')
        break

      // ── By location ───────────────────────────────────────────────────────
      case 'location':
        exportByLocation(
          props.applicants!,
          props.location ?? 'All Locations',
          props.columnKeys,
        )
        toast.add({
          severity: 'success',
          summary:  'Exported',
          detail:   `Location export complete — ${props.applicants!.length} applicant${props.applicants!.length !== 1 ? 's' : ''}`,
          life:     3000,
        })
        emit('exported')
        break

      // ── By status ─────────────────────────────────────────────────────────
      case 'status':
        exportByStatus(props.applicants!, props.status, props.columnKeys)
        toast.add({
          severity: 'success',
          summary:  'Exported',
          detail:   `Status export complete — ${props.applicants!.length} applicant${props.applicants!.length !== 1 ? 's' : ''}`,
          life:     3000,
        })
        emit('exported')
        break

      // ── Generic list (default) ────────────────────────────────────────────
      default:
        exportApplicantList(
          props.applicants!,
          'applicants',
          'Applicants',
          props.columnKeys,
        )
        toast.add({
          severity: 'success',
          summary:  'Exported',
          detail:   `${props.applicants!.length} applicant${props.applicants!.length !== 1 ? 's' : ''} exported`,
          life:     3000,
        })
        emit('exported')
        break
    }
  } catch (err) {
    console.error('[ExcelExportButton] Export failed:', err)
    toast.add({
      severity: 'error',
      summary:  'Export Failed',
      detail:   'Something went wrong while generating the file. Please try again.',
      life:     5000,
    })
  } finally {
    loading.value = false
  }
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

/**
 * Single-mode → export immediately (no dropdown needed).
 * All other modes → open the popup menu.
 */
function toggle(event: MouseEvent): void {
  if (props.disabled) return

  if (props.mode === 'single' && props.applicant) {
    doExport('single')
  } else {
    menu.value?.toggle(event)
  }
}
</script>

<template>
  <div class="inline-flex">

    <!-- ─── Trigger Button ──────────────────────────────────────────────────── -->
    <Button
      :label="label"
      icon="pi pi-file-excel"
      severity="secondary"
      outlined
      :loading="loading"
      :disabled="disabled"
      @click="toggle"
    />

    <!-- ─── Popup Menu (list / batch / location / status modes) ────────────── -->
    <Menu
      v-if="mode !== 'single'"
      ref="menu"
      :model="menuItems"
      :popup="true"
    />

  </div>
</template>