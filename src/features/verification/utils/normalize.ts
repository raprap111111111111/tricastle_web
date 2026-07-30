/**
 * Normalize values for comparison between source (document) and entered values.
 * Handles: whitespace, case, dates, common OCR artifacts.
 */

export function normalizeString(value: unknown): string {
  if (value == null) return '';
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeDate(value: unknown): string {
  if (!value) return '';
  const str = String(value).trim();
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) return normalizeString(str);
  return parsed.toISOString().split('T')[0];
}

export function isDateField(fieldName: string): boolean {
  return /date|dob|birth|issue|expir/i.test(fieldName);
}

export function valuesMatch(
  source: unknown,
  entered: unknown,
  fieldName?: string,
): boolean {
  if (source == null && entered == null) return true;
  if (source == null || entered == null) return false;

  if (fieldName && isDateField(fieldName)) {
    return normalizeDate(source) === normalizeDate(entered);
  }

  return normalizeString(source) === normalizeString(entered);
}

export function isEmpty(value: unknown): boolean {
  return value == null || String(value).trim() === '';
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}