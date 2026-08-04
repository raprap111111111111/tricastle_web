<script setup lang="ts">
import Dialog from 'primevue/dialog'

defineProps<{
  visible: boolean
  oldValues: Record<string, any> | null
  newValues: Record<string, any> | null
}>()

defineEmits<{
  (e: 'update:visible', v: boolean): void
}>()

function keys(a: Record<string, any> | null, b: Record<string, any> | null): string[] {
  return Array.from(new Set([...(a ? Object.keys(a) : []), ...(b ? Object.keys(b) : [])]))
}

function format(val: any): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'object') return JSON.stringify(val, null, 2)
  return String(val)
}
</script>

<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :draggable="false"
    :style="{ width: '700px' }"
    header="Changes"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-3">
      <div
        v-for="key in keys(oldValues, newValues)"
        :key="key"
        class="border border-appleCore-100 rounded-lg p-3"
      >
        <p class="text-xs font-semibold text-blueberry-700 uppercase mb-2">{{ key }}</p>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-red-50 p-2 rounded font-mono text-red-700 whitespace-pre-wrap break-all">
            {{ format(oldValues?.[key]) }}
          </div>
          <div class="bg-green-50 p-2 rounded font-mono text-green-700 whitespace-pre-wrap break-all">
            {{ format(newValues?.[key]) }}
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>