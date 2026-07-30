import { computed, type Ref } from 'vue';
import type {
  FieldDefinition,
  CompareRow,
  VerificationMismatch,
  MismatchType,
  MismatchSeverity,
} from '../types';
import { valuesMatch, isEmpty, isDateField } from '../utils/normalize';

interface Options {
  fields: FieldDefinition[];
  sourceData: Ref<Record<string, any> | null | undefined>;
  enteredData: Ref<Record<string, any>>;
}

export function useMismatchDetection({ fields, sourceData, enteredData }: Options) {
  const rows = computed<CompareRow[]>(() =>
    fields.map((field) => {
      const source = sourceData.value?.[field.name] ?? null;
      const entered = enteredData.value?.[field.name] ?? '';
      const sourceEmpty = isEmpty(source);
      const enteredEmpty = isEmpty(entered);

      return {
        field,
        source_value: sourceEmpty ? null : String(source),
        entered_value: enteredEmpty ? '' : String(entered),
        is_missing: sourceEmpty || enteredEmpty,
        is_match:
          !sourceEmpty &&
          !enteredEmpty &&
          valuesMatch(source, entered, field.name),
      };
    }),
  );

  const summary = computed(() => {
    const total = rows.value.length;
    const matched = rows.value.filter((r) => r.is_match).length;
    const missing = rows.value.filter((r) => r.is_missing).length;
    const mismatched = total - matched - missing;
    const percentage = total ? Number(((matched / total) * 100).toFixed(2)) : 0;

    return {
      total_fields: total,
      matched_fields: matched,
      mismatched_fields: mismatched,
      missing_fields: missing,
      match_percentage: percentage,
    };
  });

  const detectedMismatches = computed<Partial<VerificationMismatch>[]>(() =>
    rows.value
      .filter((r) => !r.is_match)
      .map((r) => {
        let type: MismatchType = 'value_mismatch';
        if (isEmpty(r.source_value)) type = 'missing_in_document';
        else if (isEmpty(r.entered_value)) type = 'missing_in_system';
        else if (isDateField(r.field.name)) type = 'date_mismatch';

        const severity: MismatchSeverity = r.field.required
          ? 'critical'
          : type === 'missing_in_system'
          ? 'moderate'
          : 'low';

        return {
          field_name: r.field.name,
          field_label: r.field.label,
          source_value: r.source_value,
          entered_value: r.entered_value || null,
          mismatch_type: type,
          severity,
          status: 'open' as const,
        };
      }),
  );

  return { rows, summary, detectedMismatches };
}