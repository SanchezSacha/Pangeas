<template>
  <div class="modal-overlay">
    <div class="modal-content p-4 rounded shadow">
      <h3 class="mb-3 text-center">Confirmation de suppression des données</h3>

      <div v-if="successMessage" class="alert alert-success text-center">
        {{ successMessage }}
      </div>

      <form v-else @submit.prevent="submitDeletion">
        <p class="text-center fw-bold text-danger mb-4">
          Voulez-vous vraiment supprimer vos données personnelles ? <br />
          Cette action est <u>irréversible</u> !
        </p>

        <div class="mb-3">
          <label class="form-label">Adresse mail</label>
          <input type="email" class="form-control" v-model="email" />
          <small class="text-danger" v-if="errors.email">{{ errors.email }}</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Mot de passe</label>
          <input type="password" class="form-control" v-model="password" />
          <small class="text-danger" v-if="errors.password">{{ errors.password }}</small>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button type="button" style="background-color: var(--color-brown);" class="btn text-white" @click="$emit('close')">Annuler</button>
          <button type="submit" class="btn btn-danger text-white">Supprimer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      errors: {},
      successMessage: ''
    };
  },
  computed: {
    ...mapState({ user: state => state.user })
  },
  mounted() {
    if (this.user?.email) this.email = this.user.email;
  },
  methods: {
    async submitDeletion() {
      this.errors = {};
      try {
        const response = await axios.delete('/api/settings/data', {
          data: {
            email: this.email,
            password: this.password
          },
          withCredentials: true
        });

        if (response.data.success) {
          this.successMessage = response.data.message;

          // (Optionnel) : reset du store si tu gères les stats/favoris côté front
          this.$store.commit('setFavorites', []);
          this.$store.commit('clearCurrentVisit');
          this.$store.commit('setUserPosition', null);

          setTimeout(() => {
            this.$emit('close');
          }, 2000);
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          for (const err of error.response.data.errors) {
            this.errors[err.field] = err.message;
          }
        } else if (error.response?.data?.message) {
          this.errors.general = error.response.data.message;
        } else {
          this.errors.general = "Erreur inconnue.";
        }
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  background-color: var(--color-beige);
  border: 2px solid var(--color-brown);
}
</style>
