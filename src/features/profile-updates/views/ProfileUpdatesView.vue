<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'

import { useProfileUpdates } from '../composables/useProfileUpdates'
import ProfileUpdatesTable from '../components/ProfileUpdatesTable.vue'
import ReviewUpdateDialog from '../components/ReviewUpdateDialog.vue'
import ProfileUpdateFilters from '../components/ProfileUpdateFilters.vue'
import type { ProfileUpdate } from '../types'

const toast = useToast()
const { store, handleApprove, handleDecline } = useProfileUpdates()

const dialogVisible = ref(false)
const selectedRequest = ref<ProfileUpdate | null>(null)

function handleRealtimeMessage(event: Event) {
  const newRequest = (event as CustomEvent).detail
  if (!newRequest) return

  store.addOrUpdateRealtimeItem(newRequest)

  toast.add({
    severity: 'info',
    summary: 'New Profile Request',
    detail: `Applicant ${newRequest.applicant_name || 'someone'} submitted a new update request.`,
    life: 5000,
  })
}

onMounted(() => {
  store.fetchUpdates()
  window.addEventListener('profile-update-submitted', handleRealtimeMessage as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('profile-update-submitted', handleRealtimeMessage as EventListener)
})

function openDialog(request: ProfileUpdate) {
  selectedRequest.value = request
  dialogVisible.value = true
}

async function onApprove(id: number) {
  const success = await handleApprove(id)
  if (success) dialogVisible.value = false
}

async function onDecline(id: number, reason: string) {
  const success = await handleDecline(id, reason)
  if (success) dialogVisible.value = false
}
</script>

<template>
  <div class="h-full flex flex-col space-y-4 p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-serif font-bold text-blueberry-800">Profile Update Requests</h1>
        <p class="text-sm text-blueberry-500">
          Review changes submitted by applicants via the portal.
        </p>
      </div>

      <!-- Status tabs -->
      <div class="flex bg-white rounded-lg shadow-sm p-1 border border-blueberry-100">
        <button
          v-for="st in (['pending', 'approved', 'declined'] as const)"
          :key="st"
          type="button"
          @click="store.setStatusFilter(st)"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors',
            store.filters.status === st
              ? 'bg-blueberry-50 text-blueberry-900 shadow-sm'
              : 'text-gray-500 hover:text-blueberry-700',
          ]"
        >
          {{ st }}
        </button>
      </div>
    </div>

    <!-- Wire the new filters component -->
    <ProfileUpdateFilters
      @filter="store.setAdvancedFilters"
      @reset="store.setAdvancedFilters({})"
    />

    <!-- Table -->
    <ProfileUpdatesTable
      :updates="store.updates"
      :pagination="store.pagination"
      :loading="store.loading"
      :status-filter="store.filters.status"
      @review="openDialog"
      @page-change="store.setPage"
      @limit-change="store.setLimit"
    />

    <ReviewUpdateDialog
      v-model:visible="dialogVisible"
      :request="selectedRequest"
      :loading="store.submitting"
      @approve="onApprove"
      @decline="onDecline"
    />
  </div>
</template>