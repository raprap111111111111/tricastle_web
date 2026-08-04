<!-- src/features/correction-approvals/components/CorrectionApprovalActionMenu.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import type { CorrectionApproval } from '../types'

const props = defineProps<{ record: CorrectionApproval }>()

const emit = defineEmits<{
  (e: 'view', record: CorrectionApproval): void
  (e: 'approve', record: CorrectionApproval): void
  (e: 'reject', record: CorrectionApproval): void
  (e: 'escalate', record: CorrectionApproval): void
  (e: 'delete', record: CorrectionApproval): void
}>()

const menu = ref()

const items = computed(() => {
  const d = props.record.decision
  const base: any[] = [
    {
      label: 'View',
      icon: 'pi pi-eye',
      command: () => emit('view', props.record),
    },
  ]

  if (d === 'pending') {
    base.push(
      { separator: true },
      {
        label: 'Approve',
        icon: 'pi pi-check',
        class: 'text-emerald-600',
        command: () => emit('approve', props.record),
      },
      {
        label: 'Reject',
        icon: 'pi pi-times',
        class: 'text-red-600',
        command: () => emit('reject', props.record),
      },
      {
        label: 'Escalate',
        icon: 'pi pi-arrow-up-right',
        class: 'text-blue-600',
        command: () => emit('escalate', props.record),
      },
    )
  }

  base.push(
    { separator: true },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      class: 'text-red-500',
      command: () => emit('delete', props.record),
    },
  )

  return base
})

function toggle(e: Event) {
  e.stopPropagation()
  menu.value?.toggle(e)
}
</script>

<template>
  <div @click.stop>
    <Button
      icon="pi pi-ellipsis-v"
      size="small"
      text
      rounded
      severity="secondary"
      aria-haspopup="true"
      @click="toggle"
    />
    <Menu ref="menu" :model="items" popup append-to="body" />
  </div>
</template>