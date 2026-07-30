// src/app/router/routes/documents.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/app/layouts/MainLayout.vue'

export const documentsRoutes: RouteRecordRaw[] = [
  {
    path: '/documents',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'documents.index',
        component: () =>
          import('@/features/documents/views/DocumentsView.vue'),
        meta: { title: 'Documents' },
      },
      {
        path: 'create',
        name: 'documents.create',
        component: () =>
          import('@/features/documents/views/DocumentCreateView.vue'),
        meta: { title: 'Upload Document' },
      },
      // ─── Folder drill-down ─────────────────────────────────────
      {
        path: 'folders/:applicantId(\\d+)',
        name: 'documents.folder',
        component: () =>
          import('@/features/documents/views/DocumentFolderView.vue'),
        props: (route) => ({ applicantId: Number(route.params.applicantId) }),
        meta: { title: 'Applicant Documents' },
      },
      // ─── Single document ───────────────────────────────────────
      {
        path: ':id(\\d+)',
        name: 'documents.view',
        component: () =>
          import('@/features/documents/views/DocumentView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: { title: 'Document Details' },
      },
      {
        path: ':id(\\d+)/edit',
        name: 'documents.edit',
        component: () =>
          import('@/features/documents/views/DocumentEditView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: { title: 'Edit Document' },
      },
    ],
  },
]