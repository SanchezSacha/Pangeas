<template>
  <div class="modal-overlay">
    <div class="modal-content p-4 rounded shadow">
      <h3 class="mb-3 text-center">Modifier votre mot de passe</h3>

      <div v-if="successMessage" class="alert alert-success text-center">
        {{ successMessage }}
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">Mot de passe actuel</label>
          <input type="password" class="form-control" v-model="currentPassword" />
          <small class="text-danger" v-if="errors.currentPassword">{{ errors.currentPassword }}</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Nouveau mot de passe</label>
          <input type="password" class="form-control" v-model="newPassword" />
          <small class="text-danger" v-if="errors.newPassword">{{ errors.newPassword }}</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Confirmation du mot de passe</label>
          <input type="password" class="form-control" v-model="confirmPassword" />
          <small class="text-danger" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</small>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button type="button" class="btn btn-danger text-white" @click="$emit('close')">Annuler</button>
          <button type="submit" class="btn btn-brown text-white">Valider</button>
        </div>

        <button type="button" class="forgot-password-link" @click="goToForgotPassword">
          Mot de passe oublie ?
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "@/axios.js";

export default {
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      successMessage: '',
      errors: {}
    };
  },
  methods: {
    async handleSubmit() {
      this.errors = {};

      try {
        const response = await axios.put('/api/settings/password', {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword
        });

        if (response.data.success) {
          this.successMessage = response.data.message;
          setTimeout(() => {
            this.$emit('close');
          }, 2000);
        }
      } catch (error) {
        if (error.response?.data?.errors) {
          error.response.data.errors.forEach(err => {
            this.errors[err.field] = err.message;
          });
        } else {
          this.errors.general = 'Erreur serveur.';
        }
      }
    },
    goToForgotPassword() {
      this.$emit('close');
      this.$router.push({ name: 'ForgotPassword' });
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

.btn-brown {
  background-color: var(--color-brown);
  border-color: var(--color-brown);
}

.forgot-password-link {
  display: block;
  margin: 1rem auto 0;
  color: var(--color-blue);
  font-weight: bold;
}
</style>
