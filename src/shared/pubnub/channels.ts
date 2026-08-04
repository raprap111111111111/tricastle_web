export const PubNubChannels = {
  APPLICANTS:    'tricastle.applicants',
  BATCHES:       'tricastle.batches',
  NOTIFICATIONS: 'tricastle.notifications',

  forUser:      (id: number) => `tricastle.user.${id}`,
  forApplicant: (id: number) => `tricastle.applicant.${id}`,
  forBatch:     (id: number) => `tricastle.batch.${id}`,
} as const