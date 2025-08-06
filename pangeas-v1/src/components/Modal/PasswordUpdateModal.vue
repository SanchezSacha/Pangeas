<template>
  <div class="modal-overlay">
    <div class="modal-content p-4 rounded shadow">
      <h3 class="mb-3 text-center">Modifier votre mot de passe</h3>

      <div v-if="successMessage" class="alert alert-success text-center">
        {{ successMessage }}
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">Adresse mail</label>
          <input type="email" class="form-control" v-model="email" />
          <small class="text-danger" v-if="errors.email">{{ errors.email }}</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Mot de passe actuel</label>
          <input type="password" class="form-control" v-model="currentPassword" />
          <small class="text-danger" v-if="errors.currentPassword">{{ errors.currentPassword }}</small>
        </div>

        <div v-if="verified">
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
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button type="button" class="btn btn-danger text-white" @click="$emit('close')">Annuler</button>
          <button type="submit" class="btn text-white" :class="verified ? 'btn-brown' : 'btn-primary'">
            {{ verified ? 'Valider' : 'Suivant' }}
          </button>
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
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      verified: false,
      successMessage: '',
      errors: {}
    };
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  mounted() {
    this.email = this.user?.email || '';
  },
  methods: {
    async handleSubmit() {
      this.errors = {};

      if (!this.verified) {
        try {
          await axios.post('/api/settings/verify-password', {
            email: this.email,
            password: this.currentPassword
          });
          this.verified = true;
        } catch (error) {
          if (error.response?.data?.errors) {
            error.response.data.errors.forEach(err => {
              this.errors[err.field] = err.message;
            });
          } else {
            this.errors.general = 'Erreur inconnue.';
          }
        }
      } else {
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

.btn-brown {
  background-color: var(--color-brown);
  border-color: var(--color-brown);
}
</style>
