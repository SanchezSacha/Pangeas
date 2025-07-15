<template>
  <div class="popup-card">
    <button class="popup-fav" @click="toggleFavorite" :disabled="!isLoggedIn" :class="{ 'fav-disabled': !isLoggedIn }">
      <i class="fa-regular fa-heart popup-icon"></i>
    </button>
    <h5 class="mt-2">{{ place.name }}</h5>
    <p class="mb-1 text-muted">{{ place.department }} • {{ place.distance_km }} km</p>
    <img :src="place.image_url" :alt="place.name" class="popup-img" />
    <div class="d-flex justify-content-center gap-4 mt-2">
      <button
          class="btn btn-sm"
          :class="{ 'btn-disabled': !isLoggedIn }"
          :disabled="!isLoggedIn"
          @click="handleVisit"
      >
        Visiter
      </button>
      <button class="btn btn-sm">Détail</button>
    </div>
    <p v-if="!isLoggedIn" class="text-danger mt-2 text-center" style="font-weight: bold">
      Connectez-vous pour débloquer toutes les fonctionnalités.
    </p>
    <p v-if="geoError" class="text-danger mt-2 text-center" style="font-weight: bold">
      La géolocalisation est requise pour valider la visite.
    </p>
  </div>
</template>

<script>
import {computed, ref} from 'vue';
import { useStore } from 'vuex';

export default {
  props: {
    place: Object,
    map: Object
  },
  setup(props) {
    const store = useStore();
    const isLoggedIn = computed(() => store.getters.isLoggedIn);
    const geoError = ref(false);
    const toggleFavorite = () => console.log("Ajouter aux favoris (à faire)");

    const handleVisit = () => {
      if (!isLoggedIn.value) return;

      if (!navigator.geolocation) {
        geoError.value = true;
        return;
      }
      navigator.geolocation.getCurrentPosition(
          (position) => {
            geoError.value = false;
            const { latitude, longitude } = position.coords;
            console.log("Position actuelle :", latitude, longitude);

            store.commit('setUserPosition', { lat: latitude, lng: longitude });

            props.map.setView([latitude, longitude], 14);

            props.map.fire('start-route', {
              from: { lat: latitude, lng: longitude },
              to: props.place.coordinates,
              placeId: props.place._id
            });
          },
          (error) => {
            geoError.value = true;
            console.warn("Erreur de géolocalisation :", error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
      );
    };
    return { isLoggedIn, toggleFavorite, handleVisit, geoError };
  },
};
</script>

<style scoped>
.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}
.popup-img {
  width: 100%;
  border-radius: 10px;
  margin-top: 0.5rem;
}

.fav-disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
</style>
