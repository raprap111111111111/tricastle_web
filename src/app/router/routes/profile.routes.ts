// src/app/router/routes/profile.routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@features/profile/views/ProfileView.vue'),
        meta: {
          title: 'My Profile',
          requiresAuth: true,
          // no permissions — every authenticated user can open their own profile
        },
      },
    ],
  },
]