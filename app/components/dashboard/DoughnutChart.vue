<template>
  <div class="relative w-full h-full">
    <Doughnut :data="chartData" :options="chartOptions" />
    <!-- Center Label -->
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Total</span>
      <span class="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{{ totalValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  kontrak: number;
  tetap: number;
  magang: number;
}

const props = defineProps<Props>();

const totalValue = computed(() => props.kontrak + props.tetap + props.magang);

const chartData = computed(() => ({
  labels: ['Contract', 'Permanent', 'Internship'],
  datasets: [
    {
      data: [props.kontrak, props.tetap, props.magang],
      backgroundColor: [
        '#f59e0b', // amber-500
        '#6366f1', // indigo-500
        '#8b5cf6', // violet-500
      ],
      hoverBackgroundColor: [
        '#d97706',
        '#4f46e5',
        '#7c3aed',
      ],
      borderWidth: 0,
      cutout: '82%',
      borderRadius: 12,
      spacing: 8,
    },
  ],
}));

const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 24,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 11,
          weight: 'bold',
          family: "'Plus Jakarta Sans', sans-serif",
        },
        color: '#94a3b8',
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#1e293b',
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 11, weight: 'bold' },
      padding: 16,
      cornerRadius: 12,
      displayColors: false,
      callbacks: {
        label: (context) => {
          const value = context.parsed;
          const percentage = ((value / totalValue.value) * 100).toFixed(1);
          return ` ${context.label}: ${value} (${percentage}%)`;
        }
      }
    },
  },
};
</script>
