// src/app/router/routes/deployment.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const deploymentRoutes: RouteRecordRaw[] = [
  {
    path: '/deployments',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // ─── List ────────────────────────────────────────
      {
        path: '',
        name: 'deployments.index',
        component: () =>
          import('@features/deployments/views/DeploymentsView.vue'),
        meta: {
          title: 'Deployments',
          requiresAuth: true,
          permissions: [Perm.applicantViewAny],   // Adjust if you have deployment-specific perms
        },
      },

      // ─── Detail ──────────────────────────────────────
      {
        path: ':id',
        name: 'deployments.show',
        component: () =>
          import('@features/deployments/views/DeploymentDetailView.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: {
          title: 'Deployment Details',
          requiresAuth: true,
          permissions: [Perm.applicantView],
        },
      },
    ],
  },
]