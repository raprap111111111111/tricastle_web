// src/app/layouts/widgets/sidebar/sidebarNavConfig.ts
import { Perm } from '@shared/constants/permissions'
import type { NavSection } from '@shared/types/nav.types'

interface PermissionContext {
  role: string
  isSuperAdmin: boolean
}

export function buildNavSections(_ctx: PermissionContext): NavSection[] {
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
          title: 'Applicants',
          to: '/applicants',
          exact: true,
          permissions: [Perm.applicantViewAny],
        },
        {
          icon: 'pi pi-folder-open',
          title: 'Final List',
          to: '/applicants/final-list',
          permissions: [Perm.applicantViewAny],
        },
        {
          icon: 'pi pi-times-circle',
          title: 'Rejected',
          to: '/applicants/rejected',
          permissions: [Perm.applicantViewAny],
        },
        {
          icon: 'pi pi-graduation-cap',
          title: 'Batches',
          to: '/batches',
          permissions: [Perm.batchViewAny],
        },
        // 🚀 NEW: Deployments
        {
          icon: 'pi pi-send',
          title: 'Deployments',
          to: '/deployments',
          permissions: [Perm.applicantViewAny],
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
          permissions: [Perm.documentViewAny],
        },
        {
          icon: 'pi pi-clock',
          title: 'Expiring Soon',
          to: '/document-expiry-alerts',
          permissions: [Perm.documentExpiryAlertViewAny],
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
      ],
    },
  ]
}