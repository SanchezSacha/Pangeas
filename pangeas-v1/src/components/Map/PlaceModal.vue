<template>
  <div class="popup-card">
    <button class="popup-fav" @click="toggleFavorite" :disabled="!isLoggedIn" :class="{ 'fav-disabled': !isLoggedIn }">
      <i :class="favoriteIconClass + ' popup-icon'"></i>
    </button>

    <h5 class="mt-2">{{ place.name }}</h5>
    <p class="mb-1 text-muted">{{ place.department }} • {{ place.distance_km }} km</p>
    <img :src="place.image_url" loading="lazy" :alt="place.name" class="popup-img" />
    <div class="place-actions">
      <button class="action-button" v-if="source !== 'favorites'" :class="{ 'disabled': !isLoggedIn || hasAnotherVisit }" :disabled="!isLoggedIn || hasAnotherVisit" @click="isCurrentPlace ? consultRoute() : handleVisit()">
        {{ isCurrentPlace ? 'Consulter l’itinéraire' : 'Visiter' }}
      </button>
      <button v-if="isCurrentPlace" class="action-button danger" @click="cancelVisit">Annuler</button>
      <button class="action-button">Détail</button>
    </div>

    <p v-if="!isLoggedIn" class="text-danger mt-2 text-center" style="font-weight: bold">
      Connectez-vous pour débloquer toutes les fonctionnalités.
    </p>
    <p v-if="geoError" class="text-danger mt-2 text-center" style="font-weight: bold">
      La géolocalisation est requise pour valider la visite.
    </p>
    <SuccessPopup v-if="showSuccess" :message="successMessage"/>
    <ErrorPopup v-if="showError" :message="errorMessage" @closed="showError = false"/>
  </div>
</template>

<script>
import {computed, ref} from 'vue';
import { useStore } from 'vuex';
import axios from "axios";
import SuccessPopup from "../Modal/SuccessPopup.vue";
import ErrorPopup from "../Modal/ErrorPopup.vue";

export default {
  components: {ErrorPopup, SuccessPopup},
  props: {
    place: Object,
    map: Object,
    source: {
      type: String,
      default: 'map'
    }
  },
  data (){
    return {
      showSuccess: false,
      successMessage : "",
      showError : false,
      errorMessage: "",
    }
  },
  setup(props) {
    const store = useStore();
    // Computed
    const isLoggedIn = computed(() => store.getters.isLoggedIn);
    const currentVisit = computed(() => store.state.currentVisit);
    const isCurrentPlace = computed(() => currentVisit.value?.place_id === props.place._id);
    const hasAnotherVisit = computed(() => currentVisit.value && !isCurrentPlace.value);
    const geoError = ref(false);
    const isFavorite = computed(() => store.getters.isFavorite(props.place._id));
    const favoriteIconClass = computed(() => {
      return isFavorite.value ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });

    // Méthodes
      // Récupération de la position utilisateur et début du système de visite
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

            props.map.setView([latitude, longitude], 30);
            props.map.fire('start-route', {
              from: { lat: latitude, lng: longitude },
              to: { lat: props.place.coordinates.lat, lng: props.place.coordinates.lng },
              placeId: props.place._id
            });

            axios.post('/api/visit/start', {
              place_id: props.place._id,
              user_lat: latitude,
              user_lng: longitude
            }, {
              withCredentials: true
            })
                .then(() => {
                  this.successMessage = "Visite réussi !";
                  this.showSuccess = true;
                })
                .catch((err) => {
                  console.error("Erreur lors du démarrage de la visite :", err.response?.data || err.message);
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
    // Sauvegarde de la visite en cours et possibilité d'annulation
    const consultRoute = () => {
      const userPos = store.state.userPosition;
      if (!userPos) {
        alert("Position non disponible");
        return;
      }
      props.map.fire('start-route', {
        from: { lat: userPos.lat, lng: userPos.lng },
        to: { lat: props.place.coordinates.lat, lng: props.place.coordinates.lng },
        placeId: props.place._id
      });
    };
    const cancelVisit = () => {
      axios.delete('/api/visit/cancel', { withCredentials: true })
          .then(() => {
            store.commit('clearCurrentVisit');
            alert("Visite annulée.");
          })
          .catch(err => {
            alert(err.response?.data?.message || "Erreur lors de l'annulation.");
          });
    };
    const toggleFavorite = async () => {
      if (!isLoggedIn.value) return;
      const placeId = props.place._id;
      try {
        if (isFavorite.value) {
          await axios.delete(`/api/favorites/${placeId}`, { withCredentials: true });
          store.commit('removeFavorite', placeId);
        } else {
          await axios.post('/api/favorites', { placeId }, { withCredentials: true });
          store.commit('addFavorite', placeId);
        }
      } catch (err) {
        console.error('Erreur lors du toggle favori :', err.response?.data || err.message);
      }
    };
    return {
      isLoggedIn, toggleFavorite, handleVisit, consultRoute, cancelVisit,
      isCurrentPlace, hasAnotherVisit, geoError, favoriteIconClass
    };
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

.place-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  max-width: 300px;
  margin: 0 auto;
}

.action-button {
  flex: 1 1 100px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: #5a3e36;
  color: #fff;
  border: none;
  border-radius: 8px;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.action-button:hover {
  background-color: #7a5147;
}

.action-button.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.action-button.danger {
  background-color: #c0392b;
}

@media (max-width: 500px) {
  .place-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.4rem;
  }
  .action-button {
    max-height: 38px;
    line-height: 1.2;
  }
}


</style>
