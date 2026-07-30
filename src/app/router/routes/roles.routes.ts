import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const rolesRoutes: RouteRecordRaw[] = [
  {
    path: '/roles',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Roles',
        component: () => import('@features/roles/views/RolesView.vue'),
        meta: { title: 'Roles & Permissions', requiresAuth: true, permissions: [Perm.roleViewAny] },
      },
    ],
  },
]