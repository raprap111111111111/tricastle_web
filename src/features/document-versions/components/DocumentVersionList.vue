<!-- src/features/document-versions/components/DocumentVersionList.vue -->
<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import DocumentVersionCard from './DocumentVersionCard.vue'
import type { DocumentVersion } from '../types'

defineProps<{
  versions:    DocumentVersion[]
  loading?:    boolean
  canRestore?: boolean
  canDelete?:  boolean
}>()

const emit = defineEmits<{
  (e: 'view',    id: number): void
  (e: 'restore', id: number): void
  (e: 'delete',  id: number): void
}>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <template v-if="loading">
      <Skeleton v-for="n in 3" :key="n" height="80px" border-radius="16px" />
    </template>

    <template v-else-if="!versions.length">
      <div class="text-center py-12 border border-dashed border-appleCore-200 rounded-2xl">
        <i class="pi pi-inbox text-4xl text-blueberry-300 mb-3 block" />
        <p class="text-blueberry-500">No versions available</p>
      </div>
    </template>

    <template v-else>
      <DocumentVersionCard
        v-for="v in versions"
        :key="v.id"
        :version="v"
        :can-restore="canRestore"
        :can-delete="canDelete"
        @view="(id) => emit('view', id)"
        @restore="(id) => emit('restore', id)"
        @delete="(id) => emit('delete', id)"
      />
    </template>
  </div>
</template>