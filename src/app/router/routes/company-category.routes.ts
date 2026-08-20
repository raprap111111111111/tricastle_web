import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const companyCategoryRoutes: RouteRecordRaw[] = [
  {
    path: '/company-categories',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'company-categories.index',
        component: () =>
          import('@features/company-categories/views/CompanyCategoriesView.vue'),
        meta: {
          title: 'Company Categories',
          requiresAuth: true,
          permissions: [Perm.companyCategoryViewAny],
        },
      },
      {
        path: 'create',
        name: 'company-categories.create',
        component: () =>
          import('@features/company-categories/views/CompanyCategoryCreateView.vue'),
        meta: {
          title: 'Create Category',
          requiresAuth: true,
          permissions: [Perm.companyCategoryCreate],
        },
      },
      {
        path: ':id',
        name: 'company-categories.show',
        component: () =>
          import('@features/company-categories/views/CompanyCategoryView.vue'),
        meta: {
          title: 'View Category',
          requiresAuth: true,
          permissions: [Perm.companyCategoryView],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
      {
        path: ':id/edit',
        name: 'company-categories.edit',
        component: () =>
          import('@features/company-categories/views/CompanyCategoryEditView.vue'),
        meta: {
          title: 'Edit Category',
          requiresAuth: true,
          permissions: [Perm.companyCategoryUpdate],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]