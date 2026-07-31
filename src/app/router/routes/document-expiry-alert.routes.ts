// src/app/router/routes/document-expiry-alert.routes.ts

import type { RouteRecordRaw } from 'vue-router';

export const documentExpiryAlertRoutes: RouteRecordRaw[] = [
  {
    path: '/document-expiry-alerts',
    component: () => import('@app/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'document-expiry-alerts.index',
        component: () =>
          import('@features/document-expiry-alerts/views/DocumentExpiryAlertListView.vue'),
        meta: { title: 'Document Expiry Alerts', requiresAuth: true },
      },
      {
        path: ':id',
        name: 'document-expiry-alerts.show',
        component: () =>
          import('@features/document-expiry-alerts/views/DocumentExpiryAlertShowView.vue'),
        meta: { title: 'Alert Detail', requiresAuth: true },
        props: (route) => ({ id: Number(route.params.id) }),
      },
    ],
  },
];