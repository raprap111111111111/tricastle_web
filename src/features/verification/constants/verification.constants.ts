import type {
  VerificationStatus,
  MismatchSeverity,
  MismatchStatus,
  MismatchType,
  WorkflowStep,
  FieldDefinition,
} from '../types'

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  requires_correction: 'Requires Correction',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const VERIFICATION_STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Requires Correction', value: 'requires_correction' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

export const SEVERITY_LABELS: Record<MismatchSeverity, string> = {
  low: 'Low',
  moderate: 'Moderate',
  critical: 'Critical',
}

export const SEVERITY_SEVERITY: Record<string, string> = {
  low: 'info',
  moderate: 'warn',
  critical: 'danger',
}

export const MISMATCH_STATUS_LABELS: Record<MismatchStatus, string> = {
  open: 'Open',
  correction_requested: 'Correction Requested',
  corrected: 'Corrected',
  waived: 'Waived',
  escalated: 'Escalated',
}

export const MISMATCH_STATUS_SEVERITY: Record<string, string> = {
  open: 'warn',
  correction_requested: 'info',
  corrected: 'success',
  waived: 'secondary',
  escalated: 'danger',
}

export const MISMATCH_TYPE_LABELS: Record<MismatchType, string> = {
  value_mismatch: 'Value Mismatch',
  missing_in_document: 'Missing in Document',
  missing_in_system: 'Missing in System',
  format_mismatch: 'Format Mismatch',
  date_mismatch: 'Date Mismatch',
}

export const WORKFLOW_STEP_LABELS: Record<WorkflowStep, string> = {
  uploaded: 'Uploaded',
  ocr_extraction: 'OCR Extraction',
  staff_review: 'Staff Review',
  mismatch_detection: 'Mismatch Detection',
  correction_requested: 'Correction Requested',
  supervisor_approval: 'Supervisor Approval',
  admin_approval: 'Admin Approval',
  final_verified: 'Final Verified',
  rejected: 'Rejected',
}

export const DEFAULT_FIELDS: FieldDefinition[] = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true },
  { name: 'middle_name', label: 'Middle Name', type: 'text' },
  { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
  { name: 'nationality', label: 'Nationality', type: 'text' },
  { name: 'passport_no', label: 'Passport Number', type: 'text', required: true },
  { name: 'issue_date', label: 'Issue Date', type: 'date' },
  { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
  { name: 'place_of_birth', label: 'Place of Birth', type: 'text' },
]

export const DEFAULT_LIMIT = 10