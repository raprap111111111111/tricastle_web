// src/features/document-versions/constants/index.ts

export const VERSION_ROUTES = {
  LIST:        '/document-versions',
  SHOW:   (id: number) => `/document-versions/${id}`,
  SET_CURRENT: (id: number) => `/document-versions/${id}/set-current`,
  DELETE: (id: number) => `/document-versions/${id}`,
} as const

export const CHANGE_REASON_PRESETS = [
  { label: 'Initial upload',                       value: 'Initial upload' },
  { label: 'Wrong file uploaded previously',       value: 'Wrong file uploaded previously' },
  { label: 'Better quality scan available',        value: 'Better quality scan available' },
  { label: 'Document renewed by applicant',        value: 'Document renewed by applicant' },
  { label: 'OCR data was unreadable',              value: 'OCR data was unreadable' },
  { label: 'Corrected typo / missing pages',       value: 'Corrected typo / missing pages' },
  { label: 'Other (specify)',                      value: 'Other' },
] as const

export const MAX_UPLOAD_MB = 10
export const ACCEPTED_MIME  = 'image/*,application/pdf'