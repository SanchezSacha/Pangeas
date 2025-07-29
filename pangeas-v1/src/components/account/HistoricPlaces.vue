<template>
  <div class="historic-container">
    <h2 class="section-title"><i class="fa-solid fa-clock-rotate-left"></i>Historique</h2>

    <div v-if="places.length === 0" class="no-visits">Aucun lieu visité pour l’instant.</div>

    <div class="places-grid">
      <div class="place-card" v-for="place in places" :key="place._id">
        <img :src="place.image_url" alt="Image du lieu" class="place-img" />
        <div class="place-info">
          <h3>{{ place.name }}</h3>
          <p class="date">Validé le {{ formatDate(place.validated_at) }}</p>
          <p class="badge">{{ place.category }}</p>
        </div>
      </div>
    </div>

    <div v-if="!allLoaded" class="load-more">
      <button @click="fetchVisitedPlaces" :disabled="loading">
        {{ loading ? 'Chargement...' : 'Voir plus' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const places = ref([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(false);
const allLoaded = ref(false);

const fetchVisitedPlaces = async () => {
  if (loading.value || allLoaded.value) return;

  loading.value = true;
  try {
    const res = await fetch(`/api/visit/visited?page=${page.value}`, {
      credentials: 'include'
    });
    const data = await res.json();

    if (data.success) {
      places.value = [...places.value, ...data.places];
      totalPages.value = Math.ceil(data.total / 10);

      if (page.value >= totalPages.value) {
        allLoaded.value = true;
      } else {
        page.value++;
      }
    }
  } catch (err) {
    console.error("Erreur lors du chargement de l'historique :", err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

onMounted(fetchVisitedPlaces);
</script>


<style scoped>
.historic-container {
  margin: 3rem auto;
  padding: 2rem;
  background-color: var(--color-beige);
  border-radius: 1rem;
  color: var(--color-white);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.8rem;
  color: var(--color-brown);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.no-visits {
  text-align: center;
  color: var(--color-brown);
  font-style: italic;
}

.places-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(5, 1fr);
}

.place-card {
  background: var(--color-brown);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.place-card:hover {
  transform: scale(1.03);
}

.place-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.place-info {
  padding: 1rem;
}

.date {
  font-size: 0.85rem;
  color: #ccc;
}

.badge {
  background-color: var(--color-beige);
  color: var(--color-brown);
  font-size: 0.8rem;
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  margin-top: 0.5rem;
}
.load-more {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}
.load-more button {
  background-color: var(--color-brown);
  color: var(--color-white);
  border: none;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.3s ease;
}
.load-more button:hover {
  transform: scale(1.05);
}
.load-more button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .places-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

</style>
