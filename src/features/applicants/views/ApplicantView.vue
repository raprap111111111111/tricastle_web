<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { useApplicantStore } from '../stores/applicant.store'
import ApplicantStatusBadge from '../components/ApplicantStatusBadge.vue'

const props = defineProps<{ id: number }>()

const router = useRouter()
const store  = useApplicantStore()

onMounted(async () => {
  store.clearApplicant()
  await store.fetchApplicant(props.id)
})

const a = computed(() => store.applicant)

// ─── Formatters ────────────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

function display(val: any, fallback = '—'): string {
  if (val === null || val === undefined || val === '') return fallback
  return String(val)
}

function capitalize(val: string | null | undefined): string {
  if (!val) return '—'
  return val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ')
}

function gradeColor(grade: string): string {
  const map: Record<string, string> = {
    A: 'text-green-600 bg-green-50 ring-green-200',
    B: 'text-blue-600 bg-blue-50 ring-blue-200',
    C: 'text-yellow-600 bg-yellow-50 ring-yellow-200',
    D: 'text-orange-600 bg-orange-50 ring-orange-200',
    F: 'text-red-500 bg-red-50 ring-red-200',
  }
  return map[grade] ?? 'text-gray-600 bg-gray-50 ring-gray-200'
}

function getInitials(first?: string | null, last?: string | null): string {
  const f = first?.charAt(0) ?? ''
  const l = last?.charAt(0) ?? ''
  return (f + l).toUpperCase() || '?'
}

// ─── Batch pivot helpers ──────────────────────────────────
function batchPivot(batch: any) {
  return batch?.pivot ?? {}
}

