// src/features/deployments/api/deployment.api.ts

import http from '@shared/api/http'
import type {
  Deployment,
  DeployApplicantPayload,
  UpdateDeploymentPayload,
  CancelDeploymentPayload,
  BulkDeployPayload,
  BulkDeployResult,
  DeploymentFilters,
  DeploymentStats,
} from '../types'

const BASE = '/deployments'

// ─── Response wrappers from your Laravel API ──────────────────────────────────
interface PaginatedResponse<T> {
  records: T[]
  total: number
  offset: number
  limit: number
  current_page: number
  last_page: number
  per_page: number
  has_more: boolean
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

// ─── Helper: unwrap response ─────────────────────────────────────────────────
function unwrap<T>(data: any): T {
  return data?.data ?? data
}

export const deploymentApi = {
  // ═══════════════════════════════════════════════════════
  // List deployments (paginated + filtered)
  // ═══════════════════════════════════════════════════════
  async list(filters: DeploymentFilters = {}): Promise<PaginatedResponse<Deployment>> {
    const { data } = await http.get(BASE, { params: filters })
    return unwrap<PaginatedResponse<Deployment>>(data)
  },

  // ═══════════════════════════════════════════════════════
  // Get single deployment
  // ═══════════════════════════════════════════════════════
  async get(id: number): Promise<Deployment> {
    const { data } = await http.get(`${BASE}/${id}`)
    return unwrap<Deployment>(data)
  },

  // ═══════════════════════════════════════════════════════
  // Deploy an applicant
  // PATCH /deployments/{id}/deploy
  // ═══════════════════════════════════════════════════════
  async deploy(id: number, payload: DeployApplicantPayload): Promise<Deployment> {
    const { data } = await http.patch(`${BASE}/${id}/deploy`, payload)
    return unwrap<Deployment>(data)
  },

  // ═══════════════════════════════════════════════════════
  // Update deployment info
  // PUT /deployments/{id}
  // ═══════════════════════════════════════════════════════
  async update(id: number, payload: UpdateDeploymentPayload): Promise<Deployment> {
    const { data } = await http.put(`${BASE}/${id}`, payload)
    return unwrap<Deployment>(data)
  },

  // ═══════════════════════════════════════════════════════
  // Cancel deployment
  // PATCH /deployments/{id}/cancel
  // ═══════════════════════════════════════════════════════
  async cancel(id: number, payload: CancelDeploymentPayload): Promise<Deployment> {
    const { data } = await http.patch(`${BASE}/${id}/cancel`, payload)
    return unwrap<Deployment>(data)
  },

  // ═══════════════════════════════════════════════════════
  // Bulk deploy
  // POST /deployments/bulk
  // ═══════════════════════════════════════════════════════
  async bulkDeploy(payload: BulkDeployPayload): Promise<BulkDeployResult> {
    const { data } = await http.post(`${BASE}/bulk`, payload)
    return unwrap<BulkDeployResult>(data)
  },

  // ═══════════════════════════════════════════════════════
  // Get stats
  // GET /deployments/stats
  // ═══════════════════════════════════════════════════════
  async stats(): Promise<DeploymentStats> {
    const { data } = await http.get(`${BASE}/stats`)
    return unwrap<DeploymentStats>(data)
  },

  // ═══════════════════════════════════════════════════════
  // Get distinct countries (for filter dropdown)
  // GET /deployments/countries
  // ═══════════════════════════════════════════════════════
  async countries(): Promise<string[]> {
    const { data } = await http.get(`${BASE}/countries`)
    return unwrap<string[]>(data)
  },

  // ═══════════════════════════════════════════════════════
  // 🏠 Mark returned home early
  // PATCH /applicant-batches/{id}/return
  // ═══════════════════════════════════════════════════════
  async markReturned(applicantBatchId: number, payload: { return_reason: string }): Promise<any> {
    const { data } = await http.patch(`/applicant-batches/${applicantBatchId}/return`, payload)
    return unwrap(data)
  },

  // ═══════════════════════════════════════════════════════
  // ✅ Mark contract completed
  // PATCH /applicant-batches/{id}/complete
  // ═══════════════════════════════════════════════════════
  async markCompleted(applicantBatchId: number, payload: { completion_notes?: string | null }): Promise<any> {
    const { data } = await http.patch(`/applicant-batches/${applicantBatchId}/complete`, payload)
    return unwrap(data)
  },
}