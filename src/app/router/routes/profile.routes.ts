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
        meta: { title: 'My Profile', requiresAuth: true },
      },
    ],
  },
]