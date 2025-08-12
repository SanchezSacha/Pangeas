<template>
  <div>
    <BarChart :chart-data="barChartData" :options="barChartOptions" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = Bar;
const props = defineProps({
  statsData: Object
})

const categoryColors = {
  nature: '#4CAF50',
  historique: '#FFC107',
  secret: '#9C27B0',
  frisson: '#FF5722',
  urbain: '#607D8B'
};

const barChartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Visites par catégorie',
      backgroundColor: [],
      data: []
    }
  ]
});

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

watch(() => props.statsData, (newData) => {
  if (!newData) return;

  const labels = newData.visitedByCategory.map(c => c._id);
  const data = newData.visitedByCategory.map(c => c.count);
  const backgroundColor = labels.map(label => categoryColors[label] || '#888888');

  barChartData.value = {
    labels,
    datasets: [
      {
        label: 'Visites par catégorie',
        backgroundColor,
        data
      }
    ]
  };
}, { immediate: true });
</script>
