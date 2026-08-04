// src/app/router/routes/verification-mismatch.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const verificationMismatchRoutes: RouteRecordRaw[] = [
  {
    path: '/mismatches',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'mismatches.index',
        component: () =>
          import(
            '@features/verification-mismatches/views/VerificationMismatchListView.vue'
          ),
        meta: {
          title: 'Verification Mismatches',
          requiresAuth: true,
          permissions: [Perm.verificationMismatchViewAny],
        },
      },
      {
        path: ':id(\\d+)',
        name: 'mismatches.show',
        component: () =>
          import(
            '@features/verification-mismatches/views/VerificationMismatchDetailView.vue'
          ),
        meta: {
          title: 'Mismatch Details',
          requiresAuth: true,
          permissions: [Perm.verificationMismatchView],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]