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
  margin: 3rem auto;
  padding: 1.5rem;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.6rem;
  background: rgba(247, 243, 238, 0.82);
  color: #1c1c19;
  box-shadow: 0 8px 30px rgba(68, 42, 34, 0.055);
}

.section-title {
  font-size: 1.45rem;
  color: #442a22;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.section-title i {
  color: #5d4037;
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
  grid-template-columns: repeat(5, 1fr);
}

.place-card {
  background: #fdf9f4;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.55rem;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(68, 42, 34, 0.07);
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
    margin: 2rem auto;
    padding: 1rem;
  }

  .places-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

</style>
