import type { RouteRecordRaw } from 'vue-router'

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@features/profile/views/ProfileView.vue'),
        meta: {
          title: 'My Profile',
          requiresAuth: true,
        },
      },
      {
        path: 'edit',
        name: 'profile.edit',
        component: () => import('@features/profile/views/ProfileEditView.vue'),
        meta: {
          title: 'Edit Profile',
          requiresAuth: true,
        },
      },
      {
        path: 'password',
        name: 'profile.password',
        component: () => import('@features/profile/views/ChangePasswordView.vue'),
        meta: {
          title: 'Change Password',
          requiresAuth: true,
        },
      },
    ],
  },
]