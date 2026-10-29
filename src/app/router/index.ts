import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth.guard'

import { authRoutes } from './routes/auth.routes'
import { dashboardRoutes } from './routes/dashboard.routes'
import { profileRoutes } from './routes/profile.routes'
import { applicantsRoutes } from './routes/applicants.routes'
import { documentsRoutes } from './routes/documents.routes'
import { userRoutes } from './routes/user.routes'
import { rolesRoutes } from './routes/roles.routes'
import { settingsRoutes } from './routes/settings.routes'
import { batchRoutes } from './routes/batch.routes'
import { companyRoutes } from './routes/company.routes'
import { companyCategoryRoutes } from './routes/company-category.routes'
import { documentTypesRoutes } from './routes/document-types.routes'
import { verificationRoutes } from './routes/verification.routes'
import { documentVersionsRoutes } from './routes/document-versions.routes'
import { documentExpiryAlertRoutes } from './routes/document-expiry-alert.routes'
import { fileRepositoryRoutes } from './routes/file-repository.routes'
import { permissionsRoutes } from './routes/permissions.routes'
import { correctionRequestRoutes } from './routes/correction-request.routes'
import { correctionApprovalRoutes } from './routes/correction-approval.routes'
import { verificationMismatchRoutes } from './routes/verification-mismatch.routes'
import { activityLogRoutes } from './routes/activity-log.routes'
import { notificationsRoutes } from './routes/notifications.routes'
import { deploymentRoutes } from './routes/deployment.routes'
import { internshipRoutes } from './routes/internship.routes'
import { profileUpdatesRoutes } from './routes/profile-updates.routes'

// Portal router & guard
import portalRoutes from '@/portal/router/portal.routes'
import { portalGuard } from '@/portal/router/portal.guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },

    // Staff Routes
    ...authRoutes,
    ...dashboardRoutes,
    ...profileRoutes,
    ...applicantsRoutes,
    ...documentsRoutes,
    ...userRoutes,
    ...rolesRoutes,
    ...settingsRoutes,
    ...batchRoutes,
    ...companyRoutes,
    ...companyCategoryRoutes,
    ...documentTypesRoutes,
    ...verificationRoutes,
    ...documentVersionsRoutes,
    ...documentExpiryAlertRoutes,
    ...fileRepositoryRoutes,
    ...permissionsRoutes,
    ...correctionRequestRoutes,
    ...correctionApprovalRoutes,
    ...verificationMismatchRoutes,
    ...activityLogRoutes,
    ...notificationsRoutes,
    ...deploymentRoutes,
    ...internshipRoutes,
    ...profileUpdatesRoutes,

    // Applicant Portal Routes
    ...portalRoutes,

    { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/dashboard' },
  ],
})

router.beforeEach((to, from) => {
  // 1) Let portalGuard handle /portal/* routes
  const portalResult = portalGuard(to)
  if (portalResult !== null) {
    return portalResult
  }

  // 2) Let authGuard handle Staff routes
  return authGuard(to, from)
})

export default router