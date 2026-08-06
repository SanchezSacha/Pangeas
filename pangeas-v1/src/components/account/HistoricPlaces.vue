<template>
  <div class="historic-container">
    <div class="section-heading">
      <span><i class="fa-solid fa-clock-rotate-left"></i></span>
      <div>
        <p>Votre carnet</p>
        <h2>Historique des lieux</h2>
      </div>
    </div>

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
import axios from "@/axios.js";

const places = ref([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(false);
const allLoaded = ref(false);

const fetchVisitedPlaces = async () => {
  if (loading.value || allLoaded.value) return;

  loading.value = true;
  try {
    const response = await axios.get(`/api/visit/visited?page=${page.value}`, {withCredentials: true});

    const data = response.data;

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
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 1.25rem;
  border: 1px solid rgba(205, 184, 176, 0.85);
  border-radius: 0.9rem;
  background: rgba(247, 243, 238, 0.88);
  color: #1c1c19;
  box-shadow: var(--shadow-pangeas-card);
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
  background: #e2e9df;
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

.no-visits {
  text-align: center;
  color: #665852;
  font-style: italic;
  padding: 1.25rem;
  border: 1px dashed rgba(130, 116, 112, 0.45);
  border-radius: 0.55rem;
  background: #fdf9f4;
}

.places-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  min-width: 0;
}

.place-card {
  min-width: 0;
  background: var(--color-pangeas-card-tint);
  border: 1px solid var(--color-pangeas-card-border);
  border-radius: 0.55rem;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(68, 42, 34, 0.09);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.place-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(68, 42, 34, 0.11);
}

.place-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.place-info {
  padding: 1rem;
}

.place-info h3 {
  color: #442a22;
  font-size: 1rem;
  margin-bottom: 0.35rem;
}

.date {
  font-size: 0.85rem;
  color: #665852;
}

.badge {
  background: #eee1c9;
  color: #665852;
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
  background: #442a22;
  color: #fff;
  border: 2px solid #442a22;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.load-more button:hover {
  transform: translateY(-1px);
}
.load-more button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .historic-container {
    padding: 1rem;
  }

  .places-grid {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .place-card {
    display: grid;
    grid-template-columns: 6.25rem minmax(0, 1fr);
    align-items: stretch;
  }

  .place-img {
    height: 100%;
    min-height: 6.5rem;
  }

  .place-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    min-width: 0;
    padding: 0.8rem;
  }

  .place-info h3 {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-size: 0.92rem;
  }

  .date {
    font-size: 0.73rem;
  }

  .badge {
    font-size: 0.68rem;
  }
}

</style>
