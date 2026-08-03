// src/app/router/routes/permissions.routes.ts

import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const permissionsRoutes: RouteRecordRaw[] = [
  {
    path: '/permissions',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Permissions',
        component: () => import('@features/permissions/views/PermissionsView.vue'),
        meta: {
          title:        'Permissions',
          requiresAuth: true,
          permissions:  [Perm.permissionViewAny],
        },
      },
    ],
  },
]