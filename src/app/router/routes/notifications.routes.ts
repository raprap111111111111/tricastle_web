// src/app/router/routes/notifications.routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const notificationsRoutes: RouteRecordRaw[] = [
  {
    path: '/notifications',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // ─── List ────────────────────────────────────────
      {
        path: '',
        name: 'notifications.index',
        component: () =>
          import('@features/notifications/views/NotificationsView.vue'),
        meta: {
          title: 'Notifications',
          requiresAuth: true,
        },
      },
    ],
  },
]