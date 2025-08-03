<template>
  <div class="content" style="background-color: var(--color-beige)">
    <div class="place-detail-container">

      <h1 class="place-title">{{ place.name }}</h1>
      <p class="place-meta">Type : <strong>{{ place.category }}</strong> • {{ place.department }} • {{ place.distance_km }} km</p>

      <div class="image-and-legend">
        <img :src="place.image_url" :alt="place.name" class="place-main-img" />
        <div class="text-content">
          <section class="section-block">
            <h2 class="section-title description">Description</h2>
            <p v-html="place.description"></p>
          </section>

          <section class="section-block legend">
            <h2 class="section-title">✨ Légende ✨</h2>
            <div class="legend-box">
              <p v-html="place.legend"></p>
            </div>
          </section>
        </div>
      </div>

      <div class="desktop-grid">
        <section class="section-block anecdotes">
          <h2 class="section-title">Anecdotes</h2>
          <ul>
            <li v-for="(fact, index) in parsedAnecdotes" :key="index">
              {{ fact }}
            </li>
          </ul>
        </section>

        <section class="section-block activity-box">
          <h2 class="section-title activity-title">Activités</h2>
          <ul class="activity-list">
            <li v-for="(activity, index) in place.activities" :key="index">
              {{ activity }}
            </li>
          </ul>
        </section>
      </div>

      <p v-if="!isLoggedIn" class="text-danger mt-2 text-center" style="font-weight: bold">
        Connectez-vous pour débloquer toutes les fonctionnalités.
      </p>
      <div class="action-buttons">
        <button class="visit btn" :disabled="!isLoggedIn" :class="{ disabled: !isLoggedIn }" @click="handleVisitFromDetail">Visiter</button>
        <button class="back btn" @click="goBack">Retour</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {useStore} from "vuex";
import axios from "@/axios";

const route = useRoute();
const router = useRouter();
const store = useStore();
const place = ref({});
const parsedAnecdotes = ref([]);

const isLoggedIn = computed(() => store.getters.isLoggedIn);


const fetchPlace = async () => {
  try {
    const res = await axios.get(`/api/places/${route.params.id}`, { withCredentials: true });
    const data = res.data;

    if (data.success && data.place) {
      place.value = data.place;
      parsedAnecdotes.value = Array.isArray(data.place.anecdote)
          ? data.place.anecdote
          : data.place.anecdote?.split('\n') ?? [];
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du lieu:", error.response?.data || error.message);
  }
};


const handleVisitFromDetail = () => {
  if (!isLoggedIn.value) return;
  store.commit('setVisitPlaceFromDetail', place.value);
  router.push({ name: 'Home' });
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchPlace();
});
</script>

<style scoped>
.place-detail-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 1rem;
  color: var(--color-brown);
}

.place-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.place-meta {
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.place-main-img {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
}

.section-block {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--color-green);
}

.legend-box {
  background-color: #fdfcf5;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  padding: 1rem;
  font-style: italic;
}

ul {
  padding-left: 1.2rem;
  list-style: disc;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 2rem;
}

.btn {
  background-color: var(--color-brown);
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
.activity-box {
  background-color: #fdfcf5;
  border: 1px solid #b08b62;
  border-radius: 0.8rem;
  padding: 1.5rem;
  color: var(--color-brown);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.activity-title {
  color: var(--color-green);
  font-weight: bold;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.activity-list {
  list-style: disc;
  padding-left: 1.2rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .place-detail-container {
    max-width: 1300px;
    padding: 3rem 4rem;
  }
  .place-title {
    font-size: 4rem;
    text-align: center;
  }
  .place-meta {
    font-size: 1.5rem;
    text-align: center;
    padding-bottom: 2rem;
  }
  .image-and-legend {
    display: grid;
    grid-template-columns: 55% 45%;
    gap: 2rem;
    align-items: start;
    margin-bottom: 2rem;
  }
  .text-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .place-main-img {
    width: 100%;
    margin: 0;
  }
  .legend {
   margin: 0;
  }
  .legend-box {
    margin-top: 0;
  }
  .section-title {
    font-size: 1.5rem;
  }
  .action-buttons {
    justify-content: center;
    gap: 4rem;
  }
  .btn {
    font-size: 1rem;
    padding: 0.9rem 2rem;
  }
  .desktop-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: center;
    max-width: 1300px;
    margin: 0 auto;
    padding-top: 1rem;
  }
}

</style>

