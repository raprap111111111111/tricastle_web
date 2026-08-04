// src/app/router/routes/correction-request.routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const correctionRequestRoutes: RouteRecordRaw[] = [
  {
    path: '/correction-requests',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'correction-requests.index',
        component: () =>
          import(
            '@features/correction-requests/views/CorrectionRequestListView.vue'
          ),
        meta: {
          title: 'Correction Requests',
          requiresAuth: true,
          permissions: [Perm.correctionViewAny],
        },
      },
      {
        path: ':id(\\d+)',
        name: 'correction-requests.show',
        component: () => {
          console.log('📦 Loading CorrectionRequestDetailView component')
          return import(
            '@features/correction-requests/views/CorrectionRequestDetailView.vue'
          )
        },
        meta: {
          title: 'Correction Request Detail',
          requiresAuth: true,
          permissions: [Perm.correctionView],
        },
        props: (route) => {
          const id = Number(route.params.id)
          console.log('🔑 correction-requests.show props:', {
            raw: route.params.id,
            type: typeof route.params.id,
            converted: id,
            isNaN: isNaN(id),
            fullPath: route.fullPath,
          })
          return { id }
        },
      },
    ],
  },
]