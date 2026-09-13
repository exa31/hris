<template>
  <div class="relative w-full h-[300px]">
    <Doughnut :data="chartData" :options="chartOptions" />
    <!-- Center Label -->
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span class="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Diversity</span>
      <span class="text-3xl font-black text-white tracking-tighter">{{ (female / totalValue * 100).toFixed(0) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  male: number;
  female: number;
}

const props = defineProps<Props>();

const totalValue = computed(() => props.male + props.female || 1);

const chartData = computed(() => ({
  labels: ['Male', 'Female'],
  datasets: [
    {
      data: [props.male, props.female],
      backgroundColor: [
        'rgba(255, 255, 255, 0.2)', // white transparent
        '#34d399', // emerald-400
      ],
      hoverBackgroundColor: [
        'rgba(255, 255, 255, 0.4)',
        '#10b981',
      ],
      borderWidth: 0,
      cutout: '82%',
      borderRadius: 20,
      spacing: 10,
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
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 11,
          weight: 'bold',
        },
        color: '#e0e7ff', // indigo-100
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#ffffff',
      titleColor: '#1e293b',
      bodyColor: '#1e293b',
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 11, weight: 'bold' },
      padding: 12,
      cornerRadius: 16,
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
