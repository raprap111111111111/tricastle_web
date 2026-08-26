// src/shared/utils/ais/mapper.ts

import type { AISData } from './types'
import { loadPhotoBase64 } from './assets'
import { calcYears, calcMonths, fmtMonthYear } from './formatters'

/**
 * Extract photo URL from applicant record.
 * Checks flat photo properties AND nested documents array (2x2 Photo / ID Photo).
 */
export function getApplicantPhotoUrl(applicant: any): string | null {
  // 1. Direct photo properties check
  if (applicant.photo_url) return applicant.photo_url
  if (applicant.profile_photo_url) return applicant.profile_photo_url
  if (applicant.avatar_url) return applicant.avatar_url

  // 2. Scan documents / currentDocuments / applicant_documents array for 2x2 Photo
  const docsList =
    applicant.currentDocuments ??
    applicant.documents ??
    applicant.applicant_documents ??
    applicant.current_documents ??
    []

  if (Array.isArray(docsList) && docsList.length > 0) {
    const photoDoc = docsList.find((doc: any) => {
      const code = String(doc?.document_type?.code ?? doc?.documentType?.code ?? doc?.code ?? '').toUpperCase()
      const name = String(doc?.document_type?.name ?? doc?.documentType?.name ?? doc?.name ?? '').toUpperCase()
      
      return (
        code.includes('PHOTO') ||
        code.includes('2X2') ||
        name.includes('PHOTO') ||
        name.includes('2X2') ||
        name.includes('ID PHOTO')
      )
    })

    if (photoDoc) {
      // Return file_url, public_url, path, or url
      return (
        photoDoc.file_url ??
        photoDoc.public_url ??
        photoDoc.url ??
        photoDoc.file_path ??
        photoDoc.path ??
        null
      )
    }
  }

  return null
}

/** Attach applicant's photo as base64 to the AISData (skips on error). */
export async function attachPhoto(applicant: any, aisData: AISData): Promise<void> {
  const url = getApplicantPhotoUrl(applicant)
  if (!url) return
  const base64 = await loadPhotoBase64(url)
  if (base64) aisData.photo = base64
}

/** Convert applicant record from API → AISData shape. */
export function mapApplicantToAIS(applicant: any, staffName?: string): AISData {
  const familyNotes = buildFamilyNotes(applicant)
  const employment  = getPrimaryEmployment(applicant)
  const overseasEmp = getOverseasEmployment(applicant)
  const education   = extractEducation(applicant)

  const marucon    = extractJapanContact(applicant, 'marucon')
  const nonMarucon = extractJapanContact(applicant, 'non_marucon')

  // Spouse
  const spouseObj       = applicant.family?.spouse ?? {}
  const spouseName      = spouseObj.name || applicant.spouse_name || ''
  const spouseWork      = spouseObj.occupation || applicant.spouse_occupation || ''
  const spouseSalaryVal = spouseObj.salary ?? applicant.spouse_salary
  const spouseUnit      = spouseObj.salary_unit || applicant.spouse_salary_unit || 'per_month'

  const spouseSalaryFmt = spouseSalaryVal
    ? `P ${Number(spouseSalaryVal).toLocaleString()} ${formatSalaryUnit(spouseUnit)}`
    : ''

  // Work — total experience across all jobs, prefer primary job title
  const jobTitle = employment?.position
    || applicant.applied_position
    || applicant.trade_or_occupation
    || ''
  const jobDesc  = employment?.job_description || ''
  const jobRole  = employment?.position || jobTitle

  const { years: workYears, months: workMonths } = sumEmploymentDuration(applicant.employments)

  const salaryAmt  = employment?.salary != null
    ? Number(employment.salary).toLocaleString()
    : ''
  const salaryUnit = formatSalaryUnit(employment?.salary_unit ?? 'per_day')

  const { years: overseasYears, months: overseasMonths } = overseasEmp
    ? {
        years:  calcYears(overseasEmp.date_started, overseasEmp.date_ended),
        months: calcMonths(overseasEmp.date_started, overseasEmp.date_ended),
      }
    : { years: 0, months: 0 }

  return {
    // Header
    position:        applicant.applied_position || applicant.trade_or_occupation || '',
    trade_test_try:  applicant.trade_test_try || '1st',
    trade_test_date: applicant.trade_test_date ? formatDateDots(applicant.trade_test_date) : '',
    applicant_code:  applicant.applicant_code,

    // Personal
    last_name:          applicant.last_name || '',
    first_name:         applicant.first_name || '',
    middle_name:        applicant.middle_name || 'NMN',
    current_address:    applicant.current_address || '',
    contact_number:     applicant.phone || applicant.mobile || '',
    blood_type:         applicant.blood_type || '',
    english_percent:    applicant.english_proficiency_pct
      ?? (applicant.language?.understands_basic_english ? 30 : 0),
    date_of_birth:      applicant.date_of_birth ? formatDateDots(applicant.date_of_birth) : '',
    birthplace:         applicant.birthplace || applicant.city || '',
    age:                applicant.age ?? 0,
    civil_status:       capitalize(applicant.civil_status),
    height_cm:          applicant.height_cm,
    weight_kg:          applicant.weight_kg,
    number_of_children: applicant.number_of_children ?? 0,
    religion:           applicant.religion || '',
    dominant_hand:      formatDominantHand(applicant.dominant_hand),

    // Lifestyle
    is_smoking:         applicant.lifestyle?.is_smoking,
    smoking_frequency:  applicant.lifestyle?.is_smoking
      ? (applicant.lifestyle?.smoking_frequency ?? '')
      : '',
    is_drinking:        applicant.lifestyle?.is_drinking_alcohol,
    drinking_frequency: applicant.lifestyle?.is_drinking_alcohol
      ? (applicant.lifestyle?.drinking_frequency ?? '')
      : '',

    // Family sentences + spouse
    family_background_notes: familyNotes,
    spouse_name:   spouseName,
    spouse_work:   spouseWork,
    spouse_salary: spouseSalaryFmt,

    // Education
    vocational:        education.vocational?.school_name || '',
    high_school:       education.highSchool?.school_name || '',
    education_remarks: education.primary?.remarks || 'Completed without stopping',
    year_started:      fmtMonthYear(
      education.primary?.year_started ? `${education.primary.year_started}-06-01` : '',
    ),
    year_ended: fmtMonthYear(
      education.primary?.year_ended ? `${education.primary.year_ended}-03-01` : '',
    ),

    // Work Experience
    present_job_title:       jobTitle,
    present_job_role:        jobRole,
    present_job_description: jobDesc,
    work_years:              workYears,
    work_months:             workMonths,
    salary_amount:           salaryAmt,
    salary_unit:             salaryUnit,

    overseas_duration_years:  overseasYears,
    overseas_duration_months: overseasMonths,

    // Japan contacts
    marucon_name:         marucon?.name || '',
    marucon_batch:        marucon?.batch_no || '',
    marucon_company:      marucon?.company_name || '',
    marucon_relation:     marucon?.relation || '',

    non_marucon_name:     nonMarucon?.name || '',
    non_marucon_contact:  nonMarucon?.contact_number || '',
    non_marucon_company:  nonMarucon?.company_name || '',
    non_marucon_relation: nonMarucon?.relation || '',

    // Footer
    ais_by: staffName ?? applicant.assigned_staff?.full_name ?? '',
    signature_date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    applicant_number: applicant.id ? String(applicant.id).padStart(3, '0') : '',
    status_code:      applicant.quality_grade ?? '',
  }
}

