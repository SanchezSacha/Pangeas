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
    const res = await fetch('/api/stats', { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      stats.value = data.stats;
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
  padding: 2rem;
  background-color: var(--color-beige);
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  color: var(--color-white);
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-brown);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  background-color: var(--color-brown);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}

.stat-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-white);
}
</style>
