// src/app/router/routes/correction-approval.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const correctionApprovalRoutes: RouteRecordRaw[] = [
  {
    path: '/correction-approvals',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'correction-approvals.index',
        component: () =>
          import('@features/correction-approvals/views/CorrectionApprovalListView.vue'),
        meta: {
          title: 'Correction Approvals',
          requiresAuth: true,
          permissions: [Perm.correctionApprovalViewAny],
        },
      },
      {
        path: ':id(\\d+)',
        name: 'correction-approvals.show',
        component: () =>
          import('@features/correction-approvals/views/CorrectionApprovalDetailView.vue'),
        meta: {
          title: 'Approval Detail',
          requiresAuth: true,
          permissions: [Perm.correctionApprovalView],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]