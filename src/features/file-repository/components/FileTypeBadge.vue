<!-- src/features/file-repository/components/FileTypeBadge.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  mimeType: string
}>()

interface BadgeConfig {
  label: string
  icon:  string
  classes: string
}

const config = computed((): BadgeConfig => {
  const m = props.mimeType?.toLowerCase() ?? ''

  if (m === 'application/pdf')
    return {
      label:   'PDF',
      icon:    'pi pi-file-pdf',
      classes: 'bg-red-50 text-red-600 border-red-200',
    }

  if (m.startsWith('image/'))
    return {
      label:   'Image',
      icon:    'pi pi-image',
      classes: 'bg-apricot-50 text-apricot-600 border-apricot-200',
    }

  if (m.includes('word') || m.includes('document'))
    return {
      label:   'Word',
      icon:    'pi pi-file',
      classes: 'bg-blue-50 text-blue-600 border-blue-200',
    }

  if (m.includes('sheet') || m.includes('excel'))
    return {
      label:   'Excel',
      icon:    'pi pi-file-excel',
      classes: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    }

  if (m.includes('zip') || m.includes('rar') || m.includes('7z'))
    return {
      label:   'Archive',
      icon:    'pi pi-box',
      classes: 'bg-appleCore-50 text-blueberry-600 border-appleCore-200',
    }

  if (m.startsWith('video/'))
    return {
      label:   'Video',
      icon:    'pi pi-video',
      classes: 'bg-purple-50 text-purple-600 border-purple-200',
    }

  return {
    label:   'File',
    icon:    'pi pi-file',
    classes: 'bg-appleCore-50 text-blueberry-500 border-appleCore-200',
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium',
      'rounded-full border',
      config.classes,
    ]"
  >
    <i :class="[config.icon, 'text-[10px]']" />
    {{ config.label }}
  </span>
</template>