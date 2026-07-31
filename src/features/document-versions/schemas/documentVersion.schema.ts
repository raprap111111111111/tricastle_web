// src/features/document-versions/schemas/documentVersion.schema.ts

import { z } from 'zod'

export const documentVersionUploaderSchema = z.object({
  id:    z.number(),
  name:  z.string().nullable(),
  email: z.string().nullable().optional(),
}).nullable()

export const applicantDocumentSnapshotSchema = z.object({
  id:        z.number(),
  file_name: z.string(),
  status:    z.string(),
}).nullable().optional()

export const documentVersionSchema = z.object({
  id:                    z.number(),
  applicant_document_id: z.number(),
  version_number:        z.number(),

  // File info
  file_name:           z.string(),
  file_size:           z.number().nullable(),
  file_size_formatted: z.string().nullable().optional(),
  mime_type:           z.string().nullable(),
  extension:           z.string().nullable().optional(),

  // Data
  extracted_data: z.record(z.any()).nullable().optional(),
  change_reason:  z.string().nullable(),
  is_current:     z.boolean(),

  // Relations
  applicant_document: applicantDocumentSnapshotSchema,
  uploader:           documentVersionUploaderSchema,

  // Meta
  file_path:   z.string().nullable().optional(),
  uploaded_by: z.number().nullable().optional(),
  created_at:  z.string(),
  updated_at:  z.string(),
})

export type DocumentVersion = z.infer<typeof documentVersionSchema>