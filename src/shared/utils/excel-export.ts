// src/shared/utils/excel-export.ts

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportMode = 'applicant' | 'batch' | 'location' | 'status'

export interface ExcelColumn {
  header: string
  key:    string
  width?: number
  /** Category grouping for the UI column picker */
  group?: string
}

// ─── Column Definitions ───────────────────────────────────────────────────────

const PERSONAL_COLUMNS: ExcelColumn[] = [
  { header: 'Applicant Code',    key: 'applicant_code',     width: 18, group: 'Personal' },
  { header: 'Status',            key: 'status',             width: 18, group: 'Personal' },
  { header: 'First Name',        key: 'first_name',         width: 18, group: 'Personal' },
  { header: 'Middle Name',       key: 'middle_name',        width: 18, group: 'Personal' },
  { header: 'Last Name',         key: 'last_name',          width: 18, group: 'Personal' },
  { header: 'Suffix',            key: 'suffix',             width: 10, group: 'Personal' },
  { header: 'Email',             key: 'email',              width: 28, group: 'Personal' },
  { header: 'Phone',             key: 'phone',              width: 18, group: 'Personal' },
  { header: 'Mobile',            key: 'mobile',             width: 18, group: 'Personal' },
  { header: 'Date of Birth',     key: 'date_of_birth',      width: 18, group: 'Personal' },
  { header: 'Age',               key: 'age',                width: 8,  group: 'Personal' },
  { header: 'Gender',            key: 'gender',             width: 12, group: 'Personal' },
  { header: 'Civil Status',      key: 'civil_status',       width: 15, group: 'Personal' },
  { header: 'No. of Children',   key: 'number_of_children', width: 16, group: 'Personal' },
  { header: 'Nationality',       key: 'nationality',        width: 18, group: 'Personal' },
]

const PHYSICAL_COLUMNS: ExcelColumn[] = [
  { header: 'Height (cm)',   key: 'height_cm',     width: 14, group: 'Physical' },
  { header: 'Weight (kg)',   key: 'weight_kg',     width: 14, group: 'Physical' },
  { header: 'Blood Type',    key: 'blood_type',    width: 12, group: 'Physical' },
  { header: 'Dominant Hand', key: 'dominant_hand', width: 15, group: 'Physical' },
]

const ADDRESS_COLUMNS: ExcelColumn[] = [
  { header: 'Current Address',   key: 'current_address',   width: 35, group: 'Address' },
  { header: 'Permanent Address', key: 'permanent_address', width: 35, group: 'Address' },
  { header: 'City',              key: 'city',              width: 18, group: 'Address' },
  { header: 'Province',          key: 'province',          width: 18, group: 'Address' },
  { header: 'Postal Code',       key: 'postal_code',       width: 14, group: 'Address' },
]

const DOCUMENT_COLUMNS: ExcelColumn[] = [
  { header: 'Passport Number',   key: 'passport_number',   width: 20, group: 'Documents' },
  { header: 'Passport Expiry',   key: 'passport_expiry',   width: 18, group: 'Documents' },
  { header: 'SSS Number',        key: 'sss_number',        width: 18, group: 'Documents' },
  { header: 'TIN Number',        key: 'tin_number',        width: 18, group: 'Documents' },
  { header: 'PhilHealth Number', key: 'philhealth_number', width: 20, group: 'Documents' },
  { header: 'Pag-IBIG Number',   key: 'pagibig_number',    width: 18, group: 'Documents' },
]

