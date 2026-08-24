// src/features/applicants/constants/document-types.ts

/**
 * Document type IDs from the document_types table.
 * Run in tinker to confirm:
 *   App\Models\DocumentType::pluck('id', 'code')
 */
export const DOCUMENT_TYPE_IDS = {
  PASSPORT:      1,
  NBI:           2,
  MEDICAL:       3,
  POEA_CONTRACT: 4,
  OEC:           5,
  BIRTH_CERT:    6,
  TESDA:         7,
  VISA:          8,
  BIODATA:       9, 
  ID_PHOTO: 10,
} as const