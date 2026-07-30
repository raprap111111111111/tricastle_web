<script setup lang="ts">
import Tag from 'primevue/tag';
import type { MismatchSeverity } from '../types';
import { SEVERITY_SEVERITY, SEVERITY_LABELS } from '../constants/verification.constants';

defineProps<{ severity: MismatchSeverity }>();
</script>

<template>
  <Tag :value="SEVERITY_LABELS[severity]" :severity="SEVERITY_SEVERITY[severity]" />
</template>