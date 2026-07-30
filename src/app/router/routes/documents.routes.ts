// src/app/router/routes/documents.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/app/layouts/MainLayout.vue'

export const documentsRoutes: RouteRecordRaw[] = [
  {
    path: '/documents',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [

      // ─── Root → redirect to Level 1 ────────────────────────────
      {
        path: '',
        name: 'documents.index',
        redirect: { name: 'documents.batches' },
      },

      // ─── Level 1 — Batches ─────────────────────────────────────
      {
        path: 'batches',
        name: 'documents.batches',
        component: () =>
          import('@/features/documents/views/BatchDocumentListView.vue'),
        meta: { title: 'Document Batches' },
      },

      // ─── Level 2 — Folders (plural) inside a batch ────────────
      {
        path: 'batches/:batchId(\\d+)/folders',
        name: 'documents.folders',
        component: () =>
          import('@/features/documents/views/DocumentFoldersView.vue'),
        props: (route) => ({ batchId: Number(route.params.batchId) }),
        meta: { title: 'Applicant Folders' },
      },

      // ─── Level 3 — Folder (singular) for one applicant ────────
      // ⚠️ FIX: your file is DocumentsView.vue with drill-down OR
      //    you need to rename Level-3 file — pick ONE of these two options
      {
        path: 'folders/:applicantId(\\d+)',
        name: 'documents.folder',
        component: () =>
          import('@/features/documents/views/DocumentFolderView.vue'),  // ← MUST EXIST
        props: (route) => ({ applicantId: Number(route.params.applicantId) }),
        meta: { title: 'Applicant Documents' },
      },

      // ─── Create ────────────────────────────────────────────────
      {
        path: 'create',
        name: 'documents.create',
        component: () =>
          import('@/features/documents/views/DocumentCreateView.vue'),
        meta: { title: 'Upload Document' },
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