import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'
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
        redirect: { name: 'documents.batches' },
      },
      {
        path: 'batches',
        name: 'documents.batches',
        component: () =>
          import('@/features/documents/views/BatchDocumentListView.vue'),
        meta: {
          title: 'Document Batches',
          requiresAuth: true,
          permissions: [Perm.documentViewAny],
        },
      },
      {
        path: 'batches/:batchId(\\d+)/folders',
        name: 'documents.folders',
        component: () =>
          import('@/features/documents/views/DocumentFoldersView.vue'),
        props: (route) => ({ batchId: Number(route.params.batchId) }),
        meta: {
          title: 'Applicant Folders',
          requiresAuth: true,
          permissions: [Perm.documentViewAny],
        },
      },
      {
        path: 'folders/:applicantId(\\d+)',
        name: 'documents.folder',
        component: () =>
          import('@/features/documents/views/DocumentFolderView.vue'),
        props: (route) => ({
          applicantId: Number(route.params.applicantId),
        }),
        meta: {
          title: 'Applicant Documents',
          requiresAuth: true,
          permissions: [Perm.documentViewAny],
        },
      },
      {
        path: 'create',
        name: 'documents.create',
        component: () =>
          import('@/features/documents/views/DocumentCreateView.vue'),
        meta: {
          title: 'Upload Document',
          requiresAuth: true,
          permissions: [Perm.documentCreate],
        },
      },

      // ✅ NEW — dedicated scan route
      {
        path: 'scan',
        name: 'documents.scan',
        component: () =>
          import('@/features/documents/views/DocumentScanView.vue'),
        meta: {
          title: 'Scan Document',
          requiresAuth: true,
          permissions: [Perm.documentCreate],
        },
      },

      {
        path: ':id(\\d+)',
        name: 'documents.view',
        component: () =>
          import('@/features/documents/views/DocumentView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: {
          title: 'Document Details',
          requiresAuth: true,
          permissions: [Perm.documentView],
        },
      },
      {
        path: ':id(\\d+)/edit',
        name: 'documents.edit',
        component: () =>
          import('@/features/documents/views/DocumentEditView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: {
          title: 'Edit Document',
          requiresAuth: true,
          permissions: [Perm.documentUpdate],
        },
      },
    ],
  },
]