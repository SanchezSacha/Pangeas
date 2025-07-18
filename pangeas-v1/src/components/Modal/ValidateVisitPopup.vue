<template>
  <div class="popup-validation card shadow border-0 p-3">
    <div class="card-body text-center">
      <h5 class="card-title mb-3 text-success fw-bold">
        Félicitations !
      </h5>
      <p class="card-text mb-4">
        Vous êtes arrivé à destination !
      </p>
      <button class="btn btn-success btn-lg w-100" @click="confirmVisit">
        Confirmer la visite
      </button>
    </div>
    <SuccessPopup v-if="showSuccess" :message="successMessage" @closed="handleSuccessClosed"/>
    <ErrorPopup v-if="showError" :message="errorMessage" @closed="showError = false"/>
  </div>
</template>

<script>
import axios from "axios";
import SuccessPopup from "../Modal/SuccessPopup.vue";
import ErrorPopup from "../Modal/ErrorPopup.vue";

export default {
  props: ['placeId', 'userCoords'],
  components: {
    SuccessPopup,
    ErrorPopup
  },
  emits: ['close'],
  data() {
    return {
      showSuccess: false,
      successMessage: '',
      showError: false,
      errorMessage: '',

    };
  },
  methods: {
    async confirmVisit() {
      try {
        const res = await axios.post('/api/visit/validate', {
          place_id: this.placeId,
          user_lat: this.userCoords.latitude,
          user_lng: this.userCoords.longitude
        }, { withCredentials: true });

        this.successMessage = "Visite validée !";
        this.showSuccess = true;
      } catch (err) {
        this.errorMessage = "Erreur lors de la validation";
        this.showError = true
      }
    },
    handleSuccessClosed() {
      this.$emit('close');
      window.location.href = '/';
    }
  }
};
</script>

<style scoped>
.popup-validation {
  max-width: 300px;
  border-radius: 1rem;
  background-color: var(--color-beige);
}

@media (max-width: 576px) {
  .popup-validation {
    width: 100%;
    margin: 0 auto;
  }
}
</style>
