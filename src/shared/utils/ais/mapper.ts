// src/shared/utils/ais/mapper.ts

import type { AISData } from './types'
import { loadPhotoBase64 } from './assets'
import { calcYears, calcMonths, fmtMonthYear } from './formatters'

/** Extract photo URL from any of the known applicant fields. */
export function getApplicantPhotoUrl(applicant: any): string | null {
  return (
    applicant.photo_url ??
    applicant.profile_photo_url ??
    applicant.avatar_url ??
    null
  )
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
  const education   = extractEducation(applicant)

  return {
    // Header
    position:        applicant.trade_or_occupation ?? '',
    trade_test_try:  '1st',
    trade_test_date: '',
    applicant_code:  applicant.applicant_code,

    // Personal
    last_name:          applicant.last_name,
    first_name:         applicant.first_name,
    middle_name:        applicant.middle_name || 'NMN',
    current_address:    applicant.current_address,
    contact_number:     applicant.phone || applicant.mobile,
    blood_type:         applicant.blood_type,
    english_percent:    applicant.language?.understands_basic_english ? 30 : 0,
    date_of_birth:      applicant.date_of_birth,
    birthplace:         applicant.city,
    age:                applicant.age,
    civil_status:       capitalize(applicant.civil_status),
    height_cm:          applicant.height_cm,
    weight_kg:          applicant.weight_kg,
    number_of_children: applicant.number_of_children,
    religion:           applicant.religion,
    dominant_hand:      formatDominantHand(applicant.dominant_hand),

    // Lifestyle
    is_smoking:         applicant.lifestyle?.is_smoking,
    smoking_frequency:  applicant.lifestyle?.is_smoking ? applicant.lifestyle?.smoking_frequency ?? '' : '',
    is_drinking:        applicant.lifestyle?.is_drinking_alcohol,
    drinking_frequency: applicant.lifestyle?.is_drinking_alcohol ? applicant.lifestyle?.drinking_frequency ?? '' : '',

    // Family
    family_background_notes: familyNotes,
    spouse_name:   applicant.family?.spouse?.name,
    spouse_work:   applicant.family?.spouse?.occupation,
    spouse_salary: '',

    // Education
    vocational:        education.vocational?.school_name,
    high_school:       education.highSchool?.school_name,
    education_remarks: 'Completed without stopping',
    year_started:      fmtMonthYear(education.primary?.year_started ? `${education.primary.year_started}-06-01` : ''),
    year_ended:        fmtMonthYear(education.primary?.year_ended   ? `${education.primary.year_ended}-03-01`   : ''),

    // Work
    present_job_title:        employment?.position,
    present_job_role:         employment?.position === 'Helper' ? 'Helper' : employment?.position,
    present_job_description:  employment?.job_description,
    work_years:               employment ? calcYears(employment.date_started, employment.date_ended)  : 0,
    work_months:              employment ? calcMonths(employment.date_started, employment.date_ended) : 0,
    salary_amount:            employment?.salary,
    overseas_duration_years:  0,
    overseas_duration_months: 0,

    // Footer
    ais_by:           staffName ?? applicant.assigned_staff?.full_name ?? '',
    signature_date:   new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    applicant_number: applicant.id ? String(applicant.id).padStart(3, '0') : '',
    status_code:      applicant.quality_grade ?? '',
  }
}

// ─── Private helpers ─────────────────────────────────────────────────────────

function buildFamilyNotes(applicant: any): string[] {
  const notes: string[] = []

  if (applicant.family?.emergency_contact?.address) {
    notes.push(`Living in ${applicant.family.emergency_contact.address}`)
  }

  if (applicant.family?.father?.name || applicant.family?.mother?.name) {
    const parents = [applicant.family?.father?.name, applicant.family?.mother?.name]
      .filter(Boolean).join(' & ')
    notes.push(`Parents: ${parents}`)
  }

  if (applicant.family?.siblings_count) {
    notes.push(`Eldest among ${applicant.family.siblings_count} siblings`)
  }

  return notes
}

function getPrimaryEmployment(applicant: any): any {
  return applicant.employments?.find((e: any) => e.is_current)
    ?? applicant.employments?.[0]
    ?? null
}

function extractEducation(applicant: any) {
  const highSchool = applicant.educations?.find((e: any) => e.education_level === 'high_school')
  const vocational = applicant.educations?.find((e: any) => e.education_level === 'vocational')
  const primary    = highSchool ?? applicant.educations?.[0]
  return { highSchool, vocational, primary }
}

function capitalize(s?: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDominantHand(v?: string): string {
  if (v === 'right') return 'Right Hand'
  if (v === 'left')  return 'Left Hand'
  if (v === 'both')  return 'Both Hands'
  return ''
}