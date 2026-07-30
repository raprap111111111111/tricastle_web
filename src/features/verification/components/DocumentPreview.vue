<script setup lang="ts">
import Button from 'primevue/button';

const props = defineProps<{
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
}>();

const isImage = () => props.mimeType?.startsWith('image/');
const isPdf = () => props.mimeType === 'application/pdf';
</script>

<template>
  <div class="bg-white border rounded-lg overflow-hidden h-full flex flex-col">
    <div class="p-3 border-b bg-gray-50 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i class="pi pi-file text-gray-500" />
        <span class="text-sm font-medium truncate">{{ fileName || 'Document' }}</span>
      </div>
      <a v-if="fileUrl" :href="fileUrl" target="_blank" rel="noopener">
        <Button icon="pi pi-external-link" text size="small" />
      </a>
    </div>

    <div class="flex-1 min-h-[500px] bg-gray-100 flex items-center justify-center">
      <template v-if="!fileUrl">
        <div class="text-center text-gray-400">
          <i class="pi pi-image text-4xl mb-2" />
          <p>No document available</p>
        </div>
      </template>
      <img
        v-else-if="isImage()"
        :src="fileUrl"
        :alt="fileName || 'document'"
        class="max-w-full max-h-[700px] object-contain"
      />
      <iframe
        v-else-if="isPdf()"
        :src="fileUrl"
        class="w-full h-[700px]"
        frameborder="0"
      />
      <div v-else class="text-center text-gray-500 p-8">
        <i class="pi pi-file text-4xl mb-2" />
        <p class="mb-3">{{ fileName }}</p>
        <a :href="fileUrl" target="_blank" rel="noopener">
          <Button icon="pi pi-download" label="Download" size="small" />
        </a>
      </div>
    </div>
  </div>
</template>