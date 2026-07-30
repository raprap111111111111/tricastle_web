import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@features/dashboard/views/DashboardView.vue'),
        meta: { title: 'Dashboard', requiresAuth: true, permissions: [Perm.dashboardView] },
      },
    ],
  },
]