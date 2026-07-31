// src/features/document-expiry-alerts/composables/useDocumentExpiryAlert.ts

import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia';
import { useDocumentExpiryAlertStore } from '../stores/document-expiry-alert.store';
import type { AlertType } from '../types';

export function useDocumentExpiryAlerts() {
  const store = useDocumentExpiryAlertStore();
  const toast = useToast();

  const {
    alerts,
    selectedAlert,
    total,
    loading,
    filters,
    expiredAlerts,
    criticalAlerts,
    alertsByType,
    currentPage,
    lastPage,
  } = storeToRefs(store);

  // ─── Alert Type Config ────────────────────────────
  const alertTypeConfig: Record<
    AlertType,
    { label: string; severity: string; color: string; icon: string; badgeClass: string }
  > = {
    '30_days': {
      label:      '≤ 30 Days',
      severity:   'danger',
      color:      'text-red-600 bg-red-50 border-red-200',
      badgeClass: 'bg-red-100 text-red-700 border-red-200',
      icon:       'pi pi-exclamation-triangle',
    },
    '60_days': {
      label:      '≤ 60 Days',
      severity:   'warning',
      color:      'text-orange-600 bg-orange-50 border-orange-200',
      badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
      icon:       'pi pi-exclamation-circle',
    },
    '90_days': {
      label:      '≤ 90 Days',
      severity:   'info',
      color:      'text-blue-600 bg-blue-50 border-blue-200',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
      icon:       'pi pi-info-circle',
    },
    expired: {
      label:      'Expired',
      severity:   'danger',
      color:      'text-gray-600 bg-gray-100 border-gray-300',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
      icon:       'pi pi-times-circle',
    },
  };

  // ─── Methods ──────────────────────────────────────
  async function loadAlerts() {
    try {
      await store.fetchAlerts();
    } catch {
      toast.add({
        severity: 'error',
        summary:  'Error',
        detail:   'Failed to load expiring documents',
        life:     4000,
      });
    }
  }

  async function handlePageChange(page: number) {
    store.setPage(page);
    await store.fetchAlerts();
  }

  async function handleFilterChange() {
    filters.value.offset = 0;
    await store.fetchAlerts();
  }

  async function handleRefresh() {
    await store.fetchAlerts();
    toast.add({
      severity: 'success',
      summary:  'Refreshed',
      detail:   'Expiring documents list has been refreshed',
      life:     2500,
    });
  }

  function getAlertConfig(type: AlertType) {
    return alertTypeConfig[type] ?? alertTypeConfig['90_days'];
  }

  function formatDaysUntilExpiry(days: number): string {
    if (days < 0)   return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  }

  return {
    // State
    alerts,
    selectedAlert,
    total,
    loading,
    filters,
    // Getters
    expiredAlerts,
    criticalAlerts,
    alertsByType,
    currentPage,
    lastPage,
    // Config
    alertTypeConfig,
    // Methods
    loadAlerts,
    handlePageChange,
    handleFilterChange,
    handleRefresh,
    getAlertConfig,
    formatDaysUntilExpiry,
  };
}