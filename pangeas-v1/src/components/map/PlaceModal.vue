<template>
  <div class="popup-card">
    <button class="popup-fav" @click="toggleFavorite" :disabled="!isLoggedIn" :class="{ active: isFavorite, 'fav-disabled': !isLoggedIn }">
      <i :class="favoriteIconClass + ' popup-icon'"></i>
    </button>

    <h5>{{ place.name }}</h5>
    <div class="popup-meta-row">
      <span v-if="place.category" class="popup-badge">{{ place.category }}</span>
      <span class="popup-meta">{{ place.department }} • {{ place.distance_km }} km</span>
    </div>
    <img :src="place.image_url" loading="lazy" :alt="place.name" class="popup-img" />
    <div class="place-actions">
      <button class="action-button" v-if="source !== 'favorites'" :class="{ 'disabled': !isLoggedIn || hasAnotherVisit }" :disabled="!isLoggedIn || hasAnotherVisit" @click="isCurrentPlace ? consultRoute() : handleVisit()">
        {{ isCurrentPlace ? 'Consulter l’itinéraire' : 'Visiter' }}
      </button>
      <button v-if="isCurrentPlace" class="action-button danger" @click="cancelVisit">Annuler</button>
      <button class="action-button" @click="goToDetail">Détails</button>
    </div>

    <p v-if="!isLoggedIn" class="popup-message error">
      Connectez-vous pour débloquer toutes les fonctionnalités.
    </p>
    <p v-if="geoError" class="popup-message error">
      La géolocalisation est requise pour valider la visite.
    </p>
    <SuccessPopup v-if="showSuccess" :message="successMessage"/>
    <ErrorPopup v-if="showError" :message="errorMessage" @closed="showError = false"/>
  </div>
</template>

<script>
import {computed, ref} from 'vue';
import { useStore } from 'vuex';
import SuccessPopup from "../modal/SuccessPopup.vue";
import ErrorPopup from "../modal/ErrorPopup.vue";
import router from "../../router/index.js";
import {
  cancelVisitOfflineAware,
  setFavoriteOfflineAware,
  startVisitOfflineAware
} from '@/services/offlineService';

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
  setup(props) {
    const store = useStore();
    const showSuccess = ref(false);
    const successMessage = ref("");
    const showError = ref(false);
    const errorMessage = ref("");
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

            startVisitOfflineAware({
              place_id: props.place._id,
              user_lat: latitude,
              user_lng: longitude
            })
                .then(({ queued }) => {
                  successMessage.value = queued
                      ? "Visite enregistrée hors ligne. Elle sera synchronisée automatiquement."
                      : "Visite commencée avec succès";
                  showSuccess.value = true;
                })
                .catch((err) => {
                  errorMessage.value = err.response?.data?.message || "Erreur lors du démarrage de la visite.";
                  showError.value = true;
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
    // Sauvegarde de la visite en cours
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
      cancelVisitOfflineAware()
          .then(({ queued }) => {
            props.map.fire('cancel-route');
            successMessage.value = queued
                ? "Annulation enregistrée hors ligne."
                : "Visite annulée";
            showSuccess.value = true;
          })
          .catch(err => {
            errorMessage.value = err.response?.data?.message || "Erreur lors de l'annulation.";
            showError.value = true;
          });
    };

    const toggleFavorite = async () => {
      if (!isLoggedIn.value) return;
      const placeId = props.place._id;
      try {
        await setFavoriteOfflineAware(placeId, !isFavorite.value);
      } catch (err) {
        console.error('Erreur lors du toggle favori :', err.response?.data || err.message);
      }
    };
    const goToDetail = () => {
      router.push(`/lieux/${props.place._id}`);
    };
    return {
      isLoggedIn, toggleFavorite, handleVisit, consultRoute, cancelVisit, goToDetail,
      isCurrentPlace, hasAnotherVisit, geoError, favoriteIconClass, showSuccess, successMessage, showError, errorMessage
    };
  },
};
</script>

