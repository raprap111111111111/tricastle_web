import type { RouteRecordRaw } from 'vue-router'
import { Perm } from '@shared/constants/permissions'

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: '/settings',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Settings',
        component: () => import('@features/settings/views/SettingsView.vue'),
        meta: { title: 'Settings', requiresAuth: true, permissions: [Perm.settingView] },
      },
    ],
  },
]