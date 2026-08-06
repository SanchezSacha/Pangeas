<template>
  <div class="stats-container">
    <div class="section-heading">
      <span><i class="fa-solid fa-chart-bar"></i></span>
      <div>
        <p>Votre activité</p>
        <h2>Statistiques</h2>
      </div>
    </div>

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
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid rgba(205, 184, 176, 0.85);
  border-radius: 0.9rem;
  background: rgba(247, 243, 238, 0.88);
  box-shadow: var(--shadow-pangeas-card);
  color: #1c1c19;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
}

.section-heading > span {
  display: grid;
  place-items: center;
  width: 2.65rem;
  height: 2.65rem;
  border-radius: 0.75rem;
  background: #e9d6ca;
}

.section-heading i {
  color: #5d4037;
}

.section-heading p {
  color: #8a6d62;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.section-heading h2 {
  color: #442a22;
  font-size: 1.35rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
  min-width: 0;
  gap: 1rem;
}

.stat-card {
  min-width: 0;
  background: var(--color-pangeas-card-tint);
  border: 1px solid var(--color-pangeas-card-border);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 8px 22px rgba(68, 42, 34, 0.07);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: default;
}

.stat-card:nth-child(1) {
  border-color: #b8d2c4;
  background: linear-gradient(145deg, #dfeee6, #f2eee8);
}

.stat-card:nth-child(2) {
  border-color: #d8c29c;
  background: linear-gradient(145deg, #f1e3c7, #f4ece4);
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
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .stat-card {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.65rem;
    padding: 0.85rem 0.7rem;
    text-align: left;
  }

  .stat-icon {
    margin: 0;
    font-size: 1.2rem;
  }

  .stat-card h3 {
    font-size: 1.05rem;
  }

  .stat-card p {
    font-size: 0.7rem;
    line-height: 1.2;
  }
}
</style>
