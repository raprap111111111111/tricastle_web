// src/features/applicants/composables/useExcelExportDialog.ts

import { ref, computed, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import {
  ALL_COLUMNS,
  DEFAULT_COLUMN_KEYS,
  COLUMN_PRESETS,
  exportByBatch,
  exportByLocation,
  exportByStatus,
  exportApplicantList,
  type ExcelColumn,
} from '@shared/utils/excel-export'

export type ExportScope = 'current' | 'batch' | 'location' | 'status'

export function useExcelExportDialog(
  storeApplicants:      Ref<any[]>,
  filteredApplicants:   Ref<any[]>,
  availableBatches:     Ref<any[]>,
  selectedBatchId:      Ref<number | null>,
  appliedAdvanced:      Ref<any>,
) {
  const toast = useToast()

  const showExportDialog = ref(false)
  const exportScope    = ref<ExportScope>('current')
  const exportBatchId  = ref<number | null>(null)
  const exportLocation = ref<string>('')
  const exportStatus   = ref<string>('')
  const exporting      = ref(false)

  const selectedColumnKeys = ref<string[]>([...DEFAULT_COLUMN_KEYS])

  const columnGroups = computed(() => {
    const groups: Record<string, ExcelColumn[]> = {}
    ALL_COLUMNS.forEach((col) => {
      const g = col.group ?? 'Other'
      ;(groups[g] = groups[g] ?? []).push(col)
    })
    return Object.entries(groups).map(([name, columns]) => ({ name, columns }))
  })

  function toggleColumn(key: string): void {
    const idx = selectedColumnKeys.value.indexOf(key)
    if (idx >= 0) selectedColumnKeys.value.splice(idx, 1)
    else selectedColumnKeys.value.push(key)
  }

  function toggleGroup(groupName: string): void {
    const group = columnGroups.value.find((g) => g.name === groupName)
    if (!group) return
    const groupKeys  = group.columns.map((c) => c.key)
    const allChecked = groupKeys.every((k) => selectedColumnKeys.value.includes(k))
    if (allChecked) {
      selectedColumnKeys.value = selectedColumnKeys.value.filter((k) => !groupKeys.includes(k))
    } else {
      const merged = new Set([...selectedColumnKeys.value, ...groupKeys])
      selectedColumnKeys.value = Array.from(merged)
    }
  }

  function isGroupChecked(groupName: string): boolean {
    const group = columnGroups.value.find((g) => g.name === groupName)
    if (!group) return false
    return group.columns.every((c) => selectedColumnKeys.value.includes(c.key))
  }

  function isGroupPartial(groupName: string): boolean {
    const group = columnGroups.value.find((g) => g.name === groupName)
    if (!group) return false
    const some = group.columns.some((c) => selectedColumnKeys.value.includes(c.key))
    const all  = group.columns.every((c) => selectedColumnKeys.value.includes(c.key))
    return some && !all
  }

  function applyPreset(preset: keyof typeof COLUMN_PRESETS): void {
    selectedColumnKeys.value = [...COLUMN_PRESETS[preset]]
  }

  function selectAllColumns(): void {
    selectedColumnKeys.value = ALL_COLUMNS.map((c) => c.key)
  }

  function clearAllColumns(): void {
    selectedColumnKeys.value = []
  }

  const availableLocations = computed(() => {
    const set = new Set<string>()
    storeApplicants.value.forEach((a) => {
      if (a.province) set.add(a.province)
      if (a.city)     set.add(a.city)
    })
    return Array.from(set).sort()
  })

  const availableStatuses = computed(() => {
    const set = new Set<string>()
    storeApplicants.value.forEach((a) => {
      a.applicant_batches?.forEach((ab: any) => { if (ab.status) set.add(ab.status) })
      if (a.status) set.add(a.status)
    })
    return Array.from(set).sort()
  })

  const exportApplicants = computed(() => {
    switch (exportScope.value) {
      case 'current': return filteredApplicants.value
      case 'batch':
        if (!exportBatchId.value) return storeApplicants.value
        return storeApplicants.value.filter((a) =>
          a.applicant_batches?.some((ab: any) => ab.batch_id === exportBatchId.value),
        )
      case 'location':
        if (!exportLocation.value) return storeApplicants.value
        return storeApplicants.value.filter((a) => {
          const loc = exportLocation.value.toLowerCase()
          return (a.province ?? '').toLowerCase() === loc ||
                 (a.city ?? '').toLowerCase() === loc ||
                 (a.current_address ?? '').toLowerCase().includes(loc) ||
                 (a.permanent_address ?? '').toLowerCase().includes(loc)
        })
      case 'status':
        if (!exportStatus.value) return storeApplicants.value
        return storeApplicants.value.filter((a) =>
          a.status === exportStatus.value ||
          a.applicant_batches?.some((ab: any) => ab.status === exportStatus.value),
        )
      default: return filteredApplicants.value
    }
  })

  function openExportDialog() {
    exportScope.value        = 'current'
    exportBatchId.value      = selectedBatchId.value
    exportLocation.value     = appliedAdvanced.value.province ?? appliedAdvanced.value.city ?? ''
    exportStatus.value       = ''
    selectedColumnKeys.value = [...DEFAULT_COLUMN_KEYS]
    showExportDialog.value   = true
  }

  function closeExportDialog() { showExportDialog.value = false }

  async function handleDownload(): Promise<void> {
    if (selectedColumnKeys.value.length === 0) return
    if (exportApplicants.value.length === 0) return

    exporting.value = true
    try {
      switch (exportScope.value) {
        case 'batch':
          exportByBatch(
            exportApplicants.value,
            availableBatches.value.find((b) => b.id === exportBatchId.value)?.name ?? 'Final List',
            exportBatchId.value ?? 0,
            selectedColumnKeys.value,
          )
          break
        case 'location':
          exportByLocation(exportApplicants.value, exportLocation.value || 'Final List', selectedColumnKeys.value)
          break
        case 'status':
          exportByStatus(exportApplicants.value, exportStatus.value || undefined, selectedColumnKeys.value)
          break
        case 'current':
        default:
          exportApplicantList(exportApplicants.value, 'final_list', 'Final List', selectedColumnKeys.value)
          break
      }
      toast.add({
        severity: 'success',
        summary:  'Exported',
        detail:   `${exportApplicants.value.length} applicant${exportApplicants.value.length !== 1 ? 's' : ''} × ${selectedColumnKeys.value.length} columns exported`,
        life:     3000,
      })
      closeExportDialog()
    } catch (err) {
      console.error('[Export]', err)
      toast.add({ severity: 'error', summary: 'Export Failed', detail: 'Something went wrong.', life: 4000 })
    } finally {
      exporting.value = false
    }
  }

  return {
    showExportDialog, exportScope, exportBatchId, exportLocation, exportStatus,
    exporting, selectedColumnKeys, columnGroups,
    ALL_COLUMNS,
    availableLocations, availableStatuses, exportApplicants,
    toggleColumn, toggleGroup, isGroupChecked, isGroupPartial,
    applyPreset, selectAllColumns, clearAllColumns,
    openExportDialog, closeExportDialog, handleDownload,
  }
}