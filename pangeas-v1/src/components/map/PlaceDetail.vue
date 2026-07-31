<template>
  <main class="place-detail-page">
    <header class="place-topbar">
      <button class="icon-button" type="button" aria-label="Retour" @click="goBack">
        <img src="/icons/arrow-left.svg" alt="" aria-hidden="true" />
      </button>

      <div class="topbar-copy">
        <img src="/logo_mobile_pangeas.png" alt="Pangeas" class="brand-logo mobile-logo" />
        <img src="/logo_marron_2.png" alt="Pangeas" class="brand-logo desktop-logo" />
        <strong>{{ compactTitle }}</strong>
      </div>

      <button
          class="icon-button favorite-button"
          type="button"
          :class="{ active: isFavorite }"
          :disabled="!isLoggedIn || !place._id"
          :aria-label="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          @click="toggleFavorite"
      >
        <i :class="favoriteIconClass" aria-hidden="true"></i>
      </button>
    </header>

    <div class="place-overview">
      <section class="hero-section" aria-labelledby="place-title">
        <img v-if="place.image_url" :src="place.image_url" :alt="place.name" class="hero-image" />
        <div v-else class="hero-placeholder">
          <img src="/logo_mobile_pangeas.png" alt="" aria-hidden="true" />
        </div>

        <span v-if="place.category" class="category-pill">
          <i :class="categoryIcon" aria-hidden="true"></i>
          {{ place.category }}
        </span>
      </section>

      <section class="place-summary">
      <section class="place-intro">
        <p class="eyebrow">Détails du lieu</p>
        <h1 id="place-title">{{ place.name }}</h1>

        <div class="meta-list">
          <span v-if="place.department">
            <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
            {{ place.department }}
          </span>
          <span v-if="place.distance_km">
            <i class="fa-solid fa-route" aria-hidden="true"></i>
            {{ place.distance_km }} km
          </span>
        </div>
      </section>

      <button class="reward-card" type="button" :disabled="!isLoggedIn">
        <span class="reward-icon">
          <i class="fa-solid fa-compass" aria-hidden="true"></i>
        </span>
        <span>
          <strong>Récompense de voyage</strong>
          <small>Cette visite vous rapporte {{ rewardPoints }} points</small>
        </span>
        <img src="/icons/chevron-right.svg" alt="" aria-hidden="true" />
      </button>

      <p v-if="!isLoggedIn" class="auth-callout">
        Connectez-vous pour lancer une visite, enregistrer ce lieu et gagner des points.
      </p>
      </section>
    </div>

    <div class="place-content">
      <div class="detail-grid">
        <section class="content-card story-card">
          <h2>
            <i class="fa-regular fa-map" aria-hidden="true"></i>
            L'âme du lieu
          </h2>
          <div class="rich-text" v-html="place.description || 'Aucune description disponible pour ce lieu.'"></div>
        </section>

        <section v-if="place.legend" class="legend-card">
          <h2>La Légende</h2>
          <div class="rich-text" v-html="place.legend"></div>
          <i class="fa-solid fa-star legend-mark" aria-hidden="true"></i>
        </section>

        <section v-if="parsedAnecdotes.length" class="content-card facts-card">
          <h2>Le saviez-vous ?</h2>
          <ul>
            <li v-for="(fact, index) in parsedAnecdotes" :key="index">
              <i :class="factIcons[index % factIcons.length]" aria-hidden="true"></i>
              <span>{{ fact }}</span>
            </li>
          </ul>
        </section>

        <section v-if="normalizedActivities.length" class="content-card activities-card">
          <h2>Activités incontournables</h2>
          <ul>
            <li v-for="(activity, index) in normalizedActivities" :key="index">
              <i :class="activityIcons[index % activityIcons.length]" aria-hidden="true"></i>
              <span>{{ activity }}</span>
            </li>
          </ul>
        </section>
      </div>

      <div class="action-buttons" aria-label="Actions du lieu">
        <button
            class="visit-button"
            type="button"
            :disabled="!isLoggedIn || !place._id"
            :class="{ disabled: !isLoggedIn || !place._id }"
            @click="handleVisitFromDetail"
        >
          <i class="fa-regular fa-compass" aria-hidden="true"></i>
          Visiter
        </button>
        <button class="back-button" type="button" @click="goBack">Retour</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from '@/axios';
