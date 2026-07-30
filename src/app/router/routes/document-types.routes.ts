// src/app/router/routes/document-types.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/app/layouts/MainLayout.vue'

export const documentTypesRoutes: RouteRecordRaw[] = [
  {
    path: '/document-types',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'document-types.index',
        component: () =>
          import('@/features/document-types/views/DocumentTypesView.vue'),
        meta: { title: 'Document Types' },
      },
      {
        path: 'create',
        name: 'document-types.create',
        component: () =>
          import('@/features/document-types/views/DocumentTypeCreateView.vue'),
        meta: { title: 'New Document Type' },
      },
      {
        path: ':id(\\d+)',
        name: 'document-types.view',
        component: () =>
          import('@/features/document-types/views/DocumentTypeView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: { title: 'Document Type Details' },
      },
      {
        path: ':id(\\d+)/edit',
        name: 'document-types.edit',
        component: () =>
          import('@/features/document-types/views/DocumentTypeEditView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: { title: 'Edit Document Type' },
      },
    ],
  },
]