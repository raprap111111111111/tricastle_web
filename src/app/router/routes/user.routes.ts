// src/app/router/routes/user.routes.ts

import type { RouteRecordRaw } from 'vue-router'

export const userRoutes: RouteRecordRaw[] = [
  {
    path:      '/users',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta:      { requiresAuth: true },
    children: [
      {
        path:      '',
        name:      'users.index',
        component: () => import('@features/users/views/UserIndexView.vue'),
        meta:      { title: 'Users', requiresAuth: true },
      },
      {
        path:      'create',
        name:      'users.create',
        component: () => import('@features/users/views/UserCreateView.vue'),
        meta:      { title: 'Create User', requiresAuth: true },
      },
      {
        path:      ':id',
        name:      'users.show',
        component: () => import('@features/users/views/UserShowView.vue'),
        props:     (route) => ({ id: Number(route.params.id) }),
        meta:      { title: 'User Details', requiresAuth: true },
      },
      {
        path:      ':id/edit',
        name:      'users.edit',
        component: () => import('@features/users/views/UserEditView.vue'),
        props:     (route) => ({ id: Number(route.params.id) }),
        meta:      { title: 'Edit User', requiresAuth: true },
      },
    ],
  },
]