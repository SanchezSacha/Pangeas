<template>
  <section class="favorites-section" style="margin-top: 3rem; background-color: var(--color-brown); border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
    <h1 class="favorites-title" style="color: var(--color-beige)">Mes Favoris <i class="fa-solid fa-chevron-right"></i></h1>

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

const store = useStore();
const allFavoritePlaces = ref([]);
const carouselRef = ref(null);
const isCarousel = computed(() => visibleFavorites.value.length >= 6);
const isDesktop = computed(() => window.innerWidth >= 768);

const visibleFavorites = computed(() =>
    allFavoritePlaces.value.filter(place =>
        store.state.favorites.includes(place._id)
    )
);
const fetchFavorites = async () => {
  try {
    const res = await fetch('/api/favorites', { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      allFavoritePlaces.value = data.favorites;
      const favoriteIds = data.favorites.map(place => place._id);
      store.commit('setFavorites', favoriteIds);
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
.favorites-title {
  margin: 2rem 0 1rem 4rem;
  padding-top: 2rem;
  font-size: 2rem;
}

.favorites-wrapper {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 3rem 0;
}

.carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.carousel-container {
  overflow-x: hidden;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  flex: 1;
}

.carousel {
  display: flex;
  gap: 1rem;
  scroll-snap-type: x mandatory;
  scroll-padding: 1rem;
  scroll-behavior: smooth;
  transition: transform 0.3s ease-in-out;
}

.carousel > * {
  scroll-snap-align: center;
  flex: 0 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  background-color: var(--color-beige);
  padding: 1rem;
  transition: transform 0.2s ease;
}
.carousel > *:hover {
  transform: scale(1.02);
}

.arrow {
  background-color: var(--color-beige);
  color: var(--color-brown);
  border: none;
  font-size: 1rem;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.arrow:hover {
  background-color: rgba(90, 62, 54, 1);
  color: rgba(255, 255, 255);
  transform: scale(1.2);
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
  color: white;
  font-style: italic;
  margin: 2rem;
}

@media (max-width: 768px) {
  .arrow {
    display: none;
  }
  .carousel-container{
    overflow-x: auto;
  }
  .favorites-title {
    margin: 0 0 1rem 0;
    text-align: center;
    font-size: 2rem;
  }
  .favorites-section{
    margin-top: 0;
  }
}

</style>
