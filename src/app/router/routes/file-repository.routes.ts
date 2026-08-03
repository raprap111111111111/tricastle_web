import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const fileRepositoryRoutes: RouteRecordRaw[] = [
  {
    path: '/file-repository',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'file-repository.index',
        component: () =>
          import(
            '@features/file-repository/views/FileRepositoryIndexView.vue'
          ),
        meta: {
          title: 'File Repository',
          requiresAuth: true,
          permissions: [Perm.fileRepositoryViewAny],
        },
      },
    ],
  },
]