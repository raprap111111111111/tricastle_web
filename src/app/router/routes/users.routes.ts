import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const usersRoutes: RouteRecordRaw[] = [
  {
    path: '/users',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Users',
        component: () => import('@features/users/views/UsersView.vue'),
        meta: { title: 'Users', requiresAuth: true, permissions: [Perm.userViewAny] },
      },
    ],
  },
]