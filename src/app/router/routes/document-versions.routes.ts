import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const documentVersionsRoutes: RouteRecordRaw[] = [
  {
    path: '/document-versions',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'document-versions.all',
        component: () =>
          import('@features/document-versions/views/DocumentVersionAllView.vue'),
        meta: {
          title: 'Document Versions',
          requiresAuth: true,
          permissions: [Perm.documentVersionViewAny],
        },
      },
      {
        path: ':id',
        name: 'document-versions.detail',
        component: () =>
          import(
            '@features/document-versions/views/DocumentVersionDetailView.vue'
          ),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: {
          title: 'Version Detail',
          requiresAuth: true,
          permissions: [Perm.documentVersionViewAny],
        },
      },
    ],
  },
  {
    path: '/documents/:applicantDocumentId/versions',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'document-versions.list',
        component: () =>
          import(
            '@features/document-versions/views/DocumentVersionListView.vue'
          ),
        props: (route) => ({
          applicantDocumentId: Number(route.params.applicantDocumentId),
        }),
        meta: {
          title: 'Document Versions',
          requiresAuth: true,
          permissions: [Perm.documentVersionViewAny],
        },
      },
    ],
  },
]