const DEPLOYMENT_COLUMNS: ExcelColumn[] = [
  { header: 'Skill Category',      key: 'skill_category',            width: 18, group: 'Deployment' },
  { header: 'Trade / Occupation',  key: 'trade_or_occupation',       width: 22, group: 'Deployment' },
  { header: 'Basic English',       key: 'understands_basic_english', width: 16, group: 'Deployment' },
  { header: 'JLPT Level',          key: 'jlpt_level',                width: 14, group: 'Deployment' },
  { header: 'Willing to Deploy',   key: 'willing_to_be_deployed',    width: 18, group: 'Deployment' },
  { header: 'JP Deployment Ready', key: 'japan_deployment_ready',    width: 20, group: 'Deployment' },
  { header: 'SSW Eligible',        key: 'ssw_eligible',              width: 14, group: 'Deployment' },
  { header: 'Preferred Location',  key: 'preferred_work_location',   width: 20, group: 'Deployment' },
  { header: 'Japan Experience',    key: 'previous_japan_experience', width: 18, group: 'Deployment' },
  { header: 'Years JP Experience', key: 'years_japan_experience',    width: 18, group: 'Deployment' },
  { header: 'TITP Certificate',    key: 'has_titp_certificate',      width: 18, group: 'Deployment' },
  { header: 'TITP Occupation',     key: 'titp_occupation',           width: 20, group: 'Deployment' },
  { header: 'Expected Salary',     key: 'expected_salary',           width: 18, group: 'Deployment' },
  { header: 'Expected Currency',   key: 'expected_salary_currency',  width: 18, group: 'Deployment' },
  { header: 'Current Salary',      key: 'current_salary',            width: 16, group: 'Deployment' },
  { header: 'Current Currency',    key: 'current_salary_currency',   width: 16, group: 'Deployment' },
]

const QUALITY_COLUMNS: ExcelColumn[] = [
  { header: 'Quality Score', key: 'quality_score', width: 15, group: 'Quality' },
  { header: 'Quality Grade', key: 'quality_grade', width: 14, group: 'Quality' },
]

const BATCH_COLUMNS: ExcelColumn[] = [
  { header: 'Batch Number',        key: 'batch_number',       width: 15, group: 'Batch' },
  { header: 'Batch Name',          key: 'batch_name',         width: 25, group: 'Batch' },
  { header: 'Batch Country',       key: 'batch_country',      width: 18, group: 'Batch' },
  { header: 'Batch Status',        key: 'batch_status',       width: 20, group: 'Batch' },
  { header: 'Interview Date',      key: 'interview_date',     width: 18, group: 'Batch' },
  { header: 'Medical Date',        key: 'medical_date',       width: 16, group: 'Batch' },
  { header: 'Exam Date',           key: 'exam_date',          width: 14, group: 'Batch' },
  { header: 'Exam Score',          key: 'exam_score',         width: 13, group: 'Batch' },
  { header: 'Assigned At',         key: 'assigned_at',        width: 22, group: 'Batch' },
  { header: 'Accepted At',         key: 'accepted_at',        width: 22, group: 'Batch' },
  { header: 'Deployed At',         key: 'deployed_at',        width: 22, group: 'Batch' },
  { header: 'Deployment Country',  key: 'deployment_country', width: 20, group: 'Batch' },
  { header: 'Deployment Company',  key: 'deployment_company', width: 22, group: 'Batch' },
  { header: 'Deployment Position', key: 'deployment_position',width: 22, group: 'Batch' },
  { header: 'Interview Notes',     key: 'interview_notes',    width: 30, group: 'Batch' },
  { header: 'Remarks',             key: 'remarks',            width: 30, group: 'Batch' },
  { header: 'Rejection Reason',    key: 'rejection_reason',   width: 30, group: 'Batch' },
]

const STAFF_COLUMNS: ExcelColumn[] = [
  { header: 'Assigned Staff', key: 'assigned_staff', width: 22, group: 'Staff' },
  { header: 'Created By',     key: 'created_by',     width: 22, group: 'Staff' },
  { header: 'Created At',     key: 'created_at',     width: 22, group: 'Staff' },
]

// ─── Public column bundle for the UI picker ──────────────────────────────────

export const ALL_COLUMNS: ExcelColumn[] = [
  ...PERSONAL_COLUMNS,
  ...PHYSICAL_COLUMNS,
  ...ADDRESS_COLUMNS,
  ...DOCUMENT_COLUMNS,
  ...DEPLOYMENT_COLUMNS,
  ...QUALITY_COLUMNS,
  ...BATCH_COLUMNS,
  ...STAFF_COLUMNS,
]

/** Default preset — sensible essentials */
export const DEFAULT_COLUMN_KEYS: string[] = [
  'applicant_code',
  'first_name',
  'last_name',
  'email',
  'phone',
  'date_of_birth',
  'gender',
  'nationality',
  'status',
  'city',
  'province',
]

