export interface InsuranceApplicantOverride {
  id: number
  date_of_birth: string
  passport_number: string
  occupation: string
  foreign_employer: string
  country_destination: string
  contract_duration_months: number | string
}

export interface InsuranceExportPayload {
  departure_date: string
  applicants: InsuranceApplicantOverride[]
}

export interface InsuranceExportResult {
  file_name: string
  pax_count: number
  download_url: string
}

export interface InsuranceExportResponse {
  data: InsuranceExportResult
  message: string
}


export interface InsuranceApplicantRow {
  id: number
  applicant_code?: string | null
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  date_of_birth?: string | null
  passport_number?: string | null
  occupation?: string | null
  foreign_employer?: string | null
  country_destination?: string | null
  contract_duration_months?: number | string | null
}