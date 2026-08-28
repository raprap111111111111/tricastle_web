<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { AppButton, AppCard } from '@shared/ui'
import { useAuthStore } from '@features/auth/stores/auth.store'
import { useUserFormatters } from '@/features/users/composables/useUserFormatters'
import { useProfile } from '../composables/useProfile'

const router = useRouter()
const auth = useAuthStore()
const { user } = storeToRefs(auth)

// Use the profile composable for saving and error handling
const { isSaving, error, handleUpdateProfile } = useProfile()
const { initials } = useUserFormatters(user)

// Avatar upload state
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)

// Reusable input styling class
const inputClass =
  'w-full rounded-lg border border-appleCore-100 bg-white px-3 py-2 text-sm text-blueberry-800 shadow-sm outline-none focus:border-apricot-400 focus:ring-2 focus:ring-apricot-200'

const form = reactive({
  first_name: '',
  middle_name: '' as string | null,
  last_name: '',
  suffix: '' as string | null,
  email: '',
  phone: '' as string | null,
  mobile: '' as string | null,
  date_of_birth: '' as string | null,
  gender: '' as string | null,
  department: '' as string | null,
  position: '' as string | null,
  address: '' as string | null,
  city: '' as string | null,
  province: '' as string | null,
  country: 'Philippines' as string | null,
  postal_code: '' as string | null,
  bio: '' as string | null,
  avatar: null as File | null, // Added avatar to form
})

function hydrateFromUser() {
  if (!user.value) return
  const u = user.value
  form.first_name = u.first_name ?? ''
  form.middle_name = u.middle_name ?? ''
  form.last_name = u.last_name ?? ''
  form.suffix = u.suffix ?? ''
  form.email = u.email ?? ''
  form.phone = u.phone ?? ''
  form.mobile = u.mobile ?? ''
  form.date_of_birth = u.date_of_birth ? String(u.date_of_birth).slice(0, 10) : ''
  form.gender = u.gender ?? ''
  form.department = u.department ?? ''
  form.position = u.position ?? ''
  form.address = u.address ?? ''
  form.city = u.city ?? ''
  form.province = u.province ?? ''
  form.country = u.country ?? 'Philippines'
  form.postal_code = u.postal_code ?? ''
  form.bio = (u as any).bio ?? ''
  
  // Set current avatar preview
  avatarPreview.value = u.avatar ?? null
}

watch(user, hydrateFromUser, { immediate: true })

onMounted(async () => {
  if (!user.value) {
    try {
      await auth.fetchProfile()
    } catch {
      /* store clears on fail */
    }
  } else {
    hydrateFromUser()
  }
})

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    form.avatar = file
    // Create a local URL to preview the selected image immediately
    avatarPreview.value = URL.createObjectURL(file)
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function onSubmit() {
  // handleUpdateProfile handles the API call, toast notifications, and redirects on success
  await handleUpdateProfile(form)
}

function onCancel() {
  router.push({ name: 'Profile' })
}
</script>

<template>
  <div class="flex flex-col gap-8 p-8 max-w-[900px] mx-auto">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-serif font-semibold text-blueberry-800 tracking-tight">
          Edit Profile
        </h1>
        <p class="text-sm text-blueberry-500 mt-1">
          Update your personal, contact information, and photo
        </p>
      </div>
      <AppButton
        label="Back to Profile"
        icon="pi pi-arrow-left"
        variant="secondary"
        outlined
        @click="onCancel"
      />
    </header>

    <div v-if="!user" class="text-center py-16">
      <i class="pi pi-spin pi-spinner text-3xl text-apricot-500" />
    </div>

    <form v-else class="flex flex-col gap-6" @submit.prevent="onSubmit">
      
      <!-- API Error Alert -->
      <div
        v-if="error"
        class="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3"
      >
        {{ error }}
      </div>

      <!-- Avatar Upload Section -->
      <AppCard padding="normal" shadow="soft">
        <div class="flex items-center gap-6">
          <div 
            class="w-24 h-24 rounded-full bg-apricot-500 text-white flex items-center justify-center text-3xl font-bold shadow-md flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            @click="triggerFileInput"
          >
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              class="w-full h-full object-cover"
              alt="Avatar Preview"
            />
            <span v-else>{{ initials }}</span>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-blueberry-800 mb-1">Profile Picture</h3>
            <p class="text-xs text-blueberry-500 mb-3">
              JPG, GIF or PNG. Max size of 2MB.
            </p>
            <AppButton
              type="button"
              label="Change Photo"
              icon="pi pi-upload"
              variant="secondary"
              outlined
              @click="triggerFileInput"
            />
            <!-- Hidden File Input -->
            <input 
              ref="fileInput"
              type="file" 
              accept="image/jpeg, image/png, image/gif" 
              class="hidden" 
              @change="onFileChange" 
            />
          </div>
        </div>
      </AppCard>

      <!-- Personal Information -->
      <AppCard padding="normal" shadow="soft">
        <template #header>
          <h3 class="text-sm font-semibold text-blueberry-800 flex items-center gap-2">
            <i class="pi pi-user text-apricot-500" />
            Personal Information
          </h3>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">First name</span>
            <input v-model="form.first_name" required :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Middle name</span>
            <input v-model="form.middle_name" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Last name</span>
            <input v-model="form.last_name" required :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Suffix</span>
            <input v-model="form.suffix" placeholder="Jr., Sr., III" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Date of birth</span>
            <input v-model="form.date_of_birth" type="date" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Gender</span>
            <select v-model="form.gender" :class="inputClass">
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
      </AppCard>

      <!-- Contact -->
      <AppCard padding="normal" shadow="soft">
        <template #header>
          <h3 class="text-sm font-semibold text-blueberry-800 flex items-center gap-2">
            <i class="pi pi-envelope text-apricot-500" />
            Contact
          </h3>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="flex flex-col gap-1.5 sm:col-span-2">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Email</span>
            <input v-model="form.email" type="email" required :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Phone</span>
            <input v-model="form.phone" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Mobile</span>
            <input v-model="form.mobile" :class="inputClass" />
          </label>
        </div>
      </AppCard>

      <!-- Employment -->
      <AppCard padding="normal" shadow="soft">
        <template #header>
          <h3 class="text-sm font-semibold text-blueberry-800 flex items-center gap-2">
            <i class="pi pi-briefcase text-apricot-500" />
            Employment
          </h3>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Department</span>
            <input v-model="form.department" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Position</span>
            <input v-model="form.position" :class="inputClass" />
          </label>
        </div>
      </AppCard>

      <!-- Address -->
      <AppCard padding="normal" shadow="soft">
        <template #header>
          <h3 class="text-sm font-semibold text-blueberry-800 flex items-center gap-2">
            <i class="pi pi-map-marker text-apricot-500" />
            Address
          </h3>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="flex flex-col gap-1.5 sm:col-span-2">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Street address</span>
            <input v-model="form.address" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">City</span>
            <input v-model="form.city" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Province</span>
            <input v-model="form.province" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Country</span>
            <input v-model="form.country" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-blueberry-400 uppercase tracking-wider">Postal code</span>
            <input v-model="form.postal_code" :class="inputClass" />
          </label>
        </div>
      </AppCard>

      <!-- Form Actions -->
      <div class="flex flex-wrap justify-end gap-2 pt-2">
        <AppButton
          type="button"
          label="Cancel"
          variant="secondary"
          outlined
          :disabled="isSaving"
          @click="onCancel"
        />
        <AppButton
          type="submit"
          label="Save changes"
          icon="pi pi-check"
          variant="accent"
          :loading="isSaving"
        />
      </div>
    </form>
  </div>
</template>