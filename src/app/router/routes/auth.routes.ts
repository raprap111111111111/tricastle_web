import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@app/layouts/AuthLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      { path: '', redirect: '/auth/login' },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@features/auth/views/LoginView.vue'),
        meta: { title: 'Login', requiresGuest: true },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@features/auth/views/RegisterView.vue'),
        meta: { title: 'Register', requiresGuest: true },
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('@features/auth/views/ForgotPasswordView.vue'),
        meta: { title: 'Forgot Password', requiresGuest: true },
      },
    ],
  },
]