/** Presets for quick one-click selection */
export const COLUMN_PRESETS: Record<string, string[]> = {
  minimal: [
    'applicant_code', 'first_name', 'last_name', 'email', 'date_of_birth',
  ],
  contact: [
    'applicant_code', 'first_name', 'last_name', 'email', 'phone', 'mobile',
    'current_address', 'city', 'province',
  ],
  deployment: [
    'applicant_code', 'first_name', 'last_name',
    'skill_category', 'trade_or_occupation', 'jlpt_level',
    'willing_to_be_deployed', 'japan_deployment_ready',
    'expected_salary', 'expected_salary_currency',
  ],
  full: ALL_COLUMNS.map((c) => c.key),
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val: unknown, fallback = ''): string {
  if (val === null || val === undefined || val === '') return fallback
  return String(val)
}

function fmtBool(val: boolean | null | undefined): string {
  if (val === null || val === undefined) return ''
  return val ? 'Yes' : 'No'
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch {
    return ''
  }
}

function fmtDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleString('en-US', {
      year:   'numeric',
      month:  'short',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function capitalize(val: string | null | undefined): string {
  if (!val) return ''
  return val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ')
}

// ─── Row Mapper ───────────────────────────────────────────────────────────────

function mapApplicantToRow(applicant: any, batchRef?: any): Record<string, any> {
  const ab = batchRef ?? applicant.applicant_batches?.[0]

  return {
    // Personal
    applicant_code:     fmt(applicant.applicant_code),
    status:             capitalize(applicant.status),
    first_name:         fmt(applicant.first_name),
    middle_name:        fmt(applicant.middle_name),
    last_name:          fmt(applicant.last_name),
    suffix:             fmt(applicant.suffix),
    email:              fmt(applicant.email),
    phone:              fmt(applicant.phone),
    mobile:             fmt(applicant.mobile),
    date_of_birth:      fmtDate(applicant.date_of_birth),
    age:                applicant.age ?? '',
    gender:             capitalize(applicant.gender),
    civil_status:       capitalize(applicant.civil_status),
    number_of_children: applicant.number_of_children ?? 0,
    nationality:        fmt(applicant.nationality),

    // Physical
    height_cm:     applicant.height_cm ?? '',
    weight_kg:     applicant.weight_kg ?? '',
    blood_type:    fmt(applicant.blood_type),
    dominant_hand: capitalize(applicant.dominant_hand),

    // Address
    current_address:   fmt(applicant.current_address),
    permanent_address: fmt(applicant.permanent_address),
    city:              fmt(applicant.city),
    province:          fmt(applicant.province),
    postal_code:       fmt(applicant.postal_code),

    // Documents
    passport_number:   fmt(applicant.passport_number),
    passport_expiry:   fmtDate(applicant.passport_expiry),
    sss_number:        fmt(applicant.sss_number),
    tin_number:        fmt(applicant.tin_number),
    philhealth_number: fmt(applicant.philhealth_number),
    pagibig_number:    fmt(applicant.pagibig_number),

    // Deployment
    skill_category:            capitalize(applicant.skill_category),
    trade_or_occupation:       fmt(applicant.trade_or_occupation),
    understands_basic_english: fmtBool(applicant.language?.understands_basic_english),
    jlpt_level:                fmt(applicant.language?.jlpt_level),
    willing_to_be_deployed:    fmtBool(applicant.deployment?.willing_to_be_deployed),
    japan_deployment_ready:    fmtBool(applicant.deployment?.japan_deployment_ready),
    ssw_eligible:              fmtBool(applicant.deployment?.ssw_eligible),
    preferred_work_location:   fmt(applicant.deployment?.preferred_work_location),
    previous_japan_experience: fmtBool(applicant.deployment?.previous_japan_experience),
    years_japan_experience:    applicant.deployment?.years_japan_experience ?? '',
    has_titp_certificate:      fmtBool(applicant.deployment?.has_titp_certificate),
    titp_occupation:           fmt(applicant.deployment?.titp_occupation),
    expected_salary:           applicant.salary?.expected_salary ?? '',
    expected_salary_currency:  fmt(applicant.salary?.expected_salary_currency),
    current_salary:            applicant.salary?.current_salary ?? '',
    current_salary_currency:   fmt(applicant.salary?.current_salary_currency),

    // Quality
    quality_score: applicant.quality_score ?? '',
    quality_grade: fmt(applicant.quality_grade),

    // Batch (latest or selected)
    batch_number:        ab?.batch?.batch_number ?? '',
    batch_name:          ab?.batch?.name ?? '',
    batch_country:       ab?.batch?.country ?? '',
    batch_status:        capitalize(ab?.status),
    interview_date:      fmtDate(ab?.interview_date),
    medical_date:        fmtDate(ab?.medical_date),
    exam_date:           fmtDate(ab?.exam_date),
    exam_score:          ab?.exam_score ?? '',
    assigned_at:         fmtDateTime(ab?.assigned_at),
    accepted_at:         fmtDateTime(ab?.accepted_at),
    deployed_at:         fmtDateTime(ab?.deployed_at),
    deployment_country:  fmt(ab?.deployment_country),
    deployment_company:  fmt(ab?.deployment_company),
    deployment_position: fmt(ab?.deployment_position),
    interview_notes:     fmt(ab?.interview_notes),
    remarks:             fmt(ab?.remarks),
    rejection_reason:    fmt(ab?.rejection_reason),

    // Staff
    assigned_staff: applicant.assigned_staff?.full_name ?? '',
    created_by:     applicant.creator?.full_name ?? '',
    created_at:     fmtDateTime(applicant.created_at),
  }
}

// ─── Style Helpers ────────────────────────────────────────────────────────────

function applyHeaderStyle(ws: XLSX.WorkSheet, range: XLSX.Range): void {
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!ws[cellRef]) continue
    ws[cellRef].s = {
      font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill:      { fgColor: { rgb: '1E3A5F' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        bottom: { style: 'medium', color: { rgb: 'F97316' } },
      },
    }
  }
}

function applyRowStripes(
  ws:    XLSX.WorkSheet,
  range: XLSX.Range,
  cols:  number,
): void {
  for (let row = 1; row <= range.e.r; row++) {
    const isEven = row % 2 === 0
    for (let col = 0; col < cols; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      if (!ws[cellRef]) continue
      ws[cellRef].s = {
        fill:      { fgColor: { rgb: isEven ? 'F1F5F9' : 'FFFFFF' } },
        alignment: { vertical: 'center', wrapText: true },
        border: {
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
          right:  { style: 'thin', color: { rgb: 'E2E8F0' } },
        },
      }
    }
  }
}

// ─── Sheet Builder ────────────────────────────────────────────────────────────

function buildSheet(
  rows:    Record<string, any>[],
  columns: ExcelColumn[],
): XLSX.WorkSheet {
  const headers = columns.map((c) => c.header)
  const data    = rows.map((row) => columns.map((c) => row[c.key] ?? ''))

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

  ws['!cols'] = columns.map((c) => ({ wch: c.width ?? 20 }))
  ws['!rows'] = [
    { hpt: 36 },
    ...rows.map(() => ({ hpt: 22 })),
  ]

  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1')
  applyHeaderStyle(ws, range)
  applyRowStripes(ws, range, columns.length)

  return ws
}

// ─── Summary Sheet ────────────────────────────────────────────────────────────

function buildSummarySheet(meta: {
  title:        string
  exportedAt:   string
  totalCount:   number
  filterLabel:  string
  filterValue:  string
  columnCount?: number
  breakdown?:   Record<string, number>
}): XLSX.WorkSheet {
  const rows: any[][] = [
    ['Export Report Summary'],
    [],
    ['Title',         meta.title],
    ['Exported At',   meta.exportedAt],
    ['Total Records', meta.totalCount],
    ...(meta.columnCount !== undefined
      ? [['Columns Included', meta.columnCount] as any[]]
      : []),
    [meta.filterLabel, meta.filterValue],
    [],
  ]

  if (meta.breakdown) {
    rows.push(['Breakdown by Status'])
    Object.entries(meta.breakdown).forEach(([status, count]) => {
      rows.push([capitalize(status), count])
    })
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 22 }, { wch: 35 }]

  if (ws['A1']) {
    ws['A1'].s = {
      font:      { bold: true, sz: 16, color: { rgb: '1E3A5F' } },
      alignment: { horizontal: 'left' },
    }
  }

  return ws
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function writeAndSave(wb: XLSX.WorkBook, fileName: string): void {
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true })
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName)
}

