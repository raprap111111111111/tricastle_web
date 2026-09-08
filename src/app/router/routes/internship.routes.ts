// src/app/router/routes/internship.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const internshipRoutes: RouteRecordRaw[] = [
  {
    path: '/internships',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'internships.index',
        component: () =>
          import('@features/internships/views/InternshipsView.vue'),
        meta: {
          title: 'Internships',
          requiresAuth: true,
          permissions: [Perm.internshipViewAny],
        },
      },
      {
        path: ':id',
        name: 'internships.show',
        component: () =>
          import('@features/internships/views/InternshipView.vue'),
        meta: {
          title: 'Internship Details',
          requiresAuth: true,
          permissions: [Perm.internshipView],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]