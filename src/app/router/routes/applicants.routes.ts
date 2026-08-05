// src/app/router/routes/applicants.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const applicantsRoutes: RouteRecordRaw[] = [
  {
    path: '/applicants',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // ─── List ────────────────────────────────────────
      {
        path: '',
        name: 'applicants.index',
        component: () =>
          import('@features/applicants/views/ApplicantsView.vue'),
        meta: {
          title: 'Applicants',
          requiresAuth: true,
          permissions: [Perm.applicantViewAny],
        },
      },

      // ─── Final List ──────────────────────────────────
      {
        path: 'final-list',
        name: 'applicants.final-list',
        component: () =>
          import('@features/applicants/views/FinalListView.vue'),
        meta: {
          title: 'Final List',
          requiresAuth: true,
          permissions: [Perm.applicantViewAny],
        },
      },
      {
        path: 'final-list/:folderKey',
        name: 'applicants.final-list.folder',
        component: () =>
          import('@features/applicants/views/FinalListFolderView.vue'),
        props: (route) => ({ folderKey: String(route.params.folderKey) }),
        meta: {
          title: 'Final List Folder',
          requiresAuth: true,
          permissions: [Perm.applicantViewAny],
        },
      },

      // ─── Create ──────────────────────────────────────
      {
        path: 'create',
        name: 'applicants.create',
        component: () =>
          import('@features/applicants/views/ApplicantCreateView.vue'),
        meta: {
          title: 'Create Applicant',
          requiresAuth: true,
          permissions: [Perm.applicantCreate],
        },
      },
      
      {
        path: 'rejected',                    
        name: 'applicants.rejected',
        component: () =>
          import('@features/applicants/views/RejectedApplicantsView.vue'),
        meta: {
          title: 'Rejected Applicants',
          requiresAuth: true,
          permissions: [Perm.applicantViewAny],
        },
      },


      // ─── View / Edit ─────────────────────────────────
      {
        path: ':id',
        name: 'applicants.show',
        component: () =>
          import('@features/applicants/views/ApplicantView.vue'),
        meta: {
          title: 'View Applicant',
          requiresAuth: true,
          permissions: [Perm.applicantView],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
      {
        path: ':id/edit',
        name: 'applicants.edit',
        component: () =>
          import('@features/applicants/views/ApplicantEditView.vue'),
        meta: {
          title: 'Edit Applicant',
          requiresAuth: true,
          permissions: [Perm.applicantUpdate],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]