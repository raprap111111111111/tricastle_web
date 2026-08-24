<!-- src/features/dashboard/components/DashboardBirthdays.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import DatePicker from 'primevue/datepicker'
import Skeleton from 'primevue/skeleton'
import type { BirthdaysData, BirthdayPerson } from '../types'

const props = defineProps<{
  data: BirthdaysData | null
  loading: boolean
}>()

type FilterKey = 'today' | 'tomorrow' | 'week' | 'month' | 'all'
type TabKey = 'applicants' | 'staff'

interface DatePickerSlotDate {
  day: number
  month: number
  year: number
  today?: boolean
  selectable?: boolean
}

const activeTab = ref<TabKey>('applicants')
const activeFilter = ref<FilterKey>('month')
const selectedDate = ref<Date | null>(null)

const filters: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'today',    label: 'Today',     icon: 'pi pi-star' },
  { key: 'tomorrow', label: 'Tomorrow',  icon: 'pi pi-arrow-right' },
  { key: 'week',     label: 'This Week', icon: 'pi pi-calendar' },
  { key: 'month',    label: '30 Days',   icon: 'pi pi-calendar-plus' },
  { key: 'all',      label: 'All',       icon: 'pi pi-list' },
]

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function toJsDate(dateObj: DatePickerSlotDate | Date | unknown): Date {
  if (dateObj instanceof Date) return dateObj
  if (dateObj && typeof dateObj === 'object' && 'year' in dateObj && 'month' in dateObj && 'day' in dateObj) {
    const slot = dateObj as DatePickerSlotDate
    return new Date(slot.year, slot.month, slot.day)
  }
  return new Date()
}

