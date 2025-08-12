<template>
  <div class="page-wrapper">
    <div class="form-card shadow rounded p-4">
      <h2 class="mb-4 text-center">Modifier utilisateur</h2>

      <div v-if="loading" class="alert alert-info">Chargement...</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <form v-if="!loading" @submit.prevent="submitForm" class="form-content">
        <div class="mb-3">
          <label for="pseudo" class="form-label">Pseudo</label>
          <input
              id="pseudo"
              v-model="user.pseudo"
              type="text"
              class="form-control"
              required
              minlength="3"
          />
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
              id="email"
              v-model="user.email"
              type="email"
              class="form-control"
              required
          />
        </div>

        <div class="mb-3">
          <label for="role" class="form-label">Rôle</label>
          <select
              id="role"
              v-model="user.role"
              class="form-select"
              required
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary me-2" :disabled="submitting">
          {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="goBack" :disabled="submitting">
          Retour
        </button>
      </form>
    </div>
  </div>
</template>


<script>
import axios from '@/axios';

export default {
  name: 'UpdateUsersAdmin',
  data() {
    return {
      user: {
        pseudo: '',
        email: '',
        role: 'user',
      },
      loading: true,
      submitting: false,
      error: '',
      success: '',
    };
  },
  async created() {
    const userId = this.$route.params.id;
    try {
      const res = await axios.get(`/api/admin/users/${userId}`, { withCredentials: true });
      const data = res.data;
      this.user.pseudo = data.pseudo || '';
      this.user.email = data.email || '';
      this.user.role = data.role || 'user';
    } catch (err) {
      this.error = 'Erreur lors du chargement de l’utilisateur.';
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async submitForm() {
      this.error = '';
      this.success = '';
      this.submitting = true;

      const userId = this.$route.params.id;
      try {
        await axios.put(`/api/admin/users/${userId}`, {
          pseudo: this.user.pseudo,
          email: this.user.email,
          role: this.user.role,
        }, { withCredentials: true });

        this.success = 'Utilisateur mis à jour avec succès.';
      } catch (err) {
        this.error = err.response?.data?.error || 'Erreur lors de la mise à jour.';
        console.error(err);
      } finally {
        this.submitting = false;
      }
    },
    goBack() {
      this.$router.push({ name: 'AdminUsers' });
    },
  },
};
</script>

<style scoped>
.page-wrapper {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  background-color: var(--bs-light, #f8f9fa);
}

.form-card {
  width: 100%;
  max-width: 600px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 0.5rem;
}

.form-content {
  width: 100%;
}
</style>

