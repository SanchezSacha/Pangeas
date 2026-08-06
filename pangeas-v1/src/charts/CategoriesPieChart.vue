<template>
  <div class="pie-chart-shell">
    <PieChart :chart-data="pieChartData" :options="pieChartOptions" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Pie } from 'vue-chartjs';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const PieChart = Pie;

const props = defineProps({
  categoriesData: Object
});

const categoryColors = {
  nature: '#4CAF50',
  historique: '#FFC107',
  secret: '#9C27B0',
  frisson: '#FF5722',
  urbain: '#607D8B'
};

const pieChartData = ref({
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: []
    }
  ]
});

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 14,
        boxHeight: 14,
        padding: 14,
        usePointStyle: true,
        pointStyle: 'rectRounded'
      }
    }
  }
};

watch(() => props.categoriesData, (newData) => {
  if (!newData) return;

  const labels = newData.labels;
  const data = newData.values;
  const backgroundColor = labels.map(label => categoryColors[label] || '#888888');

  pieChartData.value = {
    labels,
    datasets: [
      {
        data,
        backgroundColor
      }
    ]
  };
}, { immediate: true });
</script>

<style scoped>
.pie-chart-shell {
  width: min(100%, 36rem);
  height: 24rem;
  margin: 0 auto;
}

@media (max-width: 767px) {
  .pie-chart-shell {
    width: 100%;
    height: 22rem;
  }
}
</style>
