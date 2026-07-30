import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const batchRoutes: RouteRecordRaw[] = [
  {
    path: '/batches',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'batches.index',
        component: () => import('@features/batches/views/BatchesView.vue'),
        meta: {
          title: 'Batches',
          requiresAuth: true,
          permissions: [Perm.batchViewAny],
        },
      },
      {
        path: 'create',
        name: 'batches.create',
        component: () => import('@features/batches/views/BatchCreateView.vue'),
        meta: {
          title: 'New Batch',
          requiresAuth: true,
          permissions: [Perm.batchCreate],
        },
      },
      {
        path: ':id',
        name: 'batches.show',
        component: () => import('@features/batches/views/BatchShowView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: {
          title: 'Batch Details',
          requiresAuth: true,
          permissions: [Perm.batchView],
        },
      },
      {
        path: ':id/edit',
        name: 'batches.edit',
        component: () => import('@features/batches/views/BatchEditView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: {
          title: 'Edit Batch',
          requiresAuth: true,
          permissions: [Perm.batchUpdate],
        },
      },
    ],
  },
]