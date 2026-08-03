// src/app/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth.guard'
import { authRoutes } from './routes/auth.routes'
import { dashboardRoutes } from './routes/dashboard.routes'
import { profileRoutes } from './routes/profile.routes'
import { applicantsRoutes } from './routes/applicants.routes'
import { documentsRoutes } from './routes/documents.routes'
import { usersRoutes } from './routes/users.routes'
import { rolesRoutes } from './routes/roles.routes'
import { settingsRoutes } from './routes/settings.routes'
import { batchRoutes } from './routes/batch.routes'
import { companyRoutes } from './routes/company.routes'
import { companyCategoryRoutes } from './routes/company-category.routes'
import { documentTypesRoutes } from './routes/document-types.routes'
import { verificationRoutes } from './routes/verification.routes'
import { documentVersionsRoutes } from './routes/document-versions.routes'
import { documentExpiryAlertRoutes } from './routes/document-expiry-alert.routes' // ← ADD

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    ...authRoutes,
    ...dashboardRoutes,
    ...profileRoutes,
    ...applicantsRoutes,
    ...documentsRoutes,
    ...usersRoutes,
    ...rolesRoutes,
    ...settingsRoutes,
    ...batchRoutes,
    ...companyRoutes,
    ...companyCategoryRoutes,
    ...documentTypesRoutes,
    ...verificationRoutes,
    ...documentVersionsRoutes,
    ...documentExpiryAlertRoutes,

    { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/dashboard' },
  ],
})

router.beforeEach(authGuard)

export default router