// ─── Private Helpers ─────────────────────────────────────────────────────────

function buildFamilyNotes(applicant: any): string[] {
  const notes: string[] = []
  const family = applicant.family ?? {}

  const living =
    family.living_situation ||
    applicant.living_situation ||
    ''

  if (living?.trim()) {
    notes.push(living.trim())
  }

  const birthOrder = family.birth_order ?? applicant.birth_order
  const sibCount   = family.siblings_count ?? applicant.siblings_count
  const sibDesc    = family.siblings_description ?? applicant.siblings_description

  if (birthOrder && sibCount) {
    let line = `${formatOrdinal(birthOrder)} child among ${sibCount} siblings`
    if (sibDesc?.trim()) line += ` (${sibDesc.trim()})`
    notes.push(line)
  } else if (sibCount) {
    let line = `One of ${sibCount} siblings`
    if (sibDesc?.trim()) line += ` (${sibDesc.trim()})`
    notes.push(line)
  }

  return notes
}

function sumEmploymentDuration(employments?: any[]): { years: number; months: number } {
  if (!employments?.length) return { years: 0, months: 0 }

  let totalMonths = 0
  for (const emp of employments) {
    if (!emp?.date_started) continue
    const y = calcYears(emp.date_started, emp.date_ended)
    const m = calcMonths(emp.date_started, emp.date_ended)
    totalMonths += y * 12 + m
  }

  return {
    years:  Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  }
}

function getPrimaryEmployment(applicant: any): any {
  return (
    applicant.employments?.find((e: any) => e.is_current) ??
    applicant.employments?.[0] ??
    null
  )
}

function getOverseasEmployment(applicant: any): any {
  return (
    applicant.employments?.find(
      (e: any) => e.is_overseas || (e.country && e.country.toLowerCase() !== 'philippines'),
    ) ?? null
  )
}

function extractEducation(applicant: any) {
  const highSchool = applicant.educations?.find(
    (e: any) => e.education_level === 'high_school' || e.education_level === 'senior_high',
  )
  const vocational = applicant.educations?.find(
    (e: any) => e.education_level === 'vocational' || e.education_level === 'college',
  )
  const primary = highSchool ?? applicant.educations?.[0]
  return { highSchool, vocational, primary }
}

function extractJapanContact(applicant: any, type: 'marucon' | 'non_marucon'): any {
  const list = applicant.japan_contacts ?? applicant.japanContacts ?? []
  return list.find((c: any) => c.affiliation_type === type) ?? null
}

function formatOrdinal(n: number | string): string {
  const num = Number(n)
  if (Number.isNaN(num)) return String(n)
  const s = ['th', 'st', 'nd', 'rd']
  const v = num % 100
  return num + (s[(v - 20) % 10] || s[v] || s[0])
}

function formatDateDots(d: string): string {
  if (!d) return ''
  return d.replace(/-/g, '.')
}

function capitalize(s?: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDominantHand(v?: string): string {
  if (v === 'right') return 'Right Hand'
  if (v === 'left') return 'Left Hand'
  if (v === 'both') return 'Both Hands'
  return ''
}

function formatSalaryUnit(unit?: string): string {
  if (unit === 'per_day') return 'per day'
  if (unit === 'per_month') return 'per month'
  if (unit === 'per_year') return 'per year'
  return unit ?? 'per day'
}