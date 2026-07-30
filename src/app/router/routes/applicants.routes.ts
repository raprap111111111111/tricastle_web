import type { RouteRecordRaw } from 'vue-router'

export const applicantsRoutes: RouteRecordRaw[] = [
  {
    path: '/applicants',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'applicants.index',
        component: () => import('@features/applicants/views/ApplicantsView.vue'),
        meta: { title: 'Applicants', requiresAuth: true },
      },
      {
        path: 'create',
        name: 'applicants.create',
        component: () => import('@features/applicants/views/ApplicantCreateView.vue'),
        meta: { title: 'Create Applicant', requiresAuth: true },
      },
      {
        path: ':id',   // ← NEW view route
        name: 'applicants.show',
        component: () => import('@features/applicants/views/ApplicantView.vue'),
        meta: { title: 'View Applicant', requiresAuth: true },
        props: (route) => ({ id: Number(route.params.id) }),
      },
      {
        path: ':id/edit',
        name: 'applicants.edit',
        component: () => import('@features/applicants/views/ApplicantEditView.vue'),
        meta: { title: 'Edit Applicant', requiresAuth: true },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
]