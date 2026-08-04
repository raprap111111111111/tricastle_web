// src/app/router/routes/activity-log.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const activityLogRoutes: RouteRecordRaw[] = [
  {
    path: '/activity-logs',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'activity-logs.index',
        component: () => import('@features/activity-logs/views/ActivityLogsView.vue'),
        meta: {
          title: 'Activity Logs',
          requiresAuth: true,
          permissions: [Perm.activityLogViewAny],
        },
      },
      {
        path: ':id',
        name: 'activity-logs.show',
        component: () => import('@features/activity-logs/views/ActivityLogView.vue'),
        meta: {
          title: 'Activity Log',
          requiresAuth: true,
          permissions: [Perm.activityLogViewAny],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]