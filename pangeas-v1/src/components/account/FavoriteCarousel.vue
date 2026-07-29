<template>
  <section class="favorites-section">
    <h1 class="favorites-title"><i class="fa-solid fa-heart"></i> Mes Favoris</h1>

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
    const response = await axios.get('/api/favorites', {withCredentials: true});
    const data = response.data;
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
  margin: 0 0 1.25rem;
  color: #442a22;
  font-size: 1.45rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.favorites-title i {
  color: #5d4037;
}

.favorites-section {
  margin: 2.75rem auto 0;
  padding: 1.5rem;
  border: 1px solid rgba(212, 195, 190, 0.58);
  border-radius: 0.6rem;
  background: rgba(247, 243, 238, 0.82);
  box-shadow: 0 8px 30px rgba(68, 42, 34, 0.055);
}

.favorites-wrapper {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.5rem 0 0;
}

.carousel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.carousel-container {
  overflow-x: hidden;
  padding: 0.35rem;
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
  .favorites-title {
    margin: 0 0 1rem 0;
    font-size: 1.28rem;
  }
  .favorites-section{
    margin-top: 0;
    padding: 1rem;
  }
}

</style>
