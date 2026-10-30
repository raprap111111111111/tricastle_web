import { reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { profileUpdateApi } from '../api/profile-update.api'
import type { ProfileUpdate } from '../types'

type StatusFilter = 'pending' | 'approved' | 'declined'

const store = reactive({
  updates: [] as ProfileUpdate[],
  loading: false,
  submitting: false,
  filters: {
    status: 'pending' as StatusFilter,
    search: '',
    province: '',
    city: '',
    address: '',
    page: 1,
    limit: 15,
  },
  pagination: {
    total: 0,
    current_page: 1,
    last_page: 1,
    per_page: 15,
    offset: 0,
    has_more: false,
  },

  addOrUpdateRealtimeItem(row: any) {
    if (!row || !row.id) return

    const applicant = row.applicant ?? {}
    const fullName =
      applicant.full_name ||
      row.applicant_name ||
      [applicant.first_name, applicant.middle_name, applicant.last_name]
        .filter(Boolean)
        .join(' ') ||
      '—'

    const item: ProfileUpdate = {
      ...row,
      applicant_code: row.applicant_code ?? applicant.applicant_code ?? '—',
      applicant_name: fullName,
      proposed_payload: row.proposed_payload ?? {},
      reviewer_name:
        row.reviewer?.name ||
        row.reviewer?.full_name ||
        [row.reviewer?.first_name, row.reviewer?.last_name].filter(Boolean).join(' ') ||
        null,
    }

    const existingIndex = this.updates.findIndex((u) => u.id === item.id)

    if (existingIndex !== -1) {
      if (item.status === this.filters.status) {
        this.updates[existingIndex] = item
      } else {
        this.updates.splice(existingIndex, 1)
        this.pagination.total = Math.max(0, this.pagination.total - 1)
      }
    } else {
      if (item.status === this.filters.status) {
        this.updates.unshift(item)
        this.pagination.total += 1
      }
    }
  },

  async fetchUpdates() {
    this.loading = true
    try {
      const page = this.filters.page
      const limit = this.filters.limit
      const offset = (page - 1) * limit

      const queryParams: Record<string, any> = {
        status: this.filters.status,
        search: this.filters.search || undefined,
        province: this.filters.province || undefined,
        city: this.filters.city || undefined,
        address: this.filters.address || undefined,
        page,
        limit,
        offset,
        order_by: 'created_at',
        order_dir: 'desc',
      }

      const rawResponse: any = await profileUpdateApi.list(queryParams)

      // 1. Safely unwrap Axios response if rawResponse.data exists
      let payload = rawResponse
      if (rawResponse && rawResponse.data && typeof rawResponse.data === 'object' && !Array.isArray(rawResponse.data)) {
        if ('records' in rawResponse.data || 'data' in rawResponse.data || 'total' in rawResponse.data) {
          payload = rawResponse.data
        }
      }

      // 2. Safely extract records list (matches "records": [...])
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : Array.isArray(payload?.data)
            ? payload.data
            : []

      this.updates = list.map((row) => {
        const applicant = row.applicant ?? {}
        const fullName =
          applicant.full_name ||
          row.applicant_name ||
          [applicant.first_name, applicant.middle_name, applicant.last_name]
            .filter(Boolean)
            .join(' ') ||
          '—'

        return {
          ...row,
          applicant_code: row.applicant_code ?? applicant.applicant_code ?? '—',
          applicant_name: fullName,
          proposed_payload: row.proposed_payload ?? {},
          reviewer_name:
            row.reviewer?.name ||
            row.reviewer?.full_name ||
            [row.reviewer?.first_name, row.reviewer?.last_name].filter(Boolean).join(' ') ||
            null,
        } as ProfileUpdate
      })

      // 3. Extract pagination fields cleanly from root payload
      const meta = payload?.meta ?? payload?.pagination ?? {}
      const total = Number(payload?.total ?? meta?.total ?? list.length ?? 0)
      const perPage = Number(payload?.per_page ?? payload?.limit ?? meta?.per_page ?? limit)
      const currentPage = Number(payload?.current_page ?? meta?.current_page ?? page)
      const lastPage = Number(payload?.last_page ?? meta?.last_page ?? Math.max(1, Math.ceil(total / (perPage || 1))))

      this.pagination = {
        total,
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        offset: Number(payload?.offset ?? offset),
        has_more: Boolean(payload?.has_more ?? currentPage < lastPage),
      }
    } catch (err: any) {
      console.error('Failed to fetch profile updates', err)
      this.updates = []
      this.pagination = {
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: this.filters.limit,
        offset: 0,
        has_more: false,
      }
      useToast().add({
        severity: 'error',
        summary: 'Load failed',
        detail: err.response?.data?.message ?? 'Could not load profile update requests.',
        life: 4000,
      })
    } finally {
      this.loading = false
    }
  },

  setStatusFilter(status: StatusFilter) {
    this.filters.status = status
    this.filters.page = 1
    this.fetchUpdates()
  },

  setAdvancedFilters(payload: { search?: string; province?: string; city?: string; address?: string }) {
    this.filters.search = payload.search || ''
    this.filters.province = payload.province || ''
    this.filters.city = payload.city || ''
    this.filters.address = payload.address || ''
    this.filters.page = 1
    this.fetchUpdates()
  },

  setPage(page: number) {
    this.filters.page = Math.max(1, page)
    this.fetchUpdates()
  },

  setLimit(limit: number) {
    this.filters.limit = limit
    this.filters.page = 1
    this.fetchUpdates()
  },
})

export function useProfileUpdates() {
  const toast = useToast()

  async function handleApprove(id: number) {
    store.submitting = true
    try {
      await profileUpdateApi.approve(id)
      toast.add({
        severity: 'success',
        summary: 'Approved',
        detail: 'Profile update approved and applied to applicant record.',
        life: 3500,
      })
      await store.fetchUpdates()
      return true
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Approve failed',
        detail: err.response?.data?.message ?? 'Could not approve request.',
        life: 4000,
      })
      return false
    } finally {
      store.submitting = false
    }
  }

  async function handleDecline(id: number, reason: string) {
    store.submitting = true
    try {
      await profileUpdateApi.decline(id, reason)
      toast.add({
        severity: 'info',
        summary: 'Declined',
        detail: 'Profile update request was declined.',
        life: 3500,
      })
      await store.fetchUpdates()
      return true
    } catch (err: any) {
      toast.add({
        severity: 'error',
        summary: 'Decline failed',
        detail: err.response?.data?.message ?? 'Could not decline request.',
        life: 4000,
      })
      return false
    } finally {
      store.submitting = false
    }
  }

  return {
    store,
    handleApprove,
    handleDecline,
  }
}