import {
  loadCachedPlace,
  rememberFavoriteSnapshot,
  rememberPlace,
  setFavoriteOfflineAware
} from '@/services/offlineService';

const route = useRoute();
const router = useRouter();
const store = useStore();
const place = ref({});
const parsedAnecdotes = ref([]);

const factIcons = ['fa-regular fa-newspaper', 'fa-solid fa-landmark', 'fa-solid fa-water'];
const activityIcons = ['fa-solid fa-person-hiking', 'fa-solid fa-camera-retro', 'fa-solid fa-utensils', 'fa-regular fa-calendar'];

const categoryIcons = {
  historique: 'fa-solid fa-landmark',
  historical: 'fa-solid fa-landmark',
  nature: 'fa-solid fa-tree',
  urbain: 'fa-solid fa-city',
  urban: 'fa-solid fa-city',
  secret: 'fa-solid fa-user-secret',
  frisson: 'fa-solid fa-ghost',
  spooky: 'fa-solid fa-ghost'
};

const isLoggedIn = computed(() => store.getters.isLoggedIn);
const isFavorite = computed(() => place.value?._id ? store.getters.isFavorite(place.value._id) : false);
const favoriteIconClass = computed(() => (
  isFavorite.value ? 'fa-solid fa-heart favorite-icon' : 'fa-regular fa-heart favorite-icon'
));

const compactTitle = computed(() => {
  const title = place.value?.name || 'Lieu';
  return title.length > 24 ? `${title.slice(0, 21)}...` : title;
});

const categoryIcon = computed(() => {
  const category = String(place.value?.category || '').toLowerCase();
  return categoryIcons[category] || 'fa-solid fa-location-dot';
});

const rewardPoints = computed(() => (
  place.value?.reward_points ||
  place.value?.rewardPoints ||
  place.value?.points ||
  50
));

const normalizedActivities = computed(() => {
  const activities = place.value?.activities;
  if (Array.isArray(activities)) return activities.filter(Boolean);
  if (typeof activities === 'string') {
    return activities.split(',').map(activity => activity.trim()).filter(Boolean);
  }
  return [];
});

const applyPlace = placeData => {
  place.value = placeData;
  parsedAnecdotes.value = Array.isArray(placeData.anecdote)
      ? placeData.anecdote.filter(Boolean)
      : placeData.anecdote?.split('\n').map(fact => fact.trim()).filter(Boolean) ?? [];
};

const fetchPlace = async () => {
  try {
    const res = await axios.get(`/api/places/${route.params.id}`, { withCredentials: true });
    const data = res.data;

    if (data.success && data.place) {
      applyPlace(data.place);
      await rememberPlace(data.place);
    }
  } catch (error) {
    const cachedPlace = await loadCachedPlace(route.params.id);
    if (cachedPlace) {
      applyPlace(cachedPlace);
      store.commit('setUsingOfflineData', true);
      return;
    }
    console.error('Erreur lors de la récupération du lieu:', error.response?.data || error.message);
  }
};

const fetchFavorites = async () => {
  if (!isLoggedIn.value) return;
  if (!store.state.isOnline) return;

  try {
    const response = await axios.get('/api/favorites', { withCredentials: true });
    if (response.data.success) {
      const favoriteIds = response.data.favorites.map(favorite => favorite._id);
      store.commit('setFavorites', favoriteIds);
      await rememberFavoriteSnapshot(response.data.favorites);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error.response?.data || error.message);
  }
};

const toggleFavorite = async () => {
  if (!isLoggedIn.value || !place.value?._id) return;

  try {
    await setFavoriteOfflineAware(place.value._id, !isFavorite.value);
  } catch (err) {
    console.error('Erreur lors du toggle favori :', err.response?.data || err.message);
  }
};

const handleVisitFromDetail = () => {
  if (!isLoggedIn.value || !place.value?._id) return;
  store.commit('setVisitPlaceFromDetail', place.value);
  router.push({ name: 'Home' });
};

const goBack = () => {
  router.back();
};

onMounted(async () => {
  await Promise.all([fetchPlace(), fetchFavorites()]);
});
</script>

<style scoped>
.place-detail-page {
  min-height: 100vh;
  padding-bottom: calc(6rem + env(safe-area-inset-bottom));
  background: var(--color-pangeas-bg);
  color: var(--color-auth-text);
}

