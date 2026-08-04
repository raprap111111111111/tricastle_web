// src/shared/constants/nav.config.ts
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
          icon: 'pi pi-check-square',
          title: 'Verifications',
          to: '/verifications',                     
          permissions: [Perm.documentVerificationViewAny],
        },
        {
          icon: 'pi pi-clock',
          title: 'Expiring Soon',
          to: '/document-expiry-alerts',
          permissions: [Perm.documentExpiryAlertViewAny],
        },
        {
          icon: 'pi pi-history',
          title: 'Version History',
          to: '/document-versions',
          permissions: [Perm.documentVersionViewAny],
        },
      ],
    },

    // ─── WORKFLOW ──────────────────────────────────────────
    {
      title: 'WORKFLOW',
      items: [
        {
          icon: 'pi pi-pencil',
          title: 'Correction Requests',
          to: '/correction-requests',               
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
          title: 'Issues & Mismatches',
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

    // ─── CONFIGURATION ─────────────────────────────────────
    {
      title: 'CONFIGURATION',
      items: [
        {
          icon: 'pi pi-tag',
          title: 'Document Types',
          to: '/document-types',
          permissions: [Perm.documentTypeViewAny],
        },
        {
          icon: 'pi pi-tags',
          title: 'Company Categories',
          to: '/company-categories',
          permissions: [Perm.companyCategoryViewAny],
        },
        {
          icon: 'pi pi-folder',
          title: 'File Storage',
          to: '/file-repository',
          permissions: [Perm.fileRepositoryViewAny],
        },
        {
          icon: 'pi pi-cog',
          title: 'Settings',
          to: '/settings',
          permissions: [Perm.settingView],
        },
      ],
    },

    // ─── SYSTEM (Admin) ────────────────────────────────────
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
      ],
    },
  ]
}