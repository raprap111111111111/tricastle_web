// src/features/applicants/composables/useInsuranceExport.ts
import { computed, ref, watch } from 'vue'
import http from '@shared/api/http'
import { applicantApi } from '../api/applicant.api'
import { exportApplicantInsurance } from '../api/insurance-export.api'
import { insuranceExportPayloadSchema } from '../schemas/insurance-export.schema'
import { useCompanyStore } from '@features/companies/stores/company.store'
import type {
  InsuranceApplicantRow,
  InsuranceExportPayload,
} from '../types/insurance-export.types'

export type InsuranceSortOption = 'surname_asc' | 'surname_desc' | 'firstname_asc' | 'default'

function extractRecords(res: any): any[] {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.records)) return res.records
  if (res.data && Array.isArray(res.data.records)) return res.data.records
  if (res.data && Array.isArray(res.data.data)) return res.data.data
  return []
}

function resolveCompanyName(raw: any, companyStore: ReturnType<typeof useCompanyStore>): string {
  if (!raw) return ''
  if (typeof raw === 'object' && raw.name) return raw.name

  const str = String(raw).trim()
  if (!str) return ''

  const numId = Number(str)
  if (!isNaN(numId)) {
    if (companyStore.companyMap.has(numId)) {
      return companyStore.companyMap.get(numId)!.name
    }
    return ''
  }

  const matchByCode = Array.from(companyStore.companyMap.values()).find(
    (c) => c.code.toLowerCase() === str.toLowerCase()
  )
  if (matchByCode) return matchByCode.name

  const matchByName = Array.from(companyStore.companyMap.values()).find(
    (c) => c.name.toLowerCase() === str.toLowerCase()
  )
  if (matchByName) return matchByName.name

  return str
}

