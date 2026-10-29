// src/app/router/routes/profile-updates.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'
import MainLayout from '@/app/layouts/MainLayout.vue'

export const profileUpdatesRoutes: RouteRecordRaw[] = [
  {
    path: '/profile-update-requests',
    component: MainLayout,
    meta: { requiresAuth: true }, // staff token required
    children: [
      {
        path: '',
        name: 'profile-update-requests.index',
        component: () =>
          import('@/features/profile-updates/views/ProfileUpdatesView.vue'),
        meta: {
          title: 'Profile Updates',
          requiresAuth: true,
          permissions: [Perm.applicantViewAny], // staff permission
        },
      },
    ],
  },
]