/**
 * Resolve columns from an optional list of selected keys.
 * Preserves the canonical order defined in ALL_COLUMNS.
 * If no keys are supplied → returns everything (backward compatible).
 */
function resolveColumns(selectedKeys?: string[]): ExcelColumn[] {
  if (!selectedKeys || selectedKeys.length === 0) return ALL_COLUMNS
  const set = new Set(selectedKeys)
  return ALL_COLUMNS.filter((c) => set.has(c.key))
}

// ─── Public Export Functions ──────────────────────────────────────────────────

/**
 * Export a single applicant with overview + batch history + summary sheets.
 */
export function exportSingleApplicant(
  applicant:   any,
  columnKeys?: string[],
): void {
  const wb   = XLSX.utils.book_new()
  const cols = resolveColumns(columnKeys)
  const row  = mapApplicantToRow(applicant)

  // Sheet 1 — Overview
  XLSX.utils.book_append_sheet(wb, buildSheet([row], cols), 'Overview')

  // Sheet 2 — Batch History (one row per batch assignment)
  const batches: any[] = applicant.applicant_batches ?? []
  if (batches.length > 0) {
    const batchRows = batches.map((ab: any) => mapApplicantToRow(applicant, ab))
    XLSX.utils.book_append_sheet(wb, buildSheet(batchRows, cols), 'Batch History')
  }

  // Sheet 3 — Summary
  const breakdown = batches.reduce<Record<string, number>>((acc, ab: any) => {
    const s = String(ab.status ?? 'unknown')
    acc[s]  = (acc[s] ?? 0) + 1
    return acc
  }, {})

  XLSX.utils.book_append_sheet(
    wb,
    buildSummarySheet({
      title:       'Single Applicant Export',
      exportedAt:  new Date().toLocaleString(),
      totalCount:  1,
      columnCount: cols.length,
      filterLabel: 'Applicant',
      filterValue: `${applicant.first_name} ${applicant.last_name} (${applicant.applicant_code})`,
      breakdown,
    }),
    'Summary',
  )

  writeAndSave(wb, `applicant_${applicant.applicant_code}_${Date.now()}.xlsx`)
}