.place-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
  align-items: center;
  min-height: 4.35rem;
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid rgba(212, 195, 190, 0.36);
  background: rgba(253, 249, 244, 0.94);
  backdrop-filter: blur(12px);
}

.favorite-button {
  justify-self: end;
}

.topbar-copy {
  display: grid;
  justify-items: center;
  min-width: 0;
  color: var(--color-pangeas-primary);
  line-height: 1.1;
}

.topbar-copy strong {
  max-width: 100%;
  overflow: hidden;
  font-family: var(--font-title);
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-section {
  position: relative;
  min-height: 24rem;
  background: var(--color-pangeas-surface-strong);
}

.hero-section::after {
  content: "";
  position: absolute;
  inset: 35% 0 0;
  background: linear-gradient(180deg, rgba(253, 249, 244, 0), var(--color-pangeas-bg));
  pointer-events: none;
}

.hero-image,
.hero-placeholder {
  width: 100%;
  height: 24rem;
}

.hero-image {
  object-fit: cover;
}

.hero-placeholder {
  display: grid;
  place-items: center;
  background: var(--color-pangeas-primary-soft);
}

.hero-placeholder img {
  width: 6rem;
  opacity: 0.72;
  filter: brightness(0) invert(1);
}

.category-pill {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  z-index: 2;
}

.place-summary,
.place-content {
  width: min(100%, 68rem);
  margin: 0 auto;
}

.place-summary {
  padding: 1.65rem 1rem 0;
}

.place-content {
  padding: 0 1rem;
}

.place-intro {
  display: grid;
  gap: 0.45rem;
}

.place-intro h1 {
  color: var(--color-pangeas-primary);
  font-size: clamp(2rem, 10vw, 3.4rem);
  line-height: 1.05;
}

.reward-card {
  margin: 1.5rem 0 1.65rem;
}

.auth-callout {
  margin: -0.75rem 0 1.65rem;
}

.detail-grid {
  display: grid;
  gap: 1rem;
}

.action-buttons {
  position: sticky;
  bottom: calc(4.6rem + env(safe-area-inset-bottom));
  z-index: 15;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-top: 1.6rem;
  padding: 0.75rem 0 0;
  background: linear-gradient(180deg, rgba(253, 249, 244, 0), var(--color-pangeas-bg) 32%);
}

@media (min-width: 768px) {
  .place-detail-page {
    padding-bottom: 3rem;
  }

  .place-topbar {
    min-height: 4.75rem;
    padding: 0.65rem 2rem;
  }

  .place-overview {
    display: grid;
    grid-template-columns: minmax(0, 1.38fr) minmax(20rem, 0.62fr);
    align-items: stretch;
    gap: 1.5rem;
    width: min(100% - 4rem, 76rem);
    margin: 1.5rem auto 0;
  }

  .hero-section {
    width: 100%;
    min-height: 28rem;
    margin: 0;
    overflow: hidden;
    border-radius: 0.75rem;
    box-shadow: 0 16px 38px rgba(68, 42, 34, 0.12);
  }

  .hero-image,
  .hero-placeholder {
    height: 28rem;
  }

  .place-summary {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: auto;
    min-width: 0;
    padding: 1.5rem;
    border: 1px solid rgba(212, 195, 190, 0.58);
    border-radius: 0.75rem;
    background: rgba(247, 243, 238, 0.78);
    box-shadow: var(--shadow-pangeas-card);
  }

  .place-content {
    width: min(100% - 4rem, 76rem);
    padding: 2rem 0 0;
  }

  .place-intro h1 {
    max-width: 100%;
    font-size: clamp(2.35rem, 4vw, 4.35rem);
  }

  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 1.25rem;
  }

  .story-card,
  .legend-card {
    grid-row: auto;
  }

  .action-buttons {
    position: static;
    width: min(100%, 34rem);
    margin-inline: auto;
    background: transparent;
  }
}

@media (min-width: 1120px) {
  .place-overview {
    grid-template-columns: minmax(0, 1.55fr) minmax(22rem, 0.45fr);
    gap: 1.75rem;
  }

  .hero-section {
    min-height: 31rem;
  }

  .hero-image,
  .hero-placeholder {
    height: 31rem;
  }

  .place-summary {
    position: sticky;
    top: 6rem;
    align-self: start;
    min-height: 31rem;
  }

  .detail-grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 1.35rem;
  }

  .action-buttons {
    width: min(100%, 34rem);
  }
}
</style>
