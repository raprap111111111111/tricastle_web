<!-- src/features/verification-mismatches/components/VerificationMismatchActionMenu.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import type { VerificationMismatch } from '../types'

const props = defineProps<{ record: VerificationMismatch }>()

const emit = defineEmits<{
  (e: 'view', record: VerificationMismatch): void
  (e: 'resolve', record: VerificationMismatch): void
  (e: 'waive', record: VerificationMismatch): void
  (e: 'escalate', record: VerificationMismatch): void
  (e: 'delete', record: VerificationMismatch): void
}>()

const menu = ref()

const items = computed(() => {
  const s = props.record.status
  const base: any[] = [
    {
      label: 'View Details',
      icon: 'pi pi-eye',
      command: () => emit('view', props.record),
    },
  ]

  if (['open', 'correction_requested', 'escalated'].includes(s)) {
    base.push(
      { separator: true },
      {
        label: 'Mark as Resolved',
        icon: 'pi pi-check',
        command: () => emit('resolve', props.record),
      },
      {
        label: 'Waive Mismatch',
        icon: 'pi pi-ban',
        command: () => emit('waive', props.record),
      },
    )

    if (s !== 'escalated') {
      base.push({
        label: 'Escalate',
        icon: 'pi pi-arrow-up',
        command: () => emit('escalate', props.record),
      })
    }
  }

  base.push(
    { separator: true },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
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