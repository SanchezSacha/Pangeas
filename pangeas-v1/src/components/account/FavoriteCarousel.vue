<template>
  <section class="favorites-section">
    <div class="favorites-heading">
      <span><i class="fa-solid fa-heart"></i></span>
      <div>
        <p>À retrouver facilement</p>
        <h2>Mes favoris</h2>
      </div>
    </div>

    <p v-if="visibleFavorites.length === 0" class="no-favorites-message">
      Vous n'avez aucun lieu en favori...
    </p>

    <div v-else-if="!isCarousel" class="favorites-wrapper">
      <PlaceModal v-for="place in visibleFavorites" :key="place._id" :place="place" source="favorites"/>
    </div>

    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="arrow left" @click="scrollLeft" v-show="isDesktop">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="carousel-container" ref="carouselRef">
          <div class="carousel" tabindex="0">
            <PlaceModal v-for="place in visibleFavorites" :key="place._id" :place="place" source="favorites"/>
          </div>
        </div>
        <button class="arrow right" @click="scrollRight" v-show="isDesktop">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import PlaceModal from '../map/PlaceModal.vue';
import axios from "@/axios.js";
import {
  loadCachedPlaces,
  rememberFavoriteSnapshot
} from '@/services/offlineService';

const store = useStore();
const allFavoritePlaces = ref([]);
const carouselRef = ref(null);
const isCarousel = computed(() => visibleFavorites.value.length >= 6);
const isDesktop = computed(() => window.innerWidth >= 768);

const visibleFavorites = computed(() =>
    allFavoritePlaces.value.filter(place =>
        store.state.favorites.includes(String(place._id))
    )
);
const fetchFavorites = async () => {
  const cachedPlaces = await loadCachedPlaces();
  allFavoritePlaces.value = cachedPlaces.filter(place =>
      store.state.favorites.includes(String(place._id))
  );

  if (!store.state.isOnline) return;

  try {
    const response = await axios.get('/api/favorites', {withCredentials: true});
    const data = response.data;
    if (data.success) {
      allFavoritePlaces.value = data.favorites;
      const favoriteIds = data.favorites.map(place => place._id);
      store.commit('setFavorites', favoriteIds);
      await rememberFavoriteSnapshot(data.favorites);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
  }
};
const scrollLeft = () => {
  if (carouselRef.value) {
    carouselRef.value.scrollBy({ left: -300, behavior: 'smooth' });
  }
};
const scrollRight = () => {
  if (carouselRef.value) {
    carouselRef.value.scrollBy({ left: 300, behavior: 'smooth' });
  }
};

onMounted(fetchFavorites);
</script>


<style scoped>
.favorites-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
}

.favorites-heading > span {
  display: grid;
  place-items: center;
  width: 2.65rem;
  height: 2.65rem;
  border-radius: 0.75rem;
  background: #ead7d5;
}

.favorites-heading i {
  color: #5d4037;
}

.favorites-heading p {
  color: #8a6d62;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.favorites-heading h2 {
  color: #442a22;
  font-size: 1.35rem;
}

.favorites-section {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 1.25rem;
  border: 1px solid rgba(205, 184, 176, 0.85);
  border-radius: 0.9rem;
  background: rgba(247, 243, 238, 0.88);
  box-shadow: var(--shadow-pangeas-card);
}

.favorites-wrapper {
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.5rem 0 0;
  min-width: 0;
}

.carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
}

.carousel-container {
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  padding: 0.35rem;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  flex: 1;
}

.carousel {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  scroll-snap-type: x mandatory;
  scroll-padding: 1rem;
  scroll-behavior: smooth;
  transition: transform 0.3s ease-in-out;
  min-width: 0;
}

.carousel > * {
  scroll-snap-align: center;
  flex: 0 0 auto;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.55rem;
  background: #fdf9f4;
  box-shadow: 0 8px 22px rgba(68, 42, 34, 0.07);
  padding: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.carousel > *:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(68, 42, 34, 0.11);
}

.arrow {
  background: #fdf9f4;
  color: #5d4037;
  border: 1px solid rgba(212, 195, 190, 0.9);
  font-size: 1rem;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
  box-shadow: 0 8px 18px rgba(68, 42, 34, 0.12);
}

.arrow:hover {
  background: #5d4037;
  color: #fdf9f4;
  transform: translateY(-50%) scale(1.04);
}

.arrow.left {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.arrow.right {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.no-favorites-message {
  text-align: center;
  color: #665852;
  font-style: italic;
  margin: 1.25rem 0 0;
  padding: 1.25rem;
  border: 1px dashed rgba(130, 116, 112, 0.45);
  border-radius: 0.55rem;
  background: #fdf9f4;
}

@media (max-width: 768px) {
  .arrow {
    display: none;
  }
  .carousel-container{
    overflow-x: auto;
  }
  .favorites-section{
    padding: 1rem;
  }

  .favorites-wrapper {
    justify-content: flex-start;
    flex-wrap: nowrap;
    overflow-x: auto;
    margin-inline: -1rem;
    padding: 0.25rem 1rem 0.8rem;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .favorites-wrapper::-webkit-scrollbar {
    display: none;
  }

  .favorites-wrapper > *,
  .carousel > * {
    flex: 0 0 15.5rem;
    scroll-snap-align: start;
  }

  .carousel-container {
    margin-inline: -0.35rem;
  }
}

.favorites-wrapper > :deep(.popup-card),
.carousel > :deep(.popup-card) {
  display: flex;
  flex-direction: column;
  height: auto;
}

.favorites-wrapper > :deep(.popup-card h5),
.carousel > :deep(.popup-card h5) {
  display: -webkit-box;
  min-height: 2.6rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.favorites-wrapper > :deep(.popup-card .popup-meta-row),
.carousel > :deep(.popup-card .popup-meta-row) {
  align-content: flex-start;
  height: 3.25rem;
  min-height: 3.25rem;
  overflow: hidden;
}

.favorites-wrapper > :deep(.popup-card .place-actions),
.carousel > :deep(.popup-card .place-actions) {
  margin-top: auto;
}

</style>
