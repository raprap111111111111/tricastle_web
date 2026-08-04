// src/shared/pubnub/channels.ts

export const PubNubChannels = {
  // Global
  APPLICANTS:    'tricastle.applicants',
  BATCHES:       'tricastle.batches',
  DOCUMENTS:     'tricastle.documents',      
  NOTIFICATIONS: 'tricastle.notifications',
  ACTIVITY_LOGS: 'tricastle.activity_logs',
  

  // User-specific
  forUser:      (id: number) => `tricastle.user.${id}`,

  // Applicant-specific
  forApplicant:          (id: number) => `tricastle.applicant.${id}`,
  forApplicantDocuments: (id: number) => `tricastle.applicant.${id}.documents`,  

  // Batch-specific
  forBatch:          (id: number) => `tricastle.batch.${id}`,
  forBatchDocuments: (id: number) => `tricastle.batch.${id}.documents`,  

  // Document-specific
  forDocument: (id: number) => `tricastle.document.${id}`,  
} as const