<template>
  <div class="stats-container">
    <h1 class="section-title"><i class="fa-solid fa-chart-bar"></i> Statistiques</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <i class="fa-solid fa-map-location stat-icon"></i>
        <div>
          <h3>{{ stats.total_places }}</h3>
          <p>Lieux visités</p>
        </div>
      </div>

      <div class="stat-card">
        <i class="fa-solid fa-road stat-icon"></i>
        <div>
          <h3>{{ formattedDistance }} km</h3>
          <p>Distance parcourue</p>
        </div>
      </div>

      <div v-for="(count, type) in filteredCategories" :key="type" class="stat-card">
        <i :class="categoryIcons[type]" class="stat-icon"></i>
        <div>
          <h3>{{ count }} lieux</h3>
          <p>{{ categoryLabels[type] || type }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import axios from "@/axios.js";

const stats = ref({
  total_places: 0,
  total_km: 0,
  nature_count: 0,
  urban_count: 0,
  historical_count: 0,
  secret_count: 0,
  spooky_count: 0
});

const categoryIcons = {
  urban: 'fa-solid fa-city',
  nature: 'fa-solid fa-tree',
  historical: 'fa-solid fa-landmark',
  secret: 'fa-solid fa-user-secret',
  spooky: 'fa-solid fa-ghost'
};

const categoryLabels = {
  urban: 'Urbain',
  nature: 'Nature',
  historical: 'Historique',
  secret: 'Secret',
  spooky: 'Frisson'
};

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/stats', {withCredentials: true});

    if (response.data.success) {
      stats.value = response.data.stats;
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques :', err);
  }
};
const formattedDistance = computed(() =>
    stats.value.total_km ? stats.value.total_km.toFixed(2) : '0.00'
);

const filteredCategories = computed(() => {
  const result = {};
  for (const [key, count] of Object.entries(stats.value)) {
    if (key.endsWith('_count') && count >= 3) {
      const type = key.replace('_count', '');
      result[type] = count;
    }
  }
  return result;
});

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

onMounted(fetchStats);
</script>

<style scoped>
.stats-container {
  margin: 3rem auto;
  padding: 1.5rem;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.6rem;
  background: rgba(247, 243, 238, 0.82);
  box-shadow: 0 8px 30px rgba(68, 42, 34, 0.055);
  color: #1c1c19;
}

.section-title {
  font-size: 1.45rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #442a22;
}

.section-title i {
  color: #5d4037;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #fdf9f4;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.55rem;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 8px 22px rgba(68, 42, 34, 0.07);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(68, 42, 34, 0.11);
}

.stat-card h3 {
  color: #442a22;
  font-size: 1.35rem;
  margin-bottom: 0.15rem;
}

.stat-card p {
  color: #665852;
  margin: 0;
  font-weight: 700;
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #5d4037;
}

@media (max-width: 768px) {
  .stats-container {
    margin: 2rem auto;
    padding: 1rem;
  }
}
</style>