/**
 * Export all applicants belonging to a specific batch.
 */
export function exportByBatch(
  applicants:  any[],
  batchName:   string,
  batchId:     number,
  columnKeys?: string[],
): void {
  const wb   = XLSX.utils.book_new()
  const cols = resolveColumns(columnKeys)

  const rows = applicants.map((a: any) => {
    const ab = (a.applicant_batches ?? []).find((b: any) => b.batch_id === batchId)
    return mapApplicantToRow(a, ab)
  })

  XLSX.utils.book_append_sheet(wb, buildSheet(rows, cols), 'Applicants')

  const breakdown = rows.reduce<Record<string, number>>((acc, row) => {
    const s = String(row.batch_status || 'Unknown')
    acc[s]  = (acc[s] ?? 0) + 1
    return acc
  }, {})

  XLSX.utils.book_append_sheet(
    wb,
    buildSummarySheet({
      title:       'Batch Export',
      exportedAt:  new Date().toLocaleString(),
      totalCount:  applicants.length,
      columnCount: cols.length,
      filterLabel: 'Batch',
      filterValue: batchName,
      breakdown,
    }),
    'Summary',
  )

  writeAndSave(wb, `batch_${batchName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
}

/**
 * Export applicants grouped by province — each province gets its own sheet.
 */
export function exportByLocation(
  applicants:  any[],
  location:    string,
  columnKeys?: string[],
): void {
  const wb   = XLSX.utils.book_new()
  const cols = resolveColumns(columnKeys)

  const grouped = applicants.reduce<Record<string, any[]>>((acc, a: any) => {
    const key = String(a.province || 'No Province')
    acc[key]  = acc[key] ?? []
    acc[key].push(a)
    return acc
  }, {})

  Object.entries(grouped).forEach(([province, group]) => {
    const rows      = (group as any[]).map((a: any) => mapApplicantToRow(a))
    const sheetName = province.substring(0, 31)
    XLSX.utils.book_append_sheet(wb, buildSheet(rows, cols), sheetName)
  })

  const breakdown = Object.fromEntries(
    Object.entries(grouped).map(([k, v]) => [k, (v as any[]).length]),
  )

  XLSX.utils.book_append_sheet(
    wb,
    buildSummarySheet({
      title:       'Location Export',
      exportedAt:  new Date().toLocaleString(),
      totalCount:  applicants.length,
      columnCount: cols.length,
      filterLabel: 'Location',
      filterValue: location,
      breakdown,
    }),
    'Summary',
  )

  writeAndSave(wb, `applicants_location_${location.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
}

/**
 * Export applicants by status — each status on its own sheet,
 * or filter to a single status.
 */
export function exportByStatus(
  applicants:    any[],
  statusFilter?: string,
  columnKeys?:   string[],
): void {
  const wb   = XLSX.utils.book_new()
  const cols = resolveColumns(columnKeys)

  if (statusFilter) {
    const rows = applicants.map((a: any) => mapApplicantToRow(a))
    XLSX.utils.book_append_sheet(
      wb,
      buildSheet(rows, cols),
      capitalize(statusFilter).substring(0, 31),
    )
  } else {
    const grouped = applicants.reduce<Record<string, any[]>>((acc, a: any) => {
      const key = String(a.status || 'unknown')
      acc[key]  = acc[key] ?? []
      acc[key].push(a)
      return acc
    }, {})

    Object.entries(grouped).forEach(([status, group]) => {
      const rows      = (group as any[]).map((a: any) => mapApplicantToRow(a))
      const sheetName = capitalize(status).substring(0, 31)
      XLSX.utils.book_append_sheet(wb, buildSheet(rows, cols), sheetName)
    })
  }

  const breakdown = applicants.reduce<Record<string, number>>((acc, a: any) => {
    const s = String(a.status ?? 'unknown')
    acc[s]  = (acc[s] ?? 0) + 1
    return acc
  }, {})

  XLSX.utils.book_append_sheet(
    wb,
    buildSummarySheet({
      title:       'Status Export',
      exportedAt:  new Date().toLocaleString(),
      totalCount:  applicants.length,
      columnCount: cols.length,
      filterLabel: 'Status Filter',
      filterValue: statusFilter ? capitalize(statusFilter) : 'All Statuses',
      breakdown,
    }),
    'Summary',
  )

  writeAndSave(wb, `applicants_status_${statusFilter ?? 'all'}_${Date.now()}.xlsx`)
}

/**
 * Generic bulk export — any list of applicants with a custom label.
 */
export function exportApplicantList(
  applicants:  any[],
  fileName:    string,
  sheetLabel = 'Applicants',
  columnKeys?: string[],
): void {
  const wb   = XLSX.utils.book_new()
  const cols = resolveColumns(columnKeys)
  const rows = applicants.map((a: any) => mapApplicantToRow(a))

  XLSX.utils.book_append_sheet(
    wb,
    buildSheet(rows, cols),
    sheetLabel.substring(0, 31),
  )

  const breakdown = rows.reduce<Record<string, number>>((acc, r) => {
    const s = String(r.status || 'Unknown')
    acc[s]  = (acc[s] ?? 0) + 1
    return acc
  }, {})

  XLSX.utils.book_append_sheet(
    wb,
    buildSummarySheet({
      title:       sheetLabel,
      exportedAt:  new Date().toLocaleString(),
      totalCount:  applicants.length,
      columnCount: cols.length,
      filterLabel: 'Export',
      filterValue: sheetLabel,
      breakdown,
    }),
    'Summary',
  )

  writeAndSave(wb, `${fileName}_${Date.now()}.xlsx`)
}