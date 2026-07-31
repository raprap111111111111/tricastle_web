// src/features/document-expiry-alerts/api/document-expiry-alert.api.ts

import http from '@shared/api/http';
import type { DocumentExpiryAlertFilters } from '../types';

// ✅ Points to the derived endpoint (not a separate alerts table)
const BASE = '/applicant-documents';

export const documentExpiryAlertApi = {
  /**
   * GET /applicant-documents/expiring
   * Returns documents expiring within 90 days or already expired.
   */
  async list(filters: DocumentExpiryAlertFilters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, v]) => v !== null && v !== undefined && v !== ''
      )
    );
    const { data } = await http.get(`${BASE}/expiring`, { params });
    return data;
  },

  /**
   * GET /applicant-documents/:id
   * Returns the underlying applicant document (used for the detail view).
   */
  async show(id: number) {
    const { data } = await http.get(`${BASE}/${id}`);
    return data;
  },
};