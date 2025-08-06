<template>
  <div class="modal-overlay">
    <div class="modal-content p-4 rounded shadow">
      <h3 class="mb-3 text-center title">Modifier votre adresse mail</h3>

      <div v-if="successMessage" class="alert alert-success text-center">
        {{ successMessage }}
      </div>

      <form v-else @submit.prevent="submitForm">
        <div class="mb-3">
          <label class="form-label">Email actuel</label>
          <input type="email" class="form-control" :value="user?.email" disabled />
        </div>

        <div class="mb-3">
          <label class="form-label">Nouvel email</label>
          <input type="email" class="form-control" v-model="newEmail" />
          <small class="text-danger" v-if="errors.newEmail">{{ errors.newEmail }}</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Mot de passe</label>
          <input type="password" class="form-control" v-model="password" />
          <small class="text-danger" v-if="errors.password">{{ errors.password }}</small>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button type="button" class="btn btn-danger text-white" @click="$emit('close')">Annuler</button>
          <button type="submit" class="btn-validate">Valider</button>
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
      newEmail: '',
      password: '',
      errors: {},
      successMessage: ''
    };
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  methods: {
    async submitForm() {
      this.errors = {};
      try {
        const response = await axios.put('api/settings/email', {
          newEmail: this.newEmail,
          password: this.password
        });

        if (response.data.success) {
          this.successMessage = response.data.message;
          this.$store.commit('setUser', {
            ...this.user,
            email: response.data.email
          });
          setTimeout(() => {
            this.$emit('close');
          }, 2000);
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          for (const err of error.response.data.errors) {
            this.errors[err.field] = err.message;
          }
        } else {
          this.errors.general = "Une erreur est survenue.";
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
  border: 3px solid var(--color-brown);
}

.title {
  color: var(--color-brown);
  font-weight: bold;
  padding-bottom: 2rem;
}

label {
  font-weight: bold;
}

.btn-validate {
  background-color: var(--color-brown);
  color: var(--color-white);
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.btn-validate:hover {
  transform: scale(1.05);
}

</style>

