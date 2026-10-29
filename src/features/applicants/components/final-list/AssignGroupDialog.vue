<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/features/auth/stores/auth.store'

interface BatchOption {
  label: string
  value: number | null
  isActive?: boolean
  applicantCount?: number
}

interface GroupOption {
  id: number
  name: string
  color: string
  max_slots: number | null
  applicant_count: number
}

const props = defineProps<{
  visible: boolean
  selectedCount: number
  batchOptions: BatchOption[]
  defaultBatchId?: number | null
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [payload: { batchId: number; groupId: number }]
}>()

const toast = useToast()
const authStore = useAuthStore()

// ⚡ Resolve base API URL (e.g. http://localhost:8089/api/v1)
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8089/api/v1').replace(/\/+$/, '')

const selectedBatchId = ref<number | null>(props.defaultBatchId ?? null)
const selectedGroupId = ref<number | null>(null)
const availableGroups = ref<GroupOption[]>([])
const loadingGroups = ref(false)

// ─── Inline Create Group State ────────────────────────────────────────────────
const showCreateInline = ref(false)
const newGroupName = ref('')
const newGroupColor = ref('blue')
const newGroupMaxSlots = ref<number | null>(null)
const creatingGroup = ref(false)

const colorOptions = [
  { label: 'Blue', value: 'blue', hex: '#3b82f6' },
  { label: 'Green', value: 'green', hex: '#22c55e' },
  { label: 'Purple', value: 'purple', hex: '#a855f7' },
  { label: 'Amber', value: 'amber', hex: '#f59e0b' },
  { label: 'Red', value: 'red', hex: '#ef4444' },
]

function getAuthToken(): string {
  return authStore.token || localStorage.getItem('access_token') || ''
}

// Fetch groups when batch selection changes
async function fetchGroups(batchId: number) {
  loadingGroups.value = true
  try {
    const token = getAuthToken()
    const url = `${API_BASE}/batches/${batchId}/groups`

    const res = await axios.get(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    })
    availableGroups.value = res.data?.data ?? res.data ?? []
  } catch (err: any) {
    console.error('Failed to load batch groups:', err)
    availableGroups.value = []
  } finally {
    loadingGroups.value = false
  }
}

watch(
  selectedBatchId,
  async (batchId) => {
    selectedGroupId.value = null
    availableGroups.value = []
    showCreateInline.value = false
    if (!batchId) return
    await fetchGroups(batchId)
  },
  { immediate: true }
)

// ─── Save New Group ───────────────────────────────────────────────────────────
async function handleCreateGroup() {
  if (!selectedBatchId.value || !newGroupName.value.trim()) return

  creatingGroup.value = true
  try {
    const token = getAuthToken()
    const url = `${API_BASE}/batches/${selectedBatchId.value}/groups`

    const res = await axios.post(
      url,
      {
        name: newGroupName.value.trim(),
        color: newGroupColor.value,
        max_slots: newGroupMaxSlots.value,
      },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      }
    )

    const createdGroup = res.data?.data ?? res.data

    toast.add({
      severity: 'success',
      summary: 'Group Created',
      detail: `Group "${createdGroup.name}" created successfully.`,
      life: 3000,
    })

    // Reset inline form
    newGroupName.value = ''
    newGroupMaxSlots.value = null
    showCreateInline.value = false

    // Reload groups and auto-select newly created group
    await fetchGroups(selectedBatchId.value)
    if (createdGroup?.id) {
      selectedGroupId.value = createdGroup.id
    }
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || 'Could not create group.'
    toast.add({
      severity: 'error',
      summary: 'Creation Failed',
      detail: message,
      life: 4000,
    })
  } finally {
    creatingGroup.value = false
  }
}

function handleClose() {
  emit('update:visible', false)
}

