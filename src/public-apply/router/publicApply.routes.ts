import type { RouteRecordRaw } from 'vue-router'

const publicApplyRoutes: RouteRecordRaw[] = [
  {
    path: '/apply',
    component: () => import('../layouts/PublicApplyLayout.vue'), 
    children: [
      {
        path: '',
        name: 'public.apply.form',
        component: () => import('../pages/PublicApplyForm.vue'),
        meta: { guest: true },
      },
      {
        path: 'success',
        name: 'public.apply.success',
        component: () => import('../pages/PublicApplySuccess.vue'),
        meta: { guest: true },
      },
    ],
  },
]

export default publicApplyRoutes