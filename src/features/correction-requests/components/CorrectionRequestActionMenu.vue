<!-- src/features/correction-requests/components/CorrectionRequestActionMenu.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import type { CorrectionRequest } from '../types'

const props = defineProps<{ record: CorrectionRequest }>()

const emit = defineEmits<{
  (e: 'view', record: CorrectionRequest): void
  (e: 'edit', record: CorrectionRequest): void
  (e: 'approve', record: CorrectionRequest): void
  (e: 'reject', record: CorrectionRequest): void
  (e: 'complete', record: CorrectionRequest): void
  (e: 'cancel', record: CorrectionRequest): void
  (e: 'delete', record: CorrectionRequest): void
}>()

const menu = ref()

const items = computed(() => {
  const s = props.record.status
  const base = [
    {
      label: 'View',
      icon: 'pi pi-eye',
      command: () => emit('view', props.record),
    },
  ]

  if (['pending', 'under_review'].includes(s)) {
    base.push({
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => emit('edit', props.record),
    })
  }

  if (s === 'under_review' && props.record.requires_approval) {
    base.push(
      { separator: true } as any,
      {
        label: 'Approve',
        icon: 'pi pi-check',
        command: () => emit('approve', props.record),
      },
      {
        label: 'Reject',
        icon: 'pi pi-times',
        command: () => emit('reject', props.record),
      },
    )
  }

  if (s === 'approved') {
    base.push({
      label: 'Mark Complete',
      icon: 'pi pi-check-circle',
      command: () => emit('complete', props.record),
    })
  }

  if (!['completed', 'cancelled', 'rejected'].includes(s)) {
    base.push(
      { separator: true } as any,
      {
        label: 'Cancel',
        icon: 'pi pi-ban',
        command: () => emit('cancel', props.record),
      },
    )
  }

  base.push(
    { separator: true } as any,
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => emit('delete', props.record),
    },
  )

  return base
})

function toggle(e: Event) {
  menu.value?.toggle(e)
}
</script>

<template>
  <div>
    <Button
      icon="pi pi-ellipsis-v"
      size="small"
      text
      rounded
      severity="secondary"
      @click="toggle"
    />
    <Menu ref="menu" :model="items" popup />
  </div>
</template>