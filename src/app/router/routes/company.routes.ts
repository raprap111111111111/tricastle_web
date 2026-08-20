import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const companyRoutes: RouteRecordRaw[] = [
  {
    path: '/companies',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'companies.index',
        component: () => import('@features/companies/views/CompaniesView.vue'),
        meta: {
          title: 'Companies',
          requiresAuth: true,
          permissions: [Perm.companyViewAny],
        },
      },
      {
        path: 'create',
        name: 'companies.create',
        component: () =>
          import('@features/companies/views/CompanyCreateView.vue'),
        meta: {
          title: 'Create Company',
          requiresAuth: true,
          permissions: [Perm.companyCreate],
        },
      },
      {
        path: ':id',
        name: 'companies.show',
        component: () => import('@features/companies/views/CompanyView.vue'),
        meta: {
          title: 'View Company',
          requiresAuth: true,
          permissions: [Perm.companyView],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
      {
        path: ':id/edit',
        name: 'companies.edit',
        component: () => import('@features/companies/views/CompanyEditView.vue'),
        meta: {
          title: 'Edit Company',
          requiresAuth: true,
          permissions: [Perm.companyUpdate],
        },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]