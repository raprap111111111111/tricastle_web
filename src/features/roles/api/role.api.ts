// src/features/roles/api/role.api.ts

import http from '@/shared/api/http'
import type {
  CreateRolePayload,
  UpdateRolePayload,
  SyncPermissionsPayload,
  RoleFilters,
  RoleListResponse,
  RoleResponse,
  RolePermissionsResponse,
} from '../types'

const BASE = '/roles'

export const roleApi = {
  /**
   * GET /roles — with optional filter params
   */
  getAll(params: RoleFilters = {}): Promise<RoleListResponse> {
    return http.get(BASE, { params })  // ✅ Now accepts params
  },

  /**
   * GET /roles/:id
   */
  getById(id: number): Promise<RoleResponse> {
    return http.get(`${BASE}/${id}`)
  },

  /**
   * POST /roles
   */
  create(payload: CreateRolePayload): Promise<RoleResponse> {
    return http.post(BASE, payload)
  },

  /**
   * PUT /roles/:id
   */
  update(id: number, payload: UpdateRolePayload): Promise<RoleResponse> {
    return http.put(`${BASE}/${id}`, payload)
  },

  /**
   * DELETE /roles/:id
   */
  remove(id: number): Promise<{ success: boolean; message: string }> {
    return http.delete(`${BASE}/${id}`)
  },

  /**
   * PUT /roles/:id/permissions
   */
  syncPermissions(id: number, payload: SyncPermissionsPayload): Promise<RoleResponse> {
    return http.put(`${BASE}/${id}/permissions`, payload)
  },

  /**
   * GET /roles/:id/permissions
   */
  getPermissions(id: number): Promise<RolePermissionsResponse> {
    return http.get(`${BASE}/${id}/permissions`)
  },
}