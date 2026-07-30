export const Perm = {
  // Dashboard
  dashboardView: 'dashboard.view',

  // Applicant
  applicantViewAny: 'applicant.viewAny',
  applicantView: 'applicant.view',
  applicantCreate: 'applicant.create',
  applicantUpdate: 'applicant.update',
  applicantDelete: 'applicant.delete',
  applicantAssign: 'applicant.assign',
  applicantTransfer: 'applicant.transfer',

  // Document
  documentViewAny: 'document.viewAny',
  documentView: 'document.view',
  documentCreate: 'document.create',
  documentUpdate: 'document.update',
  documentDelete: 'document.delete',
  documentDownload: 'document.download',
  documentReplace: 'document.replace',
  documentViewHistory: 'document.view-history',
  documentLock: 'document.lock',
  documentUnlock: 'document.unlock',

  // Document Verification
  documentVerificationViewAny: 'document-verification.viewAny',
  documentVerificationView: 'document-verification.view',
  documentVerificationCreate: 'document-verification.create',
  documentVerificationUpdate: 'document-verification.update',
  documentVerificationDelete: 'document-verification.delete',
  documentVerificationStart: 'document-verification.start',
  documentVerificationComplete: 'document-verification.complete',
  documentVerificationApprove: 'document-verification.approve',
  documentVerificationReject: 'document-verification.reject',

  // Correction
  correctionViewAny: 'correction.viewAny',
  correctionView: 'correction.view',
  correctionCreate: 'correction.create',
  correctionUpdate: 'correction.update',
  correctionDelete: 'correction.delete',
  correctionApprove: 'correction.approve',
  correctionReject: 'correction.reject',
  correctionComplete: 'correction.complete',
  correctionCancel: 'correction.cancel',

  // Correction Approval
  correctionApprovalViewAny: 'correction-approval.viewAny',
  correctionApprovalView: 'correction-approval.view',
  correctionApprovalCreate: 'correction-approval.create',
  correctionApprovalApprove: 'correction-approval.approve',
  correctionApprovalReject: 'correction-approval.reject',
  correctionApprovalEscalate: 'correction-approval.escalate',

  // Quality Score
  qualityScoreViewAny: 'quality-score.viewAny',
  qualityScoreView: 'quality-score.view',
  qualityScoreCreate: 'quality-score.create',
  qualityScoreUpdate: 'quality-score.update',
  qualityScoreDelete: 'quality-score.delete',
  qualityScoreRecalculate: 'quality-score.recalculate',

  // Verification Mismatch
  verificationMismatchViewAny: 'verification-mismatch.viewAny',
  verificationMismatchView: 'verification-mismatch.view',
  verificationMismatchResolve: 'verification-mismatch.resolve',
  verificationMismatchWaive: 'verification-mismatch.waive',
  verificationMismatchEscalate: 'verification-mismatch.escalate',

  // File Repository
  fileRepositoryViewAny: 'file-repository.viewAny',
  fileRepositoryView: 'file-repository.view',
  fileRepositoryCreate: 'file-repository.create',
  fileRepositoryDelete: 'file-repository.delete',

  // Document Type
  documentTypeViewAny: 'document-type.viewAny',
  documentTypeManage: 'document-type.manage',

  // User
  userViewAny: 'user.viewAny',
  userView: 'user.view',
  userCreate: 'user.create',
  userUpdate: 'user.update',
  userDelete: 'user.delete',
  userActivate: 'user.activate',
  userDeactivate: 'user.deactivate',
  userResetPassword: 'user.reset-password',
  userImpersonate: 'user.impersonate',

  // Role & Permission
  roleViewAny: 'role.viewAny',
  roleView: 'role.view',
  roleCreate: 'role.create',
  roleUpdate: 'role.update',
  roleDelete: 'role.delete',
  roleAssign: 'role.assign',
  permissionViewAny: 'permission.viewAny',
  permissionManage: 'permission.manage',

  // Reports
  reportView: 'report.view',
  reportGenerate: 'report.generate',
  analyticsView: 'analytics.view',
  dataExport: 'data.export',

  // Logs
  activityLogViewAny: 'activity-log.viewAny',
  loginHistoryViewAny: 'login-history.viewAny',
  auditTrailViewAny: 'audit-trail.viewAny',

  // Settings
  settingView: 'setting.view',
  settingUpdate: 'setting.update',
  notificationSettingManage: 'notification-setting.manage',
  emailTemplateManage: 'email-template.manage',
  workflowManage: 'workflow.manage',
  systemHealthView: 'system-health.view',

  // Notifications
  notificationViewAny: 'notification.viewAny',
  notificationSend: 'notification.send',
  notificationTemplateManage: 'notification-template.manage',

  // Developer
  approvalBypass: 'approval.bypass',
  developerToolAccess: 'developer-tool.access',
  sensitiveDataView: 'sensitive-data.view',
  apiTokenManage: 'api-token.manage',
  backupManage: 'backup.manage',

  // ── Batches ───────────────────────────────────
  batchViewAny: 'batch.viewAny',
  batchView: 'batch.view',
  batchCreate: 'batch.create',
  batchUpdate: 'batch.update',
  batchDelete: 'batch.delete',

  // ── Companies ─────────────────────────────────
  companyViewAny: 'company.viewAny',
  companyView: 'company.view',
  companyCreate: 'company.create',
  companyUpdate: 'company.update',
  companyDelete: 'company.delete',
  companyCategoryViewAny: 'company_category.viewAny',
  companyCategoryView: 'company-category.view',
  companyCategoryCreate: 'company-category.create',
  companyCategoryUpdate: 'company-category.update',
  companyCategoryDelete: 'company-category.delete',

  // ── Document Versions & Alerts ────────────────
  documentVersionViewAny: 'document_version.viewAny',
  documentExpiryAlertViewAny: 'document_expiry_alert.viewAny',

  // ── OCR ───────────────────────────────────────
  ocrJobViewAny: 'ocr_job.viewAny',
  ocrTemplateViewAny: 'ocr_template.viewAny',
  ocrFieldExtractionViewAny: 'ocr_field_extraction.viewAny',
  ocrManualCorrectionViewAny: 'ocr_manual_correction.viewAny',

  // ── Communication ─────────────────────────────
  notificationView: 'notification.view',
  commentViewAny: 'comment.viewAny',

  // ── System ────────────────────────────────────
  accessControlViewAny: 'access_control.viewAny',
  socialAccountViewAny: 'social_account.viewAny',





  // ... rest
} as const

export type Permission = typeof Perm[keyof typeof Perm]