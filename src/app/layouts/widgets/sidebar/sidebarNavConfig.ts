// src/shared/constants/nav.config.ts  (or wherever buildNavSections lives)

import { Perm } from '@shared/constants/permissions'
import type { NavSection } from '@shared/types/nav.types'

interface PermissionContext {
  role: string
  isSuperAdmin: boolean
}

export function buildNavSections(ctx: PermissionContext): NavSection[] {
  const isApplicant = ctx.role === 'applicant'

  return [
    // ─── MAIN ──────────────────────────────────────────────
    {
      title: 'MAIN',
      items: [
        {
          icon: 'pi pi-home',
          title: 'Dashboard',
          to: '/dashboard',
          permissions: [Perm.dashboardView],
        },
        {
          icon: 'pi pi-users',
          title: isApplicant ? 'My Application' : 'Applicants',
          to: '/applicants',
          permissions: [Perm.applicantViewAny, Perm.applicantView],
        },
        {
          icon: 'pi pi-graduation-cap',
          title: 'Batches',
          to: '/batches',
          permissions: [Perm.batchViewAny],
        },
        {
          icon: 'pi pi-building',
          title: 'Companies',
          to: '/companies',
          permissions: [Perm.companyViewAny],
        },
        {
          icon: 'pi pi-tags',
          title: 'Company Categories',
          to: '/company-categories',
          permissions: [Perm.companyCategoryViewAny],
        },
      ],
    },

    // ─── DOCUMENTS ─────────────────────────────────────────
    {
      title: 'DOCUMENTS',
      items: [
        {
          icon: 'pi pi-file',
          title: 'Documents',
          to: '/documents',
          permissions: [Perm.documentViewAny, Perm.documentView],
        },
        {
          icon: 'pi pi-history',
          title: 'Document Versions',
          to: '/document-versions',
          permissions: [Perm.documentVersionViewAny],
        },
        {
          // ✅ was '/expiry-alerts' — must match the registered route path
          icon: 'pi pi-clock',
          title: 'Expiry Alerts',
          to: '/document-expiry-alerts',
          permissions: [Perm.documentExpiryAlertViewAny],
        },
        {
          icon: 'pi pi-folder',
          title: 'File Repository',
          to: '/file-repository',
          permissions: [Perm.fileRepositoryViewAny],
        },
        {
          icon: 'pi pi-tag',
          title: 'Document Types',
          to: '/document-types',
          permissions: [Perm.documentTypeViewAny],
        },
      ],
    },

    // ─── OCR & AI ──────────────────────────────────────────
    {
      title: 'OCR & AI',
      items: [
        {
          icon: 'pi pi-eye',
          title: 'OCR Jobs',
          to: '/ocr/jobs',
          permissions: [Perm.ocrJobViewAny],
        },
        {
          icon: 'pi pi-file-edit',
          title: 'OCR Templates',
          to: '/ocr/templates',
          permissions: [Perm.ocrTemplateViewAny],
        },
        {
          icon: 'pi pi-search',
          title: 'Field Extractions',
          to: '/ocr/extractions',
          permissions: [Perm.ocrFieldExtractionViewAny],
        },
        {
          icon: 'pi pi-pencil',
          title: 'Manual Corrections',
          to: '/ocr/corrections',
          permissions: [Perm.ocrManualCorrectionViewAny],
        },
      ],
    },

    // ─── QUALITY ───────────────────────────────────────────
    {
      title: 'QUALITY',
      items: [
        {
          icon: 'pi pi-chart-bar',
          title: 'Quality Scores',
          to: '/quality-scores',
          permissions: [Perm.qualityScoreViewAny],
        },
        {
          icon: 'pi pi-pencil',
          title: 'Correction Requests',
          to: '/corrections',
          permissions: [Perm.correctionViewAny],
        },
        {
          icon: 'pi pi-check-square',
          title: 'Correction Approvals',
          to: '/correction-approvals',
          permissions: [Perm.correctionApprovalViewAny],
        },
        {
          icon: 'pi pi-exclamation-triangle',
          title: 'Verification Mismatches',
          to: '/mismatches',
          permissions: [Perm.verificationMismatchViewAny],
        },
      ],
    },

    // ─── COMMUNICATION ─────────────────────────────────────
    {
      title: 'COMMUNICATION',
      items: [
        {
          icon: 'pi pi-bell',
          title: 'Notifications',
          to: '/notifications',
          permissions: [Perm.notificationView],
        },
        {
          icon: 'pi pi-comments',
          title: 'Comments',
          to: '/comments',
          permissions: [Perm.commentViewAny],
        },
      ],
    },

    // ─── REPORTS ───────────────────────────────────────────
    {
      title: 'REPORTS',
      items: [
        {
          icon: 'pi pi-chart-line',
          title: 'Analytics',
          to: '/analytics',
          permissions: [Perm.analyticsView],
        },
        {
          icon: 'pi pi-file-pdf',
          title: 'Reports',
          to: '/reports',
          permissions: [Perm.reportView],
        },
      ],
    },

    // ─── SYSTEM ────────────────────────────────────────────
    {
      title: 'SYSTEM',
      items: [
        {
          icon: 'pi pi-user',
          title: 'Users',
          to: '/users',
          permissions: [Perm.userViewAny],
        },
        {
          icon: 'pi pi-shield',
          title: 'Roles',
          to: '/roles',
          permissions: [Perm.roleViewAny],
        },
        {
          icon: 'pi pi-key',
          title: 'Permissions',
          to: '/permissions',
          permissions: [Perm.permissionViewAny],
        },
        {
          icon: 'pi pi-lock',
          title: 'Access Control',
          to: '/access-control',
          permissions: [Perm.accessControlViewAny],
        },
        {
          icon: 'pi pi-history',
          title: 'Activity Logs',
          to: '/activity-logs',
          permissions: [Perm.activityLogViewAny],
        },
        {
          icon: 'pi pi-sign-in',
          title: 'Login History',
          to: '/login-history',
          permissions: [Perm.loginHistoryViewAny],
        },
        {
          icon: 'pi pi-share-alt',
          title: 'Social Accounts',
          to: '/social-accounts',
          permissions: [Perm.socialAccountViewAny],
        },
        {
          icon: 'pi pi-cog',
          title: 'Settings',
          to: '/settings',
          permissions: [Perm.settingView],
        },
      ],
    },
  ]
}