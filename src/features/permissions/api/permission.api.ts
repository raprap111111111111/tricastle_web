import http from '@/shared/api/http'
import type {
  CreatePermissionPayload,
  UpdatePermissionPayload,
  ListPermissionsParams,
  PermissionListResponse,
  PermissionResponse,
  PermissionGroupedResponse,
} from '../types'

const BASE = '/permissions'

export const permissionApi = {
  /**
   * GET /permissions
   */
  getAll(params: ListPermissionsParams = {}): Promise<PermissionListResponse> {
    return http.get(BASE, { params })
  },

  /**
   * GET /permissions/grouped
   */
  getGrouped(): Promise<PermissionGroupedResponse> {
    return http.get(`${BASE}/grouped`)
  },

  /**
   * GET /permissions/:id
   */
  getById(id: number): Promise<PermissionResponse> {
    return http.get(`${BASE}/${id}`)
  },

  /**
   * POST /permissions
   */
  create(payload: CreatePermissionPayload): Promise<PermissionResponse> {
    return http.post(BASE, payload)
  },

  /**
   * PUT /permissions/:id
   */
  update(id: number, payload: UpdatePermissionPayload): Promise<PermissionResponse> {
    return http.put(`${BASE}/${id}`, payload)
  },

  /**
   * DELETE /permissions/:id
   */
  remove(id: number): Promise<{ success: boolean; message: string }> {
    return http.delete(`${BASE}/${id}`)
  },
}