function batchStatusColor(status?: string): string {
  const map: Record<string, string> = {
    applied:             'bg-blue-50 text-blue-700 ring-blue-200',
    shortlisted:         'bg-purple-50 text-purple-700 ring-purple-200',
    interview_scheduled: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    interview_passed:    'bg-green-50 text-green-700 ring-green-200',
    interview_failed:    'bg-red-50 text-red-700 ring-red-200',
    medical_pending:     'bg-yellow-50 text-yellow-700 ring-yellow-200',
    medical_passed:      'bg-green-50 text-green-700 ring-green-200',
    medical_failed:      'bg-red-50 text-red-700 ring-red-200',
    exam_pending:        'bg-yellow-50 text-yellow-700 ring-yellow-200',
    exam_passed:         'bg-green-50 text-green-700 ring-green-200',
    exam_failed:         'bg-red-50 text-red-700 ring-red-200',
    accepted:            'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected:            'bg-red-50 text-red-700 ring-red-200',
    withdrawn:           'bg-gray-50 text-gray-700 ring-gray-200',
    deployed:            'bg-indigo-50 text-indigo-700 ring-indigo-200',
  }
  return map[status ?? ''] ?? 'bg-gray-50 text-gray-700 ring-gray-200'
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
    <!-- Header Nav -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          @click="router.push({ name: 'applicants.index' })"
        />
        <div>
          <h1 class="text-2xl font-serif font-bold text-blueberry-800">
            Applicant Details
          </h1>
          <p v-if="a" class="text-sm text-blueberry-500">
            View complete applicant information
          </p>
        </div>
      </div>

      <div v-if="a" class="flex items-center gap-2">
        <Button
          label="Edit"
          icon="pi pi-pencil"
          severity="secondary"
          outlined
          @click="router.push({ name: 'applicants.edit', params: { id: a.id } })"
        />
      </div>
    </div>

    <!-- Loading -->
    <template v-if="store.loading">
      <Skeleton height="200px" border-radius="16px" />
      <Skeleton height="300px" border-radius="16px" />
      <Skeleton height="300px" border-radius="16px" />
    </template>

    <!-- Not Found -->
    <template v-else-if="!a">
      <div class="text-center py-16 text-blueberry-400">
        <i class="pi pi-exclamation-circle text-4xl mb-3" />
        <p>Applicant not found</p>
      </div>
    </template>

    <!-- Full Details -->
    <template v-else>
      <!-- ─── Profile Header Card ────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <div class="flex items-start gap-5">
          <!-- Avatar -->
          <div
            class="w-20 h-20 rounded-full bg-apricot-500 text-white
                   flex items-center justify-center flex-shrink-0
                   font-serif font-bold text-2xl"
          >
            {{ getInitials(a.first_name, a.last_name) }}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded">
                {{ a.applicant_code }}
              </span>
              <ApplicantStatusBadge :status="a.status" />
            </div>
            <h2 class="text-2xl font-serif font-semibold text-blueberry-800">
              {{ a.first_name }}
              {{ a.middle_name ? a.middle_name + ' ' : '' }}
              {{ a.last_name }}
              {{ a.suffix ?? '' }}
            </h2>
            <div class="flex flex-wrap gap-4 mt-2 text-sm text-blueberry-500">
              <span class="flex items-center gap-1.5">
                <i class="pi pi-envelope text-xs" />
                {{ a.email }}
              </span>
              <span v-if="a.phone" class="flex items-center gap-1.5">
                <i class="pi pi-phone text-xs" />
                {{ a.phone }}
              </span>
              <span v-if="a.nationality" class="flex items-center gap-1.5">
                <i class="pi pi-globe text-xs" />
                {{ a.nationality }}
              </span>
            </div>
          </div>

          <!-- Quality Score -->
          <div class="text-right flex-shrink-0">
            <p class="text-xs text-blueberry-400 uppercase font-medium tracking-wider">
              Quality Score
            </p>
            <p class="text-3xl font-serif font-bold text-blueberry-800 mt-1">
              {{ a.quality_score }}%
            </p>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ring-1 ring-inset mt-1"
              :class="gradeColor(a.quality_grade)"
            >
              Grade {{ a.quality_grade }}
            </span>
          </div>
        </div>

        <!-- Staff info -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-appleCore-100">
          <div>
            <p class="text-xs text-blueberry-400 uppercase tracking-wider">Assigned Staff</p>
            <p class="text-sm font-medium text-blueberry-800 mt-1">
              {{ a.assigned_staff?.name ?? '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-blueberry-400 uppercase tracking-wider">Created By</p>
            <p class="text-sm font-medium text-blueberry-800 mt-1">
              {{ a.creator?.name ?? '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-blueberry-400 uppercase tracking-wider">Created At</p>
            <p class="text-sm font-medium text-blueberry-800 mt-1">
              {{ formatDate(a.created_at) }}
            </p>
          </div>
        </div>
      </section>

      <!-- ─── Personal Information ────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-user text-apricot-500" />
          Personal Information
        </h3>

        <dl class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">First Name</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.first_name) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Middle Name</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.middle_name) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Last Name</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.last_name) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Suffix</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.suffix) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Email</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.email) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Phone</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.phone) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Mobile</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.mobile) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Date of Birth</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ formatDate(a.date_of_birth) }}
              <span v-if="a.age" class="text-blueberry-500 text-xs">({{ a.age }} yrs)</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Gender</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ capitalize(a.gender) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Civil Status</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ capitalize(a.civil_status) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Children</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ a.number_of_children ?? 0 }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Nationality</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.nationality) }}</dd>
          </div>
        </dl>
      </section>

      <!-- ─── Physical Information ────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-heart text-apricot-500" />
          Physical Information
        </h3>

        <dl class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Height</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ a.height_cm ? `${a.height_cm} cm` : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Weight</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">
              {{ a.weight_kg ? `${a.weight_kg} kg` : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Blood Type</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.blood_type) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Dominant Hand</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ capitalize(a.dominant_hand) }}</dd>
          </div>
        </dl>
      </section>

      <!-- ─── Address Information ─────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-map-marker text-apricot-500" />
          Address
        </h3>

        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Current Address</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.current_address) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Permanent Address</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.permanent_address) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">City</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.city) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Province</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.province) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Postal Code</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ display(a.postal_code) }}</dd>
          </div>
        </dl>
      </section>

      <!-- ─── Documents ────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-id-card text-apricot-500" />
          Documents & Government IDs
        </h3>

        <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Passport Number</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.passport_number) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Passport Expiry</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1">{{ formatDate(a.passport_expiry) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">SSS Number</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.sss_number) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">TIN Number</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.tin_number) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">PhilHealth Number</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.philhealth_number) }}</dd>
          </div>
          <div>
            <dt class="text-xs text-blueberry-400 uppercase tracking-wider">Pag-IBIG Number</dt>
            <dd class="text-sm font-medium text-blueberry-800 mt-1 font-mono">{{ display(a.pagibig_number) }}</dd>
          </div>
        </dl>
      </section>

      <!-- ─── Lifestyle ────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-shield text-apricot-500" />
          Lifestyle & Health
        </h3>

        <template v-if="a.lifestyle">
          <!-- Current habits -->
          <div class="mb-4">
            <p class="text-xs text-blueberry-400 uppercase tracking-wider mb-2">Current Habits</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-if="a.lifestyle.is_smoking"
                class="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium ring-1 ring-orange-200"
              >
                🚬 Smoking
                <span v-if="a.lifestyle.smoking_frequency" class="text-orange-500">
                  · {{ a.lifestyle.smoking_frequency }}
                </span>
              </span>
              <span
                v-if="a.lifestyle.is_drinking_alcohol"
                class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium ring-1 ring-blue-200"
              >
                🍺 Drinking
                <span v-if="a.lifestyle.drinking_frequency" class="text-blue-500">
                  · {{ a.lifestyle.drinking_frequency }}
                </span>
              </span>
              <span
                v-if="a.lifestyle.is_using_drugs"
                class="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium ring-1 ring-red-200"
              >
                💊 Drug Use
              </span>
              <span
                v-if="!a.lifestyle.is_smoking && !a.lifestyle.is_drinking_alcohol && !a.lifestyle.is_using_drugs"
                class="text-blueberry-400 italic text-sm"
              >
                No current habits reported
              </span>
            </div>
          </div>

          <!-- Past habits -->
          <div class="mb-4">
            <p class="text-xs text-blueberry-400 uppercase tracking-wider mb-2">Past Habits</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-if="a.lifestyle.was_smoking"
                class="px-3 py-1 bg-appleCore-50 text-blueberry-700 rounded-full text-xs font-medium"
              >Was smoking</span>
              <span
                v-if="a.lifestyle.was_drinking_alcohol"
                class="px-3 py-1 bg-appleCore-50 text-blueberry-700 rounded-full text-xs font-medium"
              >Was drinking</span>
              <span
                v-if="a.lifestyle.was_using_drugs"
                class="px-3 py-1 bg-appleCore-50 text-blueberry-700 rounded-full text-xs font-medium"
              >Was using drugs</span>
              <span
                v-if="!a.lifestyle.was_smoking && !a.lifestyle.was_drinking_alcohol && !a.lifestyle.was_using_drugs"
                class="text-blueberry-400 italic text-sm"
              >None</span>
            </div>
          </div>

          <!-- Health -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-appleCore-50/50 rounded-lg p-3">
              <div class="flex items-center gap-2 mb-1">
                <i
                  :class="a.lifestyle.has_medical_condition ? 'pi pi-exclamation-triangle text-red-500' : 'pi pi-check-circle text-green-500'"
                  class="text-sm"
                />
                <span class="text-xs font-semibold text-blueberry-700 uppercase tracking-wider">
                  Medical Condition
                </span>
              </div>
              <p class="text-sm text-blueberry-800">
                {{ a.lifestyle.has_medical_condition ? (a.lifestyle.medical_notes || 'Yes (no notes)') : 'None' }}
              </p>
            </div>

            <div class="bg-appleCore-50/50 rounded-lg p-3">
              <div class="flex items-center gap-2 mb-1">
                <i
                  :class="a.lifestyle.has_allergies ? 'pi pi-exclamation-triangle text-yellow-500' : 'pi pi-check-circle text-green-500'"
                  class="text-sm"
                />
                <span class="text-xs font-semibold text-blueberry-700 uppercase tracking-wider">
                  Allergies
                </span>
              </div>
              <p class="text-sm text-blueberry-800">
                {{ a.lifestyle.has_allergies ? (a.lifestyle.allergies_notes || 'Yes (no notes)') : 'None' }}
              </p>
            </div>
          </div>
        </template>

        <p v-else class="text-blueberry-400 italic text-sm">No lifestyle information recorded</p>
      </section>

      <!-- ─── Education ────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-book text-apricot-500" />
          Education
          <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">
            ({{ a.educations?.length ?? 0 }})
          </span>
        </h3>

        <div v-if="a.educations && a.educations.length > 0" class="space-y-3">
          <div
            v-for="edu in a.educations"
            :key="edu.id"
            class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-blueberry-800">{{ edu.school_name }}</p>
                <p class="text-sm text-blueberry-600 mt-0.5">
                  {{ capitalize(edu.education_level) }}
                  <span v-if="edu.course"> · {{ edu.course }}</span>
                </p>
                <div class="flex flex-wrap items-center gap-2 mt-2 text-xs text-blueberry-500">
                  <span
                    class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                  >
                    {{ capitalize(edu.education_status) }}
                  </span>
                  <span v-if="edu.year_started || edu.year_ended">
                    <i class="pi pi-calendar text-[10px] mr-1" />
                    {{ edu.year_started ?? '?' }} — {{ edu.year_ended ?? 'Present' }}
                  </span>
                  <span v-if="edu.honors" class="text-yellow-600 font-medium">
                    🏆 {{ edu.honors }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-blueberry-400 italic text-sm">No education records</p>
      </section>

      <!-- ─── Employment ───────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-briefcase text-apricot-500" />
          Employment History
          <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">
            ({{ a.employments?.length ?? 0 }})
          </span>
        </h3>

        <div v-if="a.employments && a.employments.length > 0" class="space-y-3">
          <div
            v-for="emp in a.employments"
            :key="emp.id"
            class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-blueberry-800">{{ emp.position }}</p>
                  <span
                    v-if="emp.is_current"
                    class="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium ring-1 ring-green-200"
                  >
                    Current
                  </span>
                </div>
                <p class="text-sm text-blueberry-600 mt-0.5">
                  {{ emp.company_name }}
                  <span v-if="emp.industry" class="text-blueberry-400"> · {{ emp.industry }}</span>
                </p>
                <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-blueberry-500">
                  <span>
                    <i class="pi pi-calendar text-[10px] mr-1" />
                    {{ formatDate(emp.date_started) }} — {{ emp.date_ended ? formatDate(emp.date_ended) : 'Present' }}
                  </span>
                  <span v-if="emp.city || emp.country">
                    <i class="pi pi-map-marker text-[10px] mr-1" />
                    {{ [emp.city, emp.country].filter(Boolean).join(', ') }}
                  </span>
                  <span v-if="emp.salary">
                    <i class="pi pi-money-bill text-[10px] mr-1" />
                    {{ emp.salary_currency }} {{ emp.salary.toLocaleString() }}
                  </span>
                </div>
                <p v-if="emp.job_description" class="text-sm text-blueberry-600 mt-2 leading-relaxed">
                  {{ emp.job_description }}
                </p>
                <p v-if="emp.reason_for_leaving" class="text-xs text-blueberry-500 mt-2 italic">
                  Reason for leaving: {{ emp.reason_for_leaving }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-blueberry-400 italic text-sm">No employment history</p>
      </section>

      <!-- ─── Tattoos ──────────────────────────────────── -->
      <section class="bg-white rounded-2xl border border-appleCore-100 p-6">
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-palette text-apricot-500" />
          Tattoo Records
          <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">
            ({{ a.tattoos?.length ?? 0 }})
          </span>
        </h3>

        <div v-if="a.tattoos && a.tattoos.length > 0" class="space-y-3">
          <div
            v-for="tattoo in a.tattoos"
            :key="tattoo.id"
            class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <p class="font-semibold text-blueberry-800">{{ tattoo.location }}</p>
                <div class="flex flex-wrap items-center gap-2 mt-1 text-xs text-blueberry-500">
                  <span v-if="tattoo.size" class="capitalize">
                    <i class="pi pi-info-circle text-[10px] mr-1" />
                    {{ tattoo.size }}
                  </span>
                  <span
                    :class="tattoo.is_visible ? 'text-red-600' : 'text-green-600'"
                  >
                    <i :class="tattoo.is_visible ? 'pi pi-eye' : 'pi pi-eye-slash'" class="text-[10px] mr-1" />
                    {{ tattoo.is_visible ? 'Visible' : 'Hidden' }}
                  </span>
                </div>
                <p v-if="tattoo.description" class="text-sm text-blueberry-600 mt-2">
                  {{ tattoo.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-blueberry-400 italic text-sm">No tattoo records</p>
      </section>

      <!-- ─── Batches (Enhanced with pivot data) ───────── -->
      <section
        v-if="a.batches && a.batches.length > 0"
        class="bg-white rounded-2xl border border-appleCore-100 p-6"
      >
        <h3 class="text-base font-serif font-semibold text-blueberry-800 mb-4 flex items-center gap-2">
          <i class="pi pi-users text-apricot-500" />
          Batch Applications
          <span class="text-xs text-blueberry-400 font-sans font-normal ml-1">
            ({{ a.batches.length }})
          </span>
        </h3>

        <div class="space-y-3">
          <div
            v-for="batch in (a.batches as any[])"
            :key="batch.id"
            class="border border-appleCore-100 rounded-lg p-4 hover:bg-appleCore-50/30 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <!-- Header row -->
                <div class="flex items-center gap-2 flex-wrap mb-2">
                  <span class="font-mono text-xs text-apricot-600 font-semibold bg-apricot-50 px-2 py-0.5 rounded">
                    Batch #{{ batch.batch_number ?? batch.id }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset"
                    :class="batchStatusColor(batchPivot(batch).status)"
                  >
                    {{ capitalize(batchPivot(batch).status ?? batch.status) }}
                  </span>
                </div>

                <!-- Batch info -->
                <p class="font-semibold text-blueberry-800">{{ batch.name }}</p>
                <p v-if="batch.country" class="text-sm text-blueberry-500 mt-0.5">
                  <i class="pi pi-globe text-xs mr-1" />
                  {{ batch.country }}
                </p>

                <!-- Pivot dates -->
                <div class="flex flex-wrap gap-3 mt-2 text-xs text-blueberry-500">
                  <span v-if="batchPivot(batch).applied_at">
                    <i class="pi pi-calendar text-[10px] mr-1" />
                    Applied: {{ formatDate(batchPivot(batch).applied_at) }}
                  </span>
                  <span v-if="batchPivot(batch).interview_date">
                    <i class="pi pi-comments text-[10px] mr-1" />
                    Interview: {{ formatDate(batchPivot(batch).interview_date) }}
                  </span>
                  <span v-if="batchPivot(batch).medical_date">
                    <i class="pi pi-heart text-[10px] mr-1" />
                    Medical: {{ formatDate(batchPivot(batch).medical_date) }}
                  </span>
                  <span v-if="batchPivot(batch).exam_date">
                    <i class="pi pi-book text-[10px] mr-1" />
                    Exam: {{ formatDate(batchPivot(batch).exam_date) }}
                  </span>
                  <span v-if="batchPivot(batch).deployed_at">
                    <i class="pi pi-send text-[10px] mr-1" />
                    Deployed: {{ formatDate(batchPivot(batch).deployed_at) }}
                  </span>
                </div>

                <!-- Notes / Score -->
                <div v-if="batchPivot(batch).exam_score" class="mt-2 text-sm">
                  <span class="text-blueberry-500">Exam Score:</span>
                  <span class="font-semibold text-blueberry-800 ml-1">
                    {{ batchPivot(batch).exam_score }}%
                  </span>
                </div>

                <p v-if="batchPivot(batch).interview_notes" class="text-sm text-blueberry-600 mt-2 italic">
                  <strong>Interview notes:</strong> {{ batchPivot(batch).interview_notes }}
                </p>

                <p v-if="batchPivot(batch).rejection_reason" class="text-sm text-red-600 mt-2">
                  <strong>Rejection:</strong> {{ batchPivot(batch).rejection_reason }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>