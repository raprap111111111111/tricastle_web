<script setup lang="ts">
defineProps<{
  stats: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    approved: number;
    rejected: number;
  };
}>();

const cards = [
  {
    key: 'total',
    label: 'Total',
    icon: 'pi-file',
    iconBg: 'bg-slate-700',
    iconColor: 'text-white',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: 'pi-clock',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: 'pi-spin pi-spinner',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: 'pi-check',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: 'pi-verified',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: 'pi-times-circle',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
];
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
    <div
      v-for="c in cards"
      :key="c.key"
      class="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition"
    >
      <div class="flex items-start justify-between mb-3">
        <p class="text-sm text-gray-500 font-medium">{{ c.label }}</p>
        <div
          :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center',
            c.iconBg,
          ]"
        >
          <i :class="['pi', c.icon, c.iconColor]" />
        </div>
      </div>
      <p class="text-3xl font-bold text-gray-900">
        {{ (stats as any)[c.key] ?? 0 }}
      </p>
    </div>
  </div>
</template>