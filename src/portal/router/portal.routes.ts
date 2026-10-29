// src/portal/router/portal.routes.ts
import type { RouteRecordRaw } from 'vue-router'

const portalRoutes: RouteRecordRaw[] = [
  {
    path: '/portal',
    component: () => import('../layouts/PortalLayout.vue'),
    meta: { layout: 'portal' },
    children: [
      { path: '', redirect: '/portal/login' },

      // ── Guest ───────────────────────────────────────────────
      {
        path: 'login',
        name: 'portal.login',
        component: () => import('../pages/PortalLogin.vue'),
        meta: { guest: true, layout: 'portal' },
      },
      {
        path: 'verify',
        name: 'portal.verify',
        component: () => import('../pages/PortalVerify.vue'),
        meta: { guest: true, layout: 'portal' },
      },
      {
        path: 'register',
        name: 'portal.register',
        component: () => import('../pages/PortalRegister.vue'),
        meta: { guest: true, layout: 'portal' },
      },
      /*
      {
        path: 'forgot-password',
        name: 'portal.forgot-password',
        component: () => import('../pages/PortalForgotPassword.vue'),
        meta: { guest: true, layout: 'portal' },
      },
      */

      // ── Authenticated applicant ─────────────────────────────
      {
        path: 'dashboard',
        name: 'portal.dashboard',
        component: () => import('../pages/PortalDashboard.vue'),
        meta: { requiresPortalAuth: true, layout: 'portal' },
      },
      {
        path: 'profile',
        name: 'portal.profile',
        component: () => import('../pages/PortalProfileUpdate.vue'),
        meta: { requiresPortalAuth: true, layout: 'portal' },
      },
    ],
  },
]

export default portalRoutes