function toIsoDateString(rawDate: any): string {
  if (!rawDate) return ''
  const d = new Date(rawDate)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

function formatDepartureDateForDocument(rawDate: any): string {
  if (!rawDate) return ''
  const d = new Date(rawDate)
  if (isNaN(d.getTime())) {
    return String(rawDate).toUpperCase()
  }

  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ]
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function useInsuranceExport() {
  const companyStore = useCompanyStore()

  const isDialogOpen = ref(false)
  const isExporting = ref(false)
  const isLoadingDetails = ref(false)
  const departureDate = ref('')
  const rows = ref<InsuranceApplicantRow[]>([])
  const originalRows = ref<InsuranceApplicantRow[]>([]) // Backup for 'default' order
  const errorMessage = ref<string | null>(null)

  // 🎯 Sorting State
  const sortBy = ref<InsuranceSortOption>('surname_asc')

  const missingFields = computed(() => {
    return rows.value.flatMap((row) => {
      const missing: string[] = []

      if (!row.date_of_birth?.trim()) missing.push('Date of Birth')
      if (!row.passport_number?.trim()) missing.push('Passport Number')
      if (!row.occupation?.trim()) missing.push('Occupation / Trade')
      if (!row.foreign_employer?.trim()) missing.push('Foreign Employer')
      if (!row.country_destination?.trim()) missing.push('Country Destination')
      if (!row.contract_duration_months) missing.push('Contract Duration')

      return missing.length
        ? [
            {
              applicantId: row.id,
              applicantName: row.full_name || 'Unknown Applicant',
              fields: missing,
            },
          ]
        : []
    })
  })

  const isValid = computed(() => {
    if (isLoadingDetails.value) return false
    if (!departureDate.value.trim() || rows.value.length === 0) return false
    return missingFields.value.length === 0
  })

  // 🎯 Helper function to apply sorting
  function applySorting() {
    if (rows.value.length === 0) return

    const list = [...rows.value]

    switch (sortBy.value) {
      case 'surname_asc':
        list.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''))
        break
      case 'surname_desc':
        list.sort((a, b) => (b.last_name || '').localeCompare(a.last_name || ''))
        break
      case 'firstname_asc':
        list.sort((a, b) => (a.first_name || '').localeCompare(b.first_name || ''))
        break
      case 'default':
        // Restore original selection order
        rows.value = [...originalRows.value]
        return
    }

    rows.value = list
  }

  // Watch for changes to the sort selector
  watch(sortBy, () => {
    applySorting()
  })

  async function open(selectedApplicants: Array<{ id: number; full_name?: string }>) {
    errorMessage.value = null
    departureDate.value = ''
    sortBy.value = 'surname_asc' // 🎯 Default sort by Surname A-Z
    isDialogOpen.value = true
    isLoadingDetails.value = true
    rows.value = []
    originalRows.value = []

    try {
      const [fullProfiles, internshipsResults] = await Promise.all([
        Promise.all(
          selectedApplicants.map(async (basicApp) => {
            try {
              return await applicantApi.get(basicApp.id)
            } catch {
              return basicApp as any
            }
          })
        ),
        Promise.all(
          selectedApplicants.map(async (basicApp) => {
            try {
              const res = await http.get('/internships', {
                params: { applicant_id: basicApp.id, limit: 10 },
              })
              const records = extractRecords(res)
              return {
                applicantId: basicApp.id,
                internship: records.find((i: any) => i.is_current) ?? records[0] ?? null,
              }
            } catch {
              return { applicantId: basicApp.id, internship: null }
            }
          })
        ),
        companyStore.fetchActiveCompanies(),
      ])

      const internshipMap = new Map<number, any>()
      internshipsResults.forEach((item) => {
        if (item && item.applicantId && item.internship) {
          internshipMap.set(item.applicantId, item.internship)
        }
      })

      // Auto-detect tentative departure date
      let detectedDepartureDate = ''
      for (const app of fullProfiles as any[]) {
        const lastBatch = app.applicant_batches?.[0]
        const rawDate =
          lastBatch?.batch?.deployment_date ||
          lastBatch?.deployment_date ||
          app.deployment_date ||
          app.deployment?.deployment_date

        if (rawDate) {
          detectedDepartureDate = toIsoDateString(rawDate)
          break
        }
      }
      departureDate.value = detectedDepartureDate

      const builtRows: InsuranceApplicantRow[] = fullProfiles.map((app: any) => {
        const lastBatch = app.applicant_batches?.[0]
        const batchObj = lastBatch?.batch
        const internship =
          internshipMap.get(app.id) ??
          app.internships?.find((i: any) => i.is_current) ??
          app.internships?.[0]

        const rawCompany =
          internship?.receiving_company ||
          internship?.accepting_company ||
          batchObj?.receiving_company ||
          batchObj?.accepting_company ||
          batchObj?.company ||
          app.company ||
          lastBatch?.deployment_company ||
          app.deployment?.preferred_work_location ||
          ''

        const companyName = resolveCompanyName(rawCompany, companyStore)

        const resolvedCompanyObj = Array.from(companyStore.companyMap.values()).find(
          (c) => c.name.toLowerCase() === companyName.toLowerCase()
        )

        const occupation =
          app.trade_or_occupation ||
          internship?.program?.name ||
          resolvedCompanyObj?.category?.name ||
          lastBatch?.deployment_position ||
          app.applied_position ||
          app.skill_category ||
          ''

        const fullName =
          app.full_name ??
          `${app.first_name ?? ''} ${app.last_name ?? ''}`.trim() ??
          'Unknown Applicant'

        return {
          id: app.id,
          applicant_code: app.applicant_code ?? null,
          full_name: fullName || 'Unknown Applicant',
          first_name: app.first_name ?? '',
          last_name: app.last_name ?? '',
          date_of_birth: app.date_of_birth ?? '',
          passport_number: app.passport_number ?? '',
          occupation: String(occupation).trim(),
          foreign_employer: String(companyName).trim(),
          country_destination:
            lastBatch?.deployment_country ?? batchObj?.country ?? 'JAPAN',
          contract_duration_months:
            internship?.contract_years ? internship.contract_years * 12 : (lastBatch?.contract_duration_months ?? 36),
        }
      })

      originalRows.value = [...builtRows]
      rows.value = builtRows

      // 🎯 Apply initial Surname A-Z sort
      applySorting()

    } catch {
      errorMessage.value = 'Failed to load applicant details.'
    } finally {
      isLoadingDetails.value = false
    }
  }

  function close() {
    if (isExporting.value) return
    isDialogOpen.value = false
    isLoadingDetails.value = false
    rows.value = []
    originalRows.value = []
    departureDate.value = ''
    errorMessage.value = null
  }

  async function submit() {
    errorMessage.value = null

    const formattedDate = formatDepartureDateForDocument(departureDate.value)

    const rawPayload: InsuranceExportPayload = {
      departure_date: formattedDate,
      applicants: rows.value.map((r) => ({
        id: r.id,
        date_of_birth: r.date_of_birth ?? '',
        passport_number: r.passport_number ?? '',
        occupation: r.occupation ?? '',
        foreign_employer: r.foreign_employer ?? '',
        country_destination: r.country_destination ?? '',
        contract_duration_months: Number(r.contract_duration_months || 36),
      })),
    }

    const parseResult = insuranceExportPayloadSchema.safeParse(rawPayload)
    if (!parseResult.success) {
      errorMessage.value =
        parseResult.error.errors[0]?.message ?? 'Please complete all required fields.'
      return
    }

    isExporting.value = true

    try {
      const response: any = await exportApplicantInsurance(parseResult.data)

      const downloadUrl =
        response?.download_url ||
        response?.data?.download_url ||
        response?.data?.data?.download_url

      if (downloadUrl) {
        window.open(downloadUrl, '_blank')
        close()
      } else {
        errorMessage.value = 'Failed to retrieve generated document link.'
      }
    } catch (err: any) {
      errorMessage.value =
        err.response?.data?.message ?? err.message ?? 'An error occurred during document export.'
    } finally {
      isExporting.value = false
    }
  }

  return {
    isDialogOpen,
    isExporting,
    isLoadingDetails,
    departureDate,
    sortBy,
    rows,
    missingFields,
    isValid,
    errorMessage,
    open,
    close,
    submit,
  }
}