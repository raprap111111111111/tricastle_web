import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'
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
        meta: {
          title: 'Document Types',
          requiresAuth: true,
          permissions: [Perm.documentTypeViewAny],
        },
      },
      {
        path: 'create',
        name: 'document-types.create',
        component: () =>
          import('@/features/document-types/views/DocumentTypeCreateView.vue'),
        meta: {
          title: 'New Document Type',
          requiresAuth: true,
          permissions: [Perm.documentTypeManage],
        },
      },
      {
        path: ':id(\\d+)',
        name: 'document-types.view',
        component: () =>
          import('@/features/document-types/views/DocumentTypeView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: {
          title: 'Document Type Details',
          requiresAuth: true,
          permissions: [Perm.documentTypeViewAny],
        },
      },
      {
        path: ':id(\\d+)/edit',
        name: 'document-types.edit',
        component: () =>
          import('@/features/document-types/views/DocumentTypeEditView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: {
          title: 'Edit Document Type',
          requiresAuth: true,
          permissions: [Perm.documentTypeManage],
        },
      },
    ],
  },
]