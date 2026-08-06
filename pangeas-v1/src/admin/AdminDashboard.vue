<template>
  <div>
    <h1 class="h3 mb-4 text-gray-800">Tableau de bord</h1>

    <div class="row">
      <div class="col-xl-4 col-md-6 mb-4" v-for="(card, i) in cards" :key="i">
        <div class="card border-left-primary shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">{{ card.title }}</div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ card.value }}</div>
              </div>
              <div class="col-auto">
                <i :class="card.icon + ' fa-2x text-gray-300'"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card shadow mb-4 dashboard-charts-card">
      <div class="card-body dashboard-charts">
        <div class="chart-panel">
          <h5 class="card-title">Répartition des lieux visités par catégorie</h5>
          <StatsCharts v-if="stats" :statsData="stats" />
        </div>

        <div class="chart-panel">
          <h5 class="card-title">Répartition catégories (détail)</h5>
          <CategoriesPieChart v-if="categoriesData" :categoriesData="categoriesData" />
        </div>
      </div>
    </div>

    <div class="card shadow mb-4">
      <div class="card-body p-3">
        <h5 class="card-title mb-3">Top 3 des lieux les plus visités</h5>
        <TopVisitedPlaces v-if="topPlaces" :places="topPlaces" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/axios';
import StatsCharts from "@/charts/StatsCharts.vue";
import TopVisitedPlaces from "@/charts/TopVisitedPlaces.vue";
import CategoriesPieChart from "@/charts/CategoriesPieChart.vue";

const cards = ref([
  { title: 'Utilisateurs', value: '—', icon: 'fas fa-users' },
  { title: 'Lieux', value: '—', icon: 'fas fa-map-marker-alt' },
  { title: 'Visites', value: '—', icon: 'fas fa-chart-line' }
]);

const cardsPlace = ref([
  { title: 'Lieux totaux', value: '—', icon: 'fas fa-map-marker-alt' },
  { title: 'Lieux visités', value: '—', icon: 'fas fa-check-circle' },
]);

const stats = ref(null);
const topPlaces = ref(null);
const categoriesData = ref(null);


const fetchStats = async () => {
  try {
    const res = await axios.get('/api/admin/places/stats', { withCredentials: true });
    const { usersCount, placesCount, visitsCount } = res.data;

    cards.value[0].value = usersCount;
    cards.value[1].value = placesCount;
    cards.value[2].value = visitsCount;
  } catch (err) {
    console.error("Erreur chargement stats :", err);
  }
};

const fetchStatsPlace = async () => {
  try {
    const res = await axios.get('/api/admin/places/stats/global', { withCredentials: true });
    stats.value = res.data;

    cardsPlace.value[0].value = stats.value.totalPlaces;
    cardsPlace.value[1].value = stats.value.totalVisited;

  } catch (err) {
    console.error("Erreur chargement stats :", err);
  }
};

const fetchTopPlaces = async () => {
  const res = await axios.get('/api/admin/places/stats/top', { withCredentials: true });
  topPlaces.value = res.data;
};

const fetchCategoriesData = async () => {
  try {
    const res = await axios.get('/api/admin/places/chart/categories', { withCredentials: true });
    categoriesData.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchStats();
  fetchStatsPlace();
  fetchTopPlaces();
  fetchCategoriesData();
});
</script>

<style scoped>
.dashboard-charts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.chart-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 28rem;
  padding: 1.25rem;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.75rem;
  background: #fff;
}

.chart-panel .card-title {
  margin-bottom: 1rem;
  color: #442a22;
  font-size: 1rem;
  text-align: center;
}

.chart-panel :deep(> div) {
  width: 100%;
  min-width: 0;
}

.chart-panel :deep(canvas) {
  width: 100% !important;
  max-width: 100%;
}

@media (max-width: 991px) {
  .dashboard-charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .dashboard-charts-card {
    margin-inline: -0.25rem;
  }

  .dashboard-charts {
    gap: 1rem;
    padding: 0.75rem;
  }

  .chart-panel {
    min-height: 25rem;
    padding: 1rem 0.6rem;
  }

  .chart-panel .card-title {
    padding-inline: 0.5rem;
    font-size: 1.05rem;
    line-height: 1.35;
  }
}

</style>
