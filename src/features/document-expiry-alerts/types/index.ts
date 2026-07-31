// src/features/document-expiry-alerts/types/index.ts

export type AlertType = '30_days' | '60_days' | '90_days' | 'expired';

/**
 * Represents an ApplicantDocument with derived expiry alert data.
 * Sourced from GET /applicant-documents/expiring
 */
export interface DocumentExpiryAlert {
  // ─── From applicant_documents table ──────────────
  id: number;
  applicant_id: number;
  document_type_id: number;
  file_repository_id: number | null;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  priority: string;
  document_date: string | null;
  expiry_date: string;
  is_expired: boolean;
  version: number;
  is_current_version: boolean;
  created_at: string;
  updated_at: string;

  // ─── Derived on the backend (attached in Action) ──
  days_until_expiry: number;
  alert_type: AlertType;
  is_critical: boolean;

  // ─── Relations ────────────────────────────────────
  applicant?: {
    id: number;
    first_name?: string;
    last_name?: string;
    applicant_code?: string;
    full_name?: string;
    email?: string;
  };

  document_type?: {
    id: number;
    name: string;
    code: string;
  };
}

/**
 * Filters for the expiring documents endpoint.
 */
export interface DocumentExpiryAlertFilters {
  search?: string;
  offset?: number;
  limit?: number;
  order_by?: 'expiry_date' | 'created_at';
  order_dir?: 'asc' | 'desc';
  alert_type?: AlertType | '';
  applicant_id?: number | null;
  document_type_id?: number | null;
}