import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const verificationRoutes: RouteRecordRaw[] = [
  {
    path: '/verifications',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'verification.list',
        component: () =>
          import('@features/verification/views/VerificationListView.vue'),
        meta: {
          title: 'Verifications',
          requiresAuth: true,
          permissions: [Perm.documentVerificationViewAny],
        },
      },
      {
        path: ':id/review',
        name: 'verification.review',
        component: () =>
          import('@features/verification/views/VerificationReviewView.vue'),
        meta: {
          title: 'Review Verification',
          requiresAuth: true,
          permissions: [
            Perm.documentVerificationView,
            Perm.documentVerificationStart,
          ],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
      {
        path: ':id',
        name: 'verification.detail',
        component: () =>
          import('@features/verification/views/VerificationDetailView.vue'),
        meta: {
          title: 'Verification Details',
          requiresAuth: true,
          permissions: [Perm.documentVerificationView],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]