// src/features/document-expiry-alerts/stores/document-expiry-alert.store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { documentExpiryAlertApi } from '../api/document-expiry-alert.api';
import type { DocumentExpiryAlert, DocumentExpiryAlertFilters } from '../types';

export const useDocumentExpiryAlertStore = defineStore('documentExpiryAlert', () => {
  // ─── State ─────────────────────────────────────────
  const alerts        = ref<DocumentExpiryAlert[]>([]);
  const selectedAlert = ref<DocumentExpiryAlert | null>(null);
  const total         = ref<number>(0);
  const currentPage   = ref<number>(1);
  const lastPage      = ref<number>(1);
  const hasMore       = ref<boolean>(false);
  const loading       = ref<boolean>(false);
  const error         = ref<string | null>(null);

  const filters = ref<DocumentExpiryAlertFilters>({
    search:           '',
    offset:           0,
    limit:            10,
    order_by:         'expiry_date',
    order_dir:        'asc',
    alert_type:       '',
    applicant_id:     null,
    document_type_id: null,
  });

  // ─── Getters ───────────────────────────────────────
  const expiredAlerts = computed(() =>
    (alerts.value ?? []).filter((a) => a?.alert_type === 'expired')
  );

  const criticalAlerts = computed(() =>
    (alerts.value ?? []).filter(
      (a) => a?.alert_type === '30_days' || a?.alert_type === 'expired'
    )
  );

  const alertsByType = computed(() => {
    const groups: Record<string, DocumentExpiryAlert[]> = {
      expired:   [],
      '30_days': [],
      '60_days': [],
      '90_days': [],
    };
    (alerts.value ?? []).forEach((a) => {
      if (a?.alert_type && groups[a.alert_type]) {
        groups[a.alert_type].push(a);
      }
    });
    return groups;
  });

  // ─── Response Unwrapper ────────────────────────────
  function unwrapList(rawAxiosResponse: any) {
    console.log('[unwrapList] raw:', rawAxiosResponse);

    let payload = rawAxiosResponse;

    // Unwrap Laravel responseSuccess()
    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      ('success' in payload || 'message' in payload)
    ) {
      payload = payload.data;
    }

    // Custom pagination shape: { records: [...], total, current_page, ... }
    if (payload && Array.isArray(payload.records)) {
      return {
        list:        payload.records as DocumentExpiryAlert[],
        total:       payload.total        ?? payload.records.length,
        currentPage: payload.current_page ?? 1,
        lastPage:    payload.last_page    ?? 1,
        hasMore:     payload.has_more     ?? false,
      };
    }

    // Fallback shapes
    if (payload && Array.isArray(payload.data)) {
      return {
        list:        payload.data as DocumentExpiryAlert[],
        total:       payload.meta?.total ?? payload.total ?? payload.data.length,
        currentPage: payload.meta?.current_page ?? 1,
        lastPage:    payload.meta?.last_page    ?? 1,
        hasMore:     false,
      };
    }

    if (Array.isArray(payload)) {
      return {
        list:        payload as DocumentExpiryAlert[],
        total:       payload.length,
        currentPage: 1,
        lastPage:    1,
        hasMore:     false,
      };
    }

    console.warn('[unwrapList] Unexpected shape:', rawAxiosResponse);
    return { list: [], total: 0, currentPage: 1, lastPage: 1, hasMore: false };
  }

  function unwrapItem(rawAxiosResponse: any): DocumentExpiryAlert | null {
    let payload = rawAxiosResponse;

    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      ('success' in payload || 'message' in payload)
    ) {
      payload = payload.data;
    }

    if (payload && !Array.isArray(payload) && payload.data && payload.data.id) {
      payload = payload.data;
    }

    return payload ?? null;
  }

  // ─── Actions ───────────────────────────────────────
  async function fetchAlerts(overrideFilters?: Partial<DocumentExpiryAlertFilters>) {
    loading.value = true;
    error.value = null;
    try {
      if (overrideFilters) {
        filters.value = { ...filters.value, ...overrideFilters };
      }

      const response = await documentExpiryAlertApi.list(filters.value);
      const result   = unwrapList(response);

      alerts.value      = result.list ?? [];
      total.value       = result.total ?? 0;
      currentPage.value = result.currentPage;
      lastPage.value    = result.lastPage;
      hasMore.value     = result.hasMore;
    } catch (err: any) {
      console.error('[fetchAlerts] ERROR:', err);
      error.value  = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch alerts';
      alerts.value = [];
      total.value  = 0;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAlert(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await documentExpiryAlertApi.show(id);
      selectedAlert.value = unwrapItem(response);
      return selectedAlert.value;
    } catch (err: any) {
      console.error('[fetchAlert] ERROR:', err);
      error.value = err?.response?.data?.message ?? 'Failed to fetch document';
      selectedAlert.value = null;
    } finally {
      loading.value = false;
    }
  }

  function setPage(page: number) {
    filters.value.offset = (page - 1) * (filters.value.limit ?? 10);
  }

  function resetFilters() {
    filters.value = {
      search:           '',
      offset:           0,
      limit:            10,
      order_by:         'expiry_date',
      order_dir:        'asc',
      alert_type:       '',
      applicant_id:     null,
      document_type_id: null,
    };
  }

  return {
    // State
    alerts,
    selectedAlert,
    total,
    currentPage,
    lastPage,
    hasMore,
    loading,
    error,
    filters,
    // Getters
    expiredAlerts,
    criticalAlerts,
    alertsByType,
    // Actions
    fetchAlerts,
    fetchAlert,
    setPage,
    resetFilters,
  };
});