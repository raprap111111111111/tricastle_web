// src/shared/utils/ais/index.ts

// Public API — types
export type { AISData, BulkAISMode, BulkProgress } from './types'

// Public API — mapper (for custom AIS building)
export { mapApplicantToAIS } from './mapper'

// Public API — generators
export { generateAIS, generateBulkAIS } from './generator'