function parseDob(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function nextBirthdayDate(dobStr: string, from = new Date()) {
  const dob = parseDob(dobStr)
  const base = startOfDay(from)
  const next = new Date(base.getFullYear(), dob.getMonth(), dob.getDate())
  if (next < base) next.setFullYear(base.getFullYear() + 1)
  return next
}

function daysUntil(person: BirthdayPerson) {
  if (typeof person.days_left === 'number') return person.days_left
  const next = nextBirthdayDate(person.date_of_birth)
  const today = startOfDay(new Date())
  return Math.round((next.getTime() - today.getTime()) / 86400000)
}

function matchesFilter(person: BirthdayPerson, filter: FilterKey) {
  const days = daysUntil(person)
  switch (filter) {
    case 'today':    return days === 0 || person.is_today
    case 'tomorrow': return days === 1
    case 'week':     return days >= 0 && days <= 7
    case 'month':    return days >= 0 && days <= 30
    case 'all':
    default:         return true
  }
}

function matchesSelectedDate(person: BirthdayPerson) {
  if (!selectedDate.value) return true
  const next = nextBirthdayDate(person.date_of_birth)
  const sel = startOfDay(selectedDate.value)
  return (
    next.getFullYear() === sel.getFullYear() &&
    next.getMonth() === sel.getMonth() &&
    next.getDate() === sel.getDate()
  )
}

const sourceList = computed<BirthdayPerson[]>(() => {
  if (!props.data) return []
  return activeTab.value === 'applicants'
    ? (props.data.applicants ?? [])
    : (props.data.staff ?? [])
})

const filteredList = computed(() =>
  sourceList.value
    .filter((p) => matchesFilter(p, activeFilter.value))
    .filter((p) => matchesSelectedDate(p))
    .slice()
    .sort((a, b) => daysUntil(a) - daysUntil(b)),
)

const counts = computed(() => {
  const applicants = props.data?.applicants ?? []
  const staff = props.data?.staff ?? []
  const make = (list: BirthdayPerson[]) => ({
    today:    list.filter((p) => matchesFilter(p, 'today')).length,
    tomorrow: list.filter((p) => matchesFilter(p, 'tomorrow')).length,
    week:     list.filter((p) => matchesFilter(p, 'week')).length,
    month:    list.filter((p) => matchesFilter(p, 'month')).length,
    all:      list.length,
  })
  return { applicants: make(applicants), staff: make(staff) }
})

const currentCounts = computed(() => counts.value[activeTab.value])

const birthdayDates = computed(() =>
  sourceList.value.map((p) => nextBirthdayDate(p.date_of_birth)),
)

function dateHasBirthday(date: Date) {
  const d = startOfDay(date).getTime()
  return birthdayDates.value.some((bd) => startOfDay(bd).getTime() === d)
}

function onFilterClick(key: FilterKey) {
  activeFilter.value = key
  selectedDate.value = null
}

function onCalendarSelect(val: Date | Date[] | (Date | null)[] | null | undefined) {
  if (!val || Array.isArray(val)) {
    selectedDate.value = null
    return
  }
  selectedDate.value = val
  if (activeFilter.value === 'today' || activeFilter.value === 'tomorrow') {
    activeFilter.value = 'month'
  }
}

function clearDateFilter() {
  selectedDate.value = null
}

watch(activeTab, () => {
  selectedDate.value = null
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton width="100%" height="2.25rem" border-radius="999px" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton height="18rem" border-radius="1rem" />
        <Skeleton height="18rem" border-radius="1rem" />
      </div>
    </div>

    <template v-else>
      <!-- Tabs -->
      <Tabs v-model:value="activeTab">
        <TabList class="!bg-transparent !border-b border-appleCore-100">
          <Tab
            value="applicants"
            class="!px-4 !py-2.5 !text-sm !font-semibold"
          >
            Applicants
            <span class="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-appleCore-100 text-blueberry-500">
              {{ data?.applicants?.length ?? 0 }}
            </span>
          </Tab>
          <Tab
            value="staff"
            class="!px-4 !py-2.5 !text-sm !font-semibold"
          >
            Staff
            <span class="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold bg-appleCore-100 text-blueberry-500">
              {{ data?.staff?.length ?? 0 }}
            </span>
          </Tab>
        </TabList>
      </Tabs>

      <!-- Filter chips -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="f in filters"
          :key="f.key"
          type="button"
          class="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-all"
          :class="activeFilter === f.key && !selectedDate
            ? 'bg-blueberry-700 text-white border-blueberry-700 shadow-sm'
            : 'bg-white text-blueberry-600 border-appleCore-200 hover:border-blueberry-300 hover:bg-appleCore-50'"
          @click="onFilterClick(f.key)"
        >
          <i :class="f.icon" class="text-[11px] opacity-80" />
          {{ f.label }}
          <span
            class="inline-flex items-center justify-center min-w-[1.1rem] h-4 px-1 rounded-full text-[10px] font-bold"
            :class="activeFilter === f.key && !selectedDate
              ? 'bg-white/20 text-white'
              : 'bg-appleCore-100 text-blueberry-500'"
          >
            {{ currentCounts[f.key] }}
          </span>
        </button>

        <button
          v-if="selectedDate"
          type="button"
          class="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border border-apricot-200 bg-apricot-50 text-apricot-700 hover:bg-apricot-100 transition-colors"
          @click="clearDateFilter"
        >
          <i class="pi pi-times text-[10px]" />
          Clear date
        </button>
      </div>

      <!-- Main grid -->
      <div class="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4">
        <!-- Calendar card -->
        <div class="rounded-2xl border border-appleCore-100 bg-gradient-to-b from-appleCore-50/80 to-white p-3 overflow-hidden">
          <div class="flex items-center justify-between mb-2 px-1">
            <p class="text-[10px] font-bold uppercase tracking-wider text-blueberry-500">
              Calendar
            </p>
            <p class="text-[10px] text-blueberry-400">
              Tap a day to filter
            </p>
          </div>

          <div class="birthday-calendar-wrap">
            <DatePicker
              :model-value="selectedDate"
              inline
              show-other-months
              class="birthday-calendar w-full"
              @update:model-value="onCalendarSelect"
            >
              <template #date="slotProps">
                <span
                  class="bday-day"
                  :class="{
                    'bday-day--has': dateHasBirthday(toJsDate(slotProps.date)),
                    'bday-day--selected': selectedDate &&
                      startOfDay(toJsDate(slotProps.date)).getTime() === startOfDay(selectedDate).getTime(),
                    'bday-day--today': slotProps.date.today,
                  }"
                >
                  {{ slotProps.date.day }}
                  <i
                    v-if="dateHasBirthday(toJsDate(slotProps.date))"
                    class="bday-dot"
                  />
                </span>
              </template>
            </DatePicker>
          </div>

          <div class="mt-2 px-1 flex items-center gap-3 text-[10px] text-blueberry-400">
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-apricot-500" />
              Birthday
            </span>
            <span class="inline-flex items-center gap-1">
              <span class="w-2 h-2 rounded-full ring-2 ring-blueberry-400 bg-transparent" />
              Selected
            </span>
          </div>
        </div>

        <!-- List card -->
        <div class="rounded-2xl border border-appleCore-100 bg-white p-3 flex flex-col min-h-[20rem]">
          <div class="flex items-center justify-between mb-3 px-1">
            <p class="text-[10px] font-bold uppercase tracking-wider text-blueberry-500">
              {{ activeTab === 'applicants' ? 'Applicants' : 'Staff' }}
            </p>
            <p class="text-[10px] text-blueberry-400 tabular-nums">
              {{ filteredList.length }} result{{ filteredList.length === 1 ? '' : 's' }}
            </p>
          </div>

          <!-- Empty -->
          <div
            v-if="!filteredList.length"
            class="flex-1 flex flex-col items-center justify-center text-center px-4 py-8"
          >
            <div class="w-14 h-14 mb-3 rounded-full bg-appleCore-50 border border-appleCore-100 flex items-center justify-center">
              <i class="pi pi-gift text-2xl text-blueberry-300" />
            </div>
            <p class="text-sm font-semibold text-blueberry-700">No birthdays found</p>
            <p class="text-xs text-blueberry-400 mt-1 max-w-[14rem]">
              Try another filter, switch tabs, or pick a different day on the calendar.
            </p>
          </div>

          <!-- List -->
          <div v-else class="flex-1 space-y-2 overflow-y-auto max-h-[22rem] pr-0.5">
            <div
              v-for="person in filteredList"
              :key="person.id"
              class="flex items-center justify-between gap-3 p-3 rounded-xl border transition-all"
              :class="person.is_today || daysUntil(person) === 0
                ? 'bg-apricot-50 border-apricot-200 shadow-sm'
                : daysUntil(person) === 1
                  ? 'bg-sky-50 border-sky-200'
                  : 'bg-white border-appleCore-100 hover:bg-appleCore-50/80 hover:border-appleCore-200'"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  :class="person.is_today || daysUntil(person) === 0
                    ? 'bg-apricot-500 text-white shadow-sm'
                    : daysUntil(person) === 1
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-blueberry-100 text-blueberry-700'"
                >
                  <i
                    v-if="person.is_today || daysUntil(person) === 0"
                    class="pi pi-gift text-base"
                  />
                  <span v-else>{{ person.name.charAt(0).toUpperCase() }}</span>
                </div>

                <div class="min-w-0">
                  <p class="text-sm font-bold text-blueberry-800 truncate leading-tight">
                    {{ person.name }}
                  </p>
                  <p class="text-[11px] text-blueberry-500 mt-0.5">
                    Turning {{ person.age }}
                    <span class="text-blueberry-300 mx-1">·</span>
                    {{ person.formatted_date }}
                  </p>
                </div>
              </div>

              <div class="flex-shrink-0 text-right">
                <span
                  v-if="person.is_today || daysUntil(person) === 0"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-apricot-500 text-white"
                >
                  Today
                </span>
                <span
                  v-else-if="daysUntil(person) === 1"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-sky-500 text-white"
                >
                  Tomorrow
                </span>
                <div v-else class="leading-tight">
                  <p class="text-xs font-semibold text-blueberry-700">
                    {{ person.formatted_date }}
                  </p>
                  <p class="text-[10px] text-blueberry-400 mt-0.5">
                    in {{ daysUntil(person) }}d
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Calendar shell ─────────────────────────────── */
.birthday-calendar-wrap {
  width: 100%;
  overflow: hidden;
}

:deep(.birthday-calendar),
:deep(.birthday-calendar .p-datepicker),
:deep(.birthday-calendar .p-datepicker-inline) {
  width: 100% !important;
  max-width: 100% !important;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  font-size: 0.8125rem;
}

:deep(.birthday-calendar .p-datepicker-header) {
  padding: 0.35rem 0.25rem 0.5rem;
  border: none;
  background: transparent;
}

:deep(.birthday-calendar .p-datepicker-title) {
  font-weight: 700;
  color: #1e3a5f;
  font-size: 0.875rem;
}

:deep(.birthday-calendar .p-datepicker-prev,
       .birthday-calendar .p-datepicker-next) {
  width: 1.75rem;
  height: 1.75rem;
}

/* Force full 7-column grid, no horizontal scroll */
:deep(.birthday-calendar table) {
  width: 100% !important;
  table-layout: fixed !important;
  border-collapse: collapse;
}

:deep(.birthday-calendar th) {
  padding: 0.25rem 0;
  font-size: 0.65rem;
  font-weight: 700;
  color: #8aa0b8;
  text-align: center;
}

:deep(.birthday-calendar td) {
  padding: 0.1rem 0;
  text-align: center;
}

:deep(.birthday-calendar td > span),
:deep(.birthday-calendar .p-datepicker-day-cell > span) {
  width: 100% !important;
  height: auto !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  margin: 0 auto !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Custom day cell */
.bday-day {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #334e68;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}

.bday-day--today:not(.bday-day--has):not(.bday-day--selected) {
  box-shadow: inset 0 0 0 1.5px #94a9c0;
  font-weight: 700;
}

.bday-day--has {
  background: #f97316;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.35);
}

.bday-day--selected {
  box-shadow: 0 0 0 2px #1e3a5f;
  font-weight: 700;
}

.bday-day--has.bday-day--selected {
  box-shadow: 0 0 0 2px #1e3a5f, 0 1px 3px rgba(249, 115, 22, 0.35);
}

.bday-dot {
  display: none; /* filled circle already indicates birthday */
}

/* Hide native scrollbar artifacts from prime calendar */
:deep(.birthday-calendar .p-datepicker-calendar-container) {
  overflow: visible !important;
}
</style>