function handleSubmit() {
  if (!selectedBatchId.value || !selectedGroupId.value) return
  emit('submit', {
    batchId: selectedBatchId.value,
    groupId: selectedGroupId.value,
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    header="🏷️ Assign Applicants to Batch Group"
    :modal="true"
    :style="{ width: '480px' }"
    class="p-fluid"
    @update:visible="handleClose"
  >
    <div class="flex flex-col gap-4 pt-2">
      <Message severity="info" :closable="false" class="!m-0 border border-blue-200">
        <div class="text-sm">
          You are assigning <strong>{{ selectedCount }}</strong> applicant(s) to a group.
        </div>
      </Message>

      <!-- Select Batch -->
      <div class="space-y-1.5 flex flex-col">
        <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">
          Select Target Batch <span class="text-red-500">*</span>
        </label>
        <Dropdown
          v-model="selectedBatchId"
          :options="batchOptions.filter(b => b.value !== null)"
          optionLabel="label"
          optionValue="value"
          placeholder="Choose a batch..."
          filter
          class="w-full"
        />
      </div>

      <!-- Select Group OR Inline Create -->
      <div v-if="selectedBatchId" class="space-y-2 flex flex-col">
        <div class="flex items-center justify-between">
          <label class="text-xs font-semibold text-blueberry-700 uppercase tracking-wide">
            Select Group <span class="text-red-500">*</span>
          </label>

          <!-- Toggle Create Form Link -->
          <button
            type="button"
            class="text-xs font-bold text-apricot-600 hover:text-apricot-700 flex items-center gap-1 cursor-pointer"
            @click="showCreateInline = !showCreateInline"
          >
            <i :class="showCreateInline ? 'pi pi-arrow-left' : 'pi pi-plus-circle'" />
            {{ showCreateInline ? 'Back to Selection' : '+ Create New Group' }}
          </button>
        </div>

        <!-- ──────────────── INLINE CREATE FORM ──────────────── -->
        <div
          v-if="showCreateInline"
          class="p-4 bg-appleCore-50 border border-appleCore-200 rounded-xl space-y-3 animate-fadeIn"
        >
          <p class="text-xs font-bold text-blueberry-900 uppercase tracking-wider">
            Create Group for Selected Batch
          </p>

          <div class="space-y-1">
            <label class="text-xs font-medium text-blueberry-700">Group Name *</label>
            <InputText
              v-model="newGroupName"
              placeholder="e.g. Group A, Alpha Team"
              class="w-full text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-blueberry-700">Badge Color</label>
              <Dropdown
                v-model="newGroupColor"
                :options="colorOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full text-sm"
              >
                <template #option="slotProps">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: slotProps.option.hex }"></span>
                    <span>{{ slotProps.option.label }}</span>
                  </div>
                </template>
              </Dropdown>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-medium text-blueberry-700">Max Slots (Optional)</label>
              <InputNumber
                v-model="newGroupMaxSlots"
                placeholder="No limit"
                :min="1"
                class="w-full text-sm"
              />
            </div>
          </div>

          <Button
            label="Save & Select Group"
            icon="pi pi-check"
            class="!bg-blueberry-900 hover:!bg-blueberry-800 !border-none !text-white !text-xs !font-bold w-full mt-2"
            :loading="creatingGroup"
            :disabled="!newGroupName.trim()"
            @click="handleCreateGroup"
          />
        </div>

        <!-- ──────────────── DROPDOWN SELECT ──────────────── -->
        <template v-else>
          <Dropdown
            v-model="selectedGroupId"
            :options="availableGroups"
            optionLabel="name"
            optionValue="id"
            :placeholder="
              loadingGroups 
                ? 'Loading groups...' 
                : availableGroups.length === 0 
                  ? 'No groups in this batch yet' 
                  : 'Choose a group...'
            "
            :disabled="loadingGroups || availableGroups.length === 0"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-2">
                  <span 
                    class="w-2.5 h-2.5 rounded-full shrink-0" 
                    :style="{ backgroundColor: slotProps.option.color || '#3b82f6' }"
                  ></span>
                  <span class="font-medium text-sm text-blueberry-900">{{ slotProps.option.name }}</span>
                </div>
                <span class="text-xs text-blueberry-500 bg-appleCore-100 px-2 py-0.5 rounded-full font-semibold">
                  {{ slotProps.option.applicant_count }} {{ slotProps.option.max_slots ? `/ ${slotProps.option.max_slots}` : '' }} members
                </span>
              </div>
            </template>
          </Dropdown>

          <!-- Prompt button if no groups exist -->
          <div v-if="!loadingGroups && availableGroups.length === 0" class="text-center pt-1">
            <Button
              label="Create First Group for this Batch"
              icon="pi pi-plus"
              text
              class="!text-xs !font-bold !text-apricot-600 hover:!text-apricot-700"
              @click="showCreateInline = true"
            />
          </div>
        </template>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 pt-3">
        <Button label="Cancel" icon="pi pi-times" text class="!text-blueberry-600" @click="handleClose" />
        <Button
          label="Assign Group"
          icon="pi pi-check"
          class="!bg-apricot-500 hover:!bg-apricot-600 !border-none !text-white !font-bold"
          :loading="submitting"
          :disabled="!selectedBatchId || !selectedGroupId || showCreateInline"
